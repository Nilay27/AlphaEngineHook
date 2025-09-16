require('dotenv').config({ path: '.env.local' });

// Disable TLS certificate validation for development if needed
if (process.env.DISABLE_SSL_VALIDATION === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { Pool } = require('pg');

// Create connection pool with SSL for PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: process.env.DISABLE_SSL_VALIDATION !== 'true'
  }
});

async function migrateFreelancerName() {
  let client;
  
  try {
    console.log('Connecting to PostgreSQL database...');
    console.log(`Using connection string: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')}`);
    
    client = await pool.connect();
    
    console.log('Connected successfully. Starting migration...');
    
    // Check if the 'freelancer' table exists
    const tableCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'freelancer'
      );
    `);
    
    if (!tableCheckResult.rows[0].exists) {
      console.log("Freelancer table doesn't exist yet. No migration needed.");
      return;
    }
    
    // Scenario 1: Check if the 'name' column exists
    const nameColumnCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'freelancer' 
        AND column_name = 'name'
      );
    `);
    
    const hasNameColumn = nameColumnCheckResult.rows[0].exists;
    
    // Scenario 2: Check if the 'freelancer_name' column exists
    const freelancerNameColumnCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'freelancer' 
        AND column_name = 'freelancer_name'
      );
    `);
    
    const hasFreelancerNameColumn = freelancerNameColumnCheckResult.rows[0].exists;
    
    // Perform the migration based on the current state
    if (hasNameColumn && !hasFreelancerNameColumn) {
      // Scenario 1: We have 'name' but no 'freelancer_name' - rename the column
      console.log("Renaming 'name' column to 'freelancer_name'...");
      
      // Start a transaction for safety
      await client.query('BEGIN');
      
      // Rename the column
      await client.query(`
        ALTER TABLE freelancer
        RENAME COLUMN name TO freelancer_name;
      `);
      
      // Commit the changes
      await client.query('COMMIT');
      
      console.log("Column renamed successfully.");
    } else if (hasFreelancerNameColumn && !hasNameColumn) {
      // Scenario 2: We have 'freelancer_name' but no 'name' - no action needed
      console.log("Column 'freelancer_name' already exists. No migration needed.");
    } else if (hasNameColumn && hasFreelancerNameColumn) {
      // Scenario 3: We have both columns - migrate data and drop 'name'
      console.log("Both 'name' and 'freelancer_name' columns exist. Migrating data...");
      
      // Start a transaction
      await client.query('BEGIN');
      
      // Copy data from name to freelancer_name if freelancer_name is empty
      await client.query(`
        UPDATE freelancer
        SET freelancer_name = name
        WHERE freelancer_name IS NULL OR freelancer_name = '';
      `);
      
      // Drop the 'name' column
      await client.query(`
        ALTER TABLE freelancer
        DROP COLUMN name;
      `);
      
      // Commit the changes
      await client.query('COMMIT');
      
      console.log("Data migrated and 'name' column dropped successfully.");
    } else {
      // Scenario 4: Neither column exists - create 'freelancer_name'
      console.log("Neither 'name' nor 'freelancer_name' column exists. Creating 'freelancer_name'...");
      
      // Start a transaction
      await client.query('BEGIN');
      
      // Add the freelancer_name column
      await client.query(`
        ALTER TABLE freelancer
        ADD COLUMN freelancer_name TEXT NOT NULL DEFAULT '';
      `);
      
      // Commit the changes
      await client.query('COMMIT');
      
      console.log("Column 'freelancer_name' created successfully.");
    }
    
    // Verify the schema after migration
    const columnsAfterMigration = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'freelancer'
      ORDER BY ordinal_position;
    `);
    
    console.log("Freelancer table columns after migration:");
    columnsAfterMigration.rows.forEach(column => {
      console.log(`- ${column.column_name}`);
    });
    
    console.log('Migration completed successfully!');
    
  } catch (err) {
    console.error('Error during migration:', err);
    
    // If an error occurs during a transaction, roll it back
    if (client) {
      try {
        await client.query('ROLLBACK');
        console.log('Transaction rolled back due to error.');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
    }
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

migrateFreelancerName(); 