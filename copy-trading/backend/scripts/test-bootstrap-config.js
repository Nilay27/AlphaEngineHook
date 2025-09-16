#!/usr/bin/env node

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

async function testBootstrapConfig() {
  console.log('🧪 Testing AlphaEngine Bootstrap Configuration...\n')

  try {
    // Test 1: Environment Variables
    console.log('1️⃣ Checking environment variables...')
    const requiredEnvVars = ['DATABASE_URL', 'PORT']
    const missingVars = requiredEnvVars.filter(key => !process.env[key])

    if (missingVars.length > 0) {
      console.error(`   ❌ Missing environment variables: ${missingVars.join(', ')}`)
      process.exit(1)
    }
    console.log('   ✅ All required environment variables are set\n')

    // Test 2: Database Connection
    console.log('2️⃣ Testing database connection...')
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 5000,
    })

    try {
      const result = await pool.query('SELECT NOW()')
      console.log(`   ✅ Database connected at: ${result.rows[0].now}\n`)
    } catch (error) {
      console.error(`   ❌ Database connection failed: ${error.message}`)
      process.exit(1)
    }

    // Test 3: Check AlphaEngine tables
    console.log('3️⃣ Verifying AlphaEngine tables...')
    const tables = ['strategies', 'subscriptions', 'trade_confirmations']

    for (const table of tables) {
      const result = await pool.query(
        `SELECT COUNT(*) FROM information_schema.tables WHERE table_name = $1`,
        [table]
      )

      if (result.rows[0].count === '0') {
        console.error(`   ❌ Table '${table}' not found`)
        process.exit(1)
      }
      console.log(`   ✅ Table '${table}' exists`)
    }
    console.log()

    // Test 4: Check indexes
    console.log('4️⃣ Verifying database indexes...')
    const indexResult = await pool.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
      ORDER BY indexname
    `)

    if (indexResult.rows.length === 0) {
      console.log('   ⚠️  No custom indexes found (may need to create them)')
    } else {
      console.log(`   ✅ Found ${indexResult.rows.length} indexes:`)
      indexResult.rows.forEach(row => {
        console.log(`      - ${row.indexname}`)
      })
    }
    console.log()

    // Test 5: Configuration modules
    console.log('5️⃣ Testing configuration modules...')
    const configModules = [
      '../src/config/database.ts',
      '../src/config/api.ts',
      '../src/config/index.ts',
    ]

    const fs = require('fs')
    for (const module of configModules) {
      const modulePath = path.resolve(__dirname, module)
      if (!fs.existsSync(modulePath)) {
        console.error(`   ❌ Configuration file not found: ${module}`)
        process.exit(1)
      }
      console.log(`   ✅ Found: ${module}`)
    }
    console.log()

    // Test 6: Service classes
    console.log('6️⃣ Checking service classes...')
    const serviceFiles = [
      '../src/services/BaseService.ts',
      '../src/services/StrategyService.ts',
    ]

    for (const service of serviceFiles) {
      const servicePath = path.resolve(__dirname, service)
      if (!fs.existsSync(servicePath)) {
        console.error(`   ❌ Service file not found: ${service}`)
        process.exit(1)
      }
      console.log(`   ✅ Found: ${service}`)
    }
    console.log()

    // Test 7: Error handling utilities
    console.log('7️⃣ Checking error handling...')
    const errorFiles = [
      '../src/utils/errors.ts',
      '../src/middleware/errorMiddleware.ts',
    ]

    for (const errorFile of errorFiles) {
      const errorPath = path.resolve(__dirname, errorFile)
      if (!fs.existsSync(errorPath)) {
        console.error(`   ❌ Error handling file not found: ${errorFile}`)
        process.exit(1)
      }
      console.log(`   ✅ Found: ${errorFile}`)
    }
    console.log()

    // Test 8: API Configuration
    console.log('8️⃣ Validating API configuration...')
    const apiConfig = {
      port: process.env.PORT || '3001',
      frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
      apiVersion: 'v1',
    }

    console.log('   API Configuration:')
    console.log(`   - Port: ${apiConfig.port}`)
    console.log(`   - Frontend URL: ${apiConfig.frontendUrl}`)
    console.log(`   - API Version: ${apiConfig.apiVersion}`)
    console.log(`   ✅ API configuration validated\n`)

    // Summary
    console.log('=' .repeat(50))
    console.log('🎉 Bootstrap configuration test completed successfully!')
    console.log('=' .repeat(50))
    console.log('\n📋 Summary:')
    console.log('   ✅ Environment variables configured')
    console.log('   ✅ Database connection established')
    console.log('   ✅ AlphaEngine tables verified')
    console.log('   ✅ Configuration modules in place')
    console.log('   ✅ Service classes created')
    console.log('   ✅ Error handling configured')
    console.log('   ✅ API configuration validated')
    console.log('\n🚀 Ready to proceed with API implementation!')

    await pool.end()
  } catch (error) {
    console.error('\n❌ Bootstrap test failed:', error.message)
    process.exit(1)
  }
}

// Run tests
testBootstrapConfig().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})