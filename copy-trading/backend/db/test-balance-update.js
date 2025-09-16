// db/test-balance-update.js
require('dotenv').config({ path: '.env.local' });

// Disable TLS certificate validation for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');
const { randomUUID } = require('crypto');

// Create connection pool with SSL for DigitalOcean PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testBalanceUpdate() {
  let client;
  try {
    console.log('Connecting to database...');
    console.log(`Using connection string: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);
    
    client = await pool.connect();
    
    // Make sure UUID extension is enabled
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    
    console.log('Connected successfully. Testing user balance operations...');

    const testWalletAddress = '0xf73b452fa361f3403b20a35c4650f69916c3274a';
    const testWalletEns = 'consentsam';
    
    // First check if record exists
    const existingRecord = await client.query(`
      SELECT * FROM user_balances 
      WHERE user_id = $1
    `, [testWalletAddress.toLowerCase()]);

    console.log(`Found ${existingRecord.rows.length} existing records for wallet address ${testWalletAddress}`);
    
    if (existingRecord.rows.length > 0) {
      console.log('Existing record:', existingRecord.rows[0]);
      
      // Update existing record
      console.log('Updating balance...');
      await client.query(`
        UPDATE user_balances 
        SET balance = balance + 10, 
            wallet_ens = $1
        WHERE user_id = $2
      `, [testWalletEns.toLowerCase(), testWalletAddress.toLowerCase()]);
    } else {
      // Insert new record using uuid-ossp
      console.log('Inserting new balance record...');
      await client.query(`
        INSERT INTO user_balances (id, user_id, wallet_ens, balance, updated_at)
        VALUES (uuid_generate_v4(), $1, $2, 10, NOW())
      `, [testWalletAddress.toLowerCase(), testWalletEns.toLowerCase()]);
    }
    
    // Check updated record
    const updatedRecord = await client.query(`
      SELECT * FROM user_balances 
      WHERE user_id = $1
    `, [testWalletAddress.toLowerCase()]);
    
    console.log('Updated record:', updatedRecord.rows[0]);
    console.log('Test completed successfully!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testBalanceUpdate(); 