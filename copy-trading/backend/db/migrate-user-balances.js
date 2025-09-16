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

async function migrateUserBalances() {
  let client;
  try {
    console.log('Connecting to database...');
    console.log(`Using connection string: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);
    
    client = await pool.connect();
    
    console.log('Connected successfully. Checking user_balances table...');

    // Check if the table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_balances'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('Creating user_balances table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_balances (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          wallet_address TEXT NOT NULL,
          wallet_ens TEXT NOT NULL, 
          balance NUMERIC(12, 2) DEFAULT 0,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `);
      console.log('user_balances table created successfully!');
      return;
    }

    // Check if wallet_ens column exists
    const columnExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user_balances' AND column_name = 'wallet_ens'
      );
    `);

    if (!columnExists.rows[0].exists) {
      console.log('Adding wallet_ens column to user_balances table...');
      
      // Add the wallet_ens column
      await client.query(`
        ALTER TABLE user_balances
        ADD COLUMN wallet_ens TEXT;
      `);
      
      // Update existing rows to set wallet_ens = wallet_address temporarily
      await client.query(`
        UPDATE user_balances
        SET wallet_ens = wallet_address
        WHERE wallet_ens IS NULL;
      `);
      
      // Make wallet_ens NOT NULL after data is migrated
      await client.query(`
        ALTER TABLE user_balances
        ALTER COLUMN wallet_ens SET NOT NULL;
      `);
      
      console.log('wallet_ens column added successfully!');
    } else {
      console.log('wallet_ens column already exists. No migration needed.');
    }

    console.log('Migration complete!');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

migrateUserBalances();
