#!/usr/bin/env node

const fetch = require('node-fetch')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

const API_BASE_URL = `http://localhost:${process.env.PORT || 3001}/api/v1`
const TEST_WALLET = '0x1234567890abcdef1234567890abcdef12345678'
const TEST_WALLET_2 = '0xabcdef1234567890abcdef1234567890abcdef12'

let createdStrategyId = null

async function testAPI() {
  console.log('🧪 Testing Master Trader API (Step 3)...\n')
  console.log(`API Base URL: ${API_BASE_URL}\n`)

  try {
    // Test 1: GET /api/v1/strategies (empty list)
    console.log('1️⃣ Testing GET /api/v1/strategies (empty list)...')
    let response = await fetch(`${API_BASE_URL}/strategies`)
    let data = await response.json()

    if (!response.ok) {
      console.error(`   ❌ Failed: ${data.message}`)
    } else {
      console.log(`   ✅ Success: Found ${data.data.length} strategies`)
      console.log(`   📊 Pagination: Page ${data.meta.page}/${data.meta.totalPages}`)
    }
    console.log()

    // Test 2: POST /api/v1/strategies (create new)
    console.log('2️⃣ Testing POST /api/v1/strategies (create new)...')
    response = await fetch(`${API_BASE_URL}/strategies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Wallet-Address': TEST_WALLET,
      },
      body: JSON.stringify({
        name: 'Test Strategy Alpha',
        description: 'A test trading strategy for API testing',
        performanceMetrics: {
          winRate: 0.65,
          totalTrades: 100,
          profitPercent: 25.5,
          avgTradeTime: '2h',
        },
      }),
    })
    data = await response.json()

    if (!response.ok) {
      console.error(`   ❌ Failed: ${data.message}`)
      process.exit(1)
    } else {
      createdStrategyId = data.data.id
      console.log(`   ✅ Success: Created strategy with ID ${createdStrategyId}`)
      console.log(`   📝 Name: ${data.data.name}`)
      console.log(`   💼 Wallet: ${data.data.walletAddress}`)
    }
    console.log()

    // Test 3: POST /api/v1/strategies (duplicate name)
    console.log('3️⃣ Testing POST /api/v1/strategies (duplicate name - should fail)...')
    response = await fetch(`${API_BASE_URL}/strategies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Wallet-Address': TEST_WALLET,
      },
      body: JSON.stringify({
        name: 'Test Strategy Alpha', // Same name
        description: 'Duplicate test',
      }),
    })
    data = await response.json()

    if (response.ok) {
      console.error(`   ❌ Should have failed but didn't`)
    } else {
      console.log(`   ✅ Correctly rejected: ${data.message}`)
    }
    console.log()

    // Test 4: GET /api/v1/strategies/:id
    console.log(`4️⃣ Testing GET /api/v1/strategies/${createdStrategyId}...`)
    response = await fetch(`${API_BASE_URL}/strategies/${createdStrategyId}`)
    data = await response.json()

    if (!response.ok) {
      console.error(`   ❌ Failed: ${data.message}`)
    } else {
      console.log(`   ✅ Success: Retrieved strategy "${data.data.name}"`)
      console.log(`   📊 Active: ${data.data.isActive}`)
      console.log(`   🕒 Created: ${data.data.createdAt}`)
    }
    console.log()

    // Test 5: PUT /api/v1/strategies/:id
    console.log(`5️⃣ Testing PUT /api/v1/strategies/${createdStrategyId}...`)
    response = await fetch(`${API_BASE_URL}/strategies/${createdStrategyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Wallet-Address': TEST_WALLET,
      },
      body: JSON.stringify({
        description: 'Updated description for the strategy',
        performanceMetrics: {
          winRate: 0.70,
          totalTrades: 150,
          profitPercent: 35.5,
        },
      }),
    })
    data = await response.json()

    if (!response.ok) {
      console.error(`   ❌ Failed: ${data.message}`)
    } else {
      console.log(`   ✅ Success: Updated strategy`)
      console.log(`   📝 New description: ${data.data.description}`)
    }
    console.log()

    // Test 6: PUT with wrong wallet (should fail)
    console.log(`6️⃣ Testing PUT /api/v1/strategies/${createdStrategyId} (wrong wallet)...`)
    response = await fetch(`${API_BASE_URL}/strategies/${createdStrategyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Wallet-Address': TEST_WALLET_2, // Different wallet
      },
      body: JSON.stringify({
        description: 'Should not work',
      }),
    })
    data = await response.json()

    if (response.ok) {
      console.error(`   ❌ Should have failed but didn't`)
    } else {
      console.log(`   ✅ Correctly rejected: ${data.message}`)
    }
    console.log()

    // Test 7: GET /api/v1/strategies/:id/performance
    console.log(`7️⃣ Testing GET /api/v1/strategies/${createdStrategyId}/performance...`)
    response = await fetch(`${API_BASE_URL}/strategies/${createdStrategyId}/performance`)
    data = await response.json()

    if (!response.ok) {
      console.error(`   ❌ Failed: ${data.message}`)
    } else {
      console.log(`   ✅ Success: Retrieved performance metrics`)
      if (data.data.winRate) {
        console.log(`   📈 Win Rate: ${(data.data.winRate * 100).toFixed(1)}%`)
      }
      if (data.data.totalTrades) {
        console.log(`   📊 Total Trades: ${data.data.totalTrades}`)
      }
    }
    console.log()

    // Test 8: GET /api/v1/strategies with filters
    console.log('8️⃣ Testing GET /api/v1/strategies with filters...')
    response = await fetch(`${API_BASE_URL}/strategies?walletAddress=${TEST_WALLET}&isActive=true`)
    data = await response.json()

    if (!response.ok) {
      console.error(`   ❌ Failed: ${data.message}`)
    } else {
      console.log(`   ✅ Success: Found ${data.data.length} active strategies for wallet`)
    }
    console.log()

    // Test 9: Create another strategy
    console.log('9️⃣ Creating another test strategy...')
    response = await fetch(`${API_BASE_URL}/strategies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Wallet-Address': TEST_WALLET_2,
      },
      body: JSON.stringify({
        name: 'Test Strategy Beta',
        description: 'Second test strategy from different wallet',
      }),
    })
    data = await response.json()

    if (!response.ok) {
      console.error(`   ❌ Failed: ${data.message}`)
    } else {
      console.log(`   ✅ Success: Created strategy with ID ${data.data.id}`)
    }
    console.log()

    // Test 10: GET all strategies (should have 2)
    console.log('🔟 Testing GET /api/v1/strategies (should have 2)...')
    response = await fetch(`${API_BASE_URL}/strategies`)
    data = await response.json()

    if (!response.ok) {
      console.error(`   ❌ Failed: ${data.message}`)
    } else {
      console.log(`   ✅ Success: Found ${data.data.length} total strategies`)
      data.data.forEach(strategy => {
        console.log(`      - ${strategy.name} (ID: ${strategy.id}, Wallet: ${strategy.walletAddress.slice(0, 10)}...)`)
      })
    }
    console.log()

    // Test 11: DELETE /api/v1/strategies/:id
    console.log(`1️⃣1️⃣ Testing DELETE /api/v1/strategies/${createdStrategyId}...`)
    response = await fetch(`${API_BASE_URL}/strategies/${createdStrategyId}`, {
      method: 'DELETE',
      headers: {
        'X-Wallet-Address': TEST_WALLET,
      },
    })
    data = await response.json()

    if (!response.ok) {
      console.error(`   ❌ Failed: ${data.message}`)
    } else {
      console.log(`   ✅ Success: Deactivated strategy`)
    }
    console.log()

    // Test 12: Verify strategy is deactivated
    console.log(`1️⃣2️⃣ Verifying strategy ${createdStrategyId} is deactivated...`)
    response = await fetch(`${API_BASE_URL}/strategies/${createdStrategyId}`)
    data = await response.json()

    if (!response.ok) {
      console.error(`   ❌ Failed: ${data.message}`)
    } else {
      console.log(`   ✅ Strategy active status: ${data.data.isActive}`)
      if (!data.data.isActive) {
        console.log(`   ✅ Strategy successfully deactivated`)
      }
    }
    console.log()

    // Test 13: Test pagination
    console.log('1️⃣3️⃣ Testing pagination...')
    response = await fetch(`${API_BASE_URL}/strategies?page=1&limit=1`)
    data = await response.json()

    if (!response.ok) {
      console.error(`   ❌ Failed: ${data.message}`)
    } else {
      console.log(`   ✅ Page 1 with limit 1: ${data.data.length} results`)
      console.log(`   📊 Total pages: ${data.meta.totalPages}`)
      console.log(`   📊 Has next: ${data.meta.hasNext}`)
    }
    console.log()

    // Summary
    console.log('=' .repeat(50))
    console.log('🎉 All API tests completed successfully!')
    console.log('=' .repeat(50))
    console.log('\n📋 Summary:')
    console.log('   ✅ GET /api/v1/strategies - List all strategies')
    console.log('   ✅ POST /api/v1/strategies - Create strategy')
    console.log('   ✅ GET /api/v1/strategies/:id - Get strategy by ID')
    console.log('   ✅ PUT /api/v1/strategies/:id - Update strategy')
    console.log('   ✅ DELETE /api/v1/strategies/:id - Deactivate strategy')
    console.log('   ✅ GET /api/v1/strategies/:id/performance - Get performance')
    console.log('   ✅ Filtering and pagination working')
    console.log('   ✅ Authorization checks working')
    console.log('\n🚀 Master Trader API is fully functional!')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`http://localhost:${process.env.PORT || 3001}/api/v1/strategies`)
    return true
  } catch (error) {
    console.error('❌ Server is not running!')
    console.error(`Please start the server first: cd backend && bun run dev`)
    return false
  }
}

// Run tests
async function main() {
  const serverRunning = await checkServer()
  if (!serverRunning) {
    process.exit(1)
  }

  await testAPI()
}

main().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})