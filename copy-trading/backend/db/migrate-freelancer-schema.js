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

async function migrateFreelancerSchema() {
  let client;
  
  try {
    console.log('Connecting to PostgreSQL database...');
    console.log(`Using connection string: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')}`);
    
    client = await pool.connect();
    
    console.log('Connected successfully. Starting schema migration...');
    
    // Check if the 'freelancer' table exists
    const tableCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'freelancer'
      );
    `);
    
    if (!tableCheckResult.rows[0].exists) {
      console.log("Freelancer table doesn't exist yet. Creating it...");
      
      // Create the freelancer table with all required columns
      await client.query(`
        CREATE TABLE freelancer (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          wallet_address TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          skills TEXT,
          profile_pic_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `);
      
      console.log("Freelancer table created successfully.");
      return;
    }
    
    // Check for missing columns and add them if needed
    
    // Check for skills column
    const skillsColumnCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'freelancer' 
        AND column_name = 'skills'
      );
    `);
    
    if (!skillsColumnCheckResult.rows[0].exists) {
      console.log("Adding 'skills' column to freelancer table...");
      await client.query(`
        ALTER TABLE freelancer 
        ADD COLUMN skills TEXT;
      `);
      console.log("'skills' column added successfully.");
    } else {
      console.log("'skills' column already exists.");
    }
    
    // Check for profile_pic_url column
    const profilePicUrlColumnCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'freelancer' 
        AND column_name = 'profile_pic_url'
      );
    `);
    
    if (!profilePicUrlColumnCheckResult.rows[0].exists) {
      console.log("Adding 'profile_pic_url' column to freelancer table...");
      await client.query(`
        ALTER TABLE freelancer 
        ADD COLUMN profile_pic_url TEXT;
      `);
      console.log("'profile_pic_url' column added successfully.");
    } else {
      console.log("'profile_pic_url' column already exists.");
    }
    
    // Check for updated_at column
    const updatedAtColumnCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'freelancer' 
        AND column_name = 'updated_at'
      );
    `);
    
    if (!updatedAtColumnCheckResult.rows[0].exists) {
      console.log("Adding 'updated_at' column to freelancer table...");
      await client.query(`
        ALTER TABLE freelancer 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
      `);
      console.log("'updated_at' column added successfully.");
    } else {
      console.log("'updated_at' column already exists.");
    }
    
    console.log('Migration completed successfully!');
    
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

migrateFreelancerSchema(); 