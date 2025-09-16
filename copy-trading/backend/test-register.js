// test-register.js
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

async function testRegisterFreelancer() {
  let client;
  
  try {
    console.log('Connecting to PostgreSQL database...');
    console.log(`Using connection string: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')}`);
    
    client = await pool.connect();
    
    console.log('Connected successfully. Testing freelancer registration...');
    
    // Generate a unique wallet address for testing
    const testWalletAddress = `0x${Math.random().toString(16).substring(2, 42).padEnd(40, '0')}`;
    const testName = 'Test Freelancer';
    const testSkills = 'JavaScript, React, Web3';
    
    console.log(`Using test wallet address: ${testWalletAddress}`);
    
    // Insert a test freelancer directly into the database
    const insertResult = await client.query(`
      INSERT INTO freelancer (
        wallet_address, 
        name, 
        skills,
        profile_pic_url
      ) 
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [testWalletAddress, testName, testSkills, 'https://example.com/profile.jpg']);
    
    if (insertResult.rows.length > 0) {
      console.log('Successfully inserted test freelancer:');
      console.log(JSON.stringify(insertResult.rows[0], null, 2));
      
      // Verify we can retrieve the freelancer
      const selectResult = await client.query(`
        SELECT * FROM freelancer WHERE wallet_address = $1;
      `, [testWalletAddress]);
      
      if (selectResult.rows.length > 0) {
        console.log('Successfully retrieved test freelancer:');
        console.log(JSON.stringify(selectResult.rows[0], null, 2));
      } else {
        console.error('Failed to retrieve test freelancer!');
      }
      
      // Clean up by deleting the test freelancer
      await client.query(`
        DELETE FROM freelancer WHERE wallet_address = $1;
      `, [testWalletAddress]);
      
      console.log('Test freelancer deleted successfully.');
    } else {
      console.error('Failed to insert test freelancer!');
    }
    
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testRegisterFreelancer(); 