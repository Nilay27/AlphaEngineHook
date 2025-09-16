require('dotenv').config({ path: '.env.local' });

// Disable TLS certificate validation for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');

// Create connection pool with SSL for DigitalOcean PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // For DigitalOcean, we need to specify sslmode=require in the connection string
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSchema() {
  try {
    console.log('Connecting to DigitalOcean PostgreSQL database...');
    console.log(`Using connection string: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);
    
    const client = await pool.connect();
    
    console.log('Connected successfully. Checking schema...');
    
    // Check if tables exist
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    
    console.log('Tables found in database:');
    if (result.rows.length === 0) {
      console.log('No tables found. You may need to create the schema.');
    } else {
      result.rows.forEach(row => {
        console.log(`- ${row.tablename}`);
      });
    }
    
    // Check required tables
    const requiredTables = [
      'projects',
      'company',
      'freelancer',
      'skills',
      'courses'
    ];
    
    console.log('\nChecking for required tables:');
    const missingTables = [];
    
    for (const table of requiredTables) {
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename = $1
        );
      `, [table]);
      
      const exists = tableCheck.rows[0].exists;
      console.log(`- ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
      
      if (!exists) {
        missingTables.push(table);
      }
    }
    
    if (missingTables.length > 0) {
      console.log('\nWARNING: The following required tables are missing:');
      missingTables.forEach(table => console.log(`- ${table}`));
      console.log('\nYou need to create these tables before the application will work properly.');
    } else {
      console.log('\nAll required tables exist!');
    }
    
    client.release();
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    await pool.end();
  }
}

checkSchema(); 