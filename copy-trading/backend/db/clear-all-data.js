require('dotenv').config({ path: '.env.local' });

// Disable TLS certificate validation for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/alphaengine',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function clearAllData() {
  const client = await pool.connect();

  try {
    console.log('🗑️  Clearing all database data...');
    console.log(`📍 Database: ${(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/alphaengine').replace(/:[^:]*@/, ':****@')}`);

    // Start transaction
    await client.query('BEGIN');

    // List of tables to clear (in order to handle foreign key constraints)
    const tables = [
      'trade_confirmations',
      'subscriptions',
      'strategies',
      'alpha_generators',
      'address_mappings',
      'protocols',
      'user_balances'
    ];

    console.log('\n📊 Checking current data counts:');
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   ${table}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`   ${table}: Table doesn't exist or error`);
      }
    }

    console.log('\n🧹 Clearing tables:');
    for (const table of tables) {
      try {
        const result = await client.query(`DELETE FROM ${table}`);
        console.log(`   ✅ Cleared ${table} (${result.rowCount} rows deleted)`);
      } catch (error) {
        console.log(`   ⚠️  Skipped ${table}: ${error.message}`);
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    console.log('\n✅ All data cleared successfully!');

    // Verify all tables are empty
    console.log('\n📊 Final data counts:');
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   ${table}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`   ${table}: Table doesn't exist or error`);
      }
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error clearing data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the clear function
clearAllData()
  .then(() => {
    console.log('\n🎉 Database cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed to clear database:', error);
    process.exit(1);
  });