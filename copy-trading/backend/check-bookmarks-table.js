// Script to check the bookmarks table structure
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

async function checkBookmarksTable() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if bookmarks table exists
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'bookmarks'
      );
    `);
    
    if (!tableResult.rows[0].exists) {
      console.error('Bookmarks table does not exist');
      return;
    }
    
    console.log('Bookmarks table exists');
    
    // Check table structure
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bookmarks';
    `);
    
    console.log('Bookmarks table structure:');
    console.table(columnsResult.rows);
    
    // Check actual data
    const dataResult = await client.query(`
      SELECT * FROM bookmarks LIMIT 5;
    `);
    
    console.log(`\nBookmarks data (${dataResult.rowCount} rows):`);
    console.table(dataResult.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

checkBookmarksTable(); 