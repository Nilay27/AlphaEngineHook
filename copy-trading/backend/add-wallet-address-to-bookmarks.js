// Script to add wallet_address column to bookmarks table
const { Client } = require('pg');
require('dotenv').config();

// Disable SSL validation (only for development)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Get connection string from environment
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('Using connection string:', connectionString.replace(/:[^:@]+@/, ':***@'));
console.log('SSL validation disabled for this script');

// Create client
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addWalletAddressColumn() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if column exists
    const checkColumnQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'bookmarks' AND column_name = 'wallet_address'
      );
    `;
    
    const columnResult = await client.query(checkColumnQuery);
    
    if (columnResult.rows[0].exists) {
      console.log('wallet_address column already exists, no need to add it');
      return;
    }
    
    // Add the column
    console.log('Adding wallet_address column to bookmarks table...');
    const addColumnQuery = `
      ALTER TABLE bookmarks
      ADD COLUMN wallet_address TEXT;
    `;
    
    await client.query(addColumnQuery);
    console.log('Successfully added wallet_address column');
    
    // Check table structure after the change
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bookmarks';
    `);
    
    console.log('Updated bookmarks table structure:');
    console.table(columnsResult.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

addWalletAddressColumn(); 