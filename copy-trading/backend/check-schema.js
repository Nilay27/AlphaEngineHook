// check-schema.js
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

async function checkFreelancerSchema() {
  let client;
  
  try {
    console.log('Connecting to PostgreSQL database...');
    console.log(`Using connection string: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')}`);
    
    client = await pool.connect();
    
    console.log('Connected successfully. Checking freelancer table schema...');
    
    // Get the column information for the freelancer table
    const columnResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'freelancer'
      ORDER BY ordinal_position;
    `);
    
    console.log('Freelancer table columns:');
    columnResult.rows.forEach(column => {
      console.log(`- ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
    });
    
    // Check if there are any rows in the freelancer table
    const countResult = await client.query(`
      SELECT COUNT(*) FROM freelancer;
    `);
    
    console.log(`\nTotal freelancer records: ${countResult.rows[0].count}`);
    
    // If there are rows, show a sample
    if (parseInt(countResult.rows[0].count) > 0) {
      const sampleResult = await client.query(`
        SELECT * FROM freelancer LIMIT 1;
      `);
      
      console.log('\nSample freelancer record:');
      console.log(JSON.stringify(sampleResult.rows[0], null, 2));
    }
    
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

checkFreelancerSchema(); 