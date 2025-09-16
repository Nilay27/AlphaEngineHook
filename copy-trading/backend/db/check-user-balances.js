require('dotenv').config({ path: '.env.local' });

// Disable TLS certificate validation for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');

// Create connection pool with SSL for DigitalOcean PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTable() {
  let client;
  try {
    console.log('Connecting to database...');
    console.log(`Using connection string: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);
    
    client = await pool.connect();
    
    console.log('Connected successfully. Checking user_balances table structure...');

    // Check the table structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user_balances'
      ORDER BY ordinal_position;
    `);

    if (tableInfo.rows.length === 0) {
      console.log('The user_balances table does not exist or has no columns.');
    } else {
      console.log('user_balances table structure:');
      console.table(tableInfo.rows);
    }
  } catch (err) {
    console.error('Error checking table structure:', err);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

checkTable(); 