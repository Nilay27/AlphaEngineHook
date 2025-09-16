#!/usr/bin/env node

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

async function setupDatabase() {
  console.log('🚀 Setting up AlphaEngine database...\n')

  // Parse database URL
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env.local')
    process.exit(1)
  }

  // Extract database name from URL (handle both with and without password)
  let urlParts = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  let user, password, host, port, database

  if (urlParts) {
    // Format with password
    [, user, password, host, port, database] = urlParts
  } else {
    // Format without password
    urlParts = databaseUrl.match(/postgresql:\/\/([^@]+)@([^:]+):(\d+)\/(.+)/)
    if (!urlParts) {
      console.error('❌ Invalid DATABASE_URL format')
      process.exit(1)
    }
    [, user, host, port, database] = urlParts
    password = ''
  }

  // First connect without database to create it if needed
  const adminPool = new Pool({
    user,
    password,
    host,
    port,
    database: 'postgres', // Connect to default postgres database
  })

  try {
    // Check if database exists
    const dbCheckResult = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [database]
    )

    if (dbCheckResult.rowCount === 0) {
      console.log(`📦 Creating database '${database}'...`)
      await adminPool.query(`CREATE DATABASE ${database}`)
      console.log(`✅ Database '${database}' created successfully\n`)
    } else {
      console.log(`✅ Database '${database}' already exists\n`)
    }
  } catch (error) {
    console.error('❌ Error checking/creating database:', error.message)
    process.exit(1)
  } finally {
    await adminPool.end()
  }

  // Now connect to the AlphaEngine database
  const pool = new Pool({
    connectionString: databaseUrl,
  })

  try {
    // Test connection
    await pool.query('SELECT NOW()')
    console.log('✅ Connected to AlphaEngine database\n')

    // Read and execute migration file
    const migrationPath = path.join(__dirname, '../db/migrations/001_create_alphaengine_tables.sql')

    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath)
      process.exit(1)
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('📝 Running migrations...')
    await pool.query(migrationSQL)
    console.log('✅ Migrations completed successfully\n')

    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('strategies', 'subscriptions', 'trade_confirmations')
      ORDER BY table_name
    `)

    console.log('📊 AlphaEngine tables created:')
    tablesResult.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`)
    })

    // Show table structures
    console.log('\n📋 Table structures:')

    for (const tableName of ['strategies', 'subscriptions', 'trade_confirmations']) {
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName])

      console.log(`\n   ${tableName}:`)
      columnsResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : ''
        console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`)
      })
    }

    console.log('\n🎉 AlphaEngine database setup completed successfully!')

  } catch (error) {
    console.error('❌ Error during setup:', error.message)
    console.error(error.detail || '')
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run setup
setupDatabase().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})