#!/usr/bin/env node

const { Pool } = require('pg')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

async function testModels() {
  console.log('🧪 Testing AlphaEngine models...\n')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    // Test creating a strategy
    console.log('📝 Creating test strategy...')
    const strategyResult = await pool.query(`
      INSERT INTO strategies (wallet_address, name, description, performance_metrics)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      '0x1234567890abcdef1234567890abcdef12345678',
      'Test Strategy Alpha',
      'A test trading strategy for AlphaEngine',
      JSON.stringify({ winRate: 0.65, totalTrades: 100, profitPercent: 25.5 })
    ])

    const strategy = strategyResult.rows[0]
    console.log('✅ Strategy created:', {
      id: strategy.id,
      name: strategy.name,
      wallet: strategy.wallet_address
    })

    // Test creating a subscription
    console.log('\n📝 Creating test subscription...')
    const subscriptionResult = await pool.query(`
      INSERT INTO subscriptions (strategy_id, subscriber_wallet, subscription_amount)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [
      strategy.id,
      '0xabcdef1234567890abcdef1234567890abcdef12',
      '1000.50'
    ])

    const subscription = subscriptionResult.rows[0]
    console.log('✅ Subscription created:', {
      id: subscription.id,
      strategyId: subscription.strategy_id,
      subscriberWallet: subscription.subscriber_wallet,
      amount: subscription.subscription_amount
    })

    // Test creating a trade confirmation
    console.log('\n📝 Creating test trade confirmation...')
    const tradeResult = await pool.query(`
      INSERT INTO trade_confirmations (strategy_id, trade_hash, trade_type, token_pair, amount, price)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      strategy.id,
      '0x' + Math.random().toString(16).substr(2, 64),
      'BUY',
      'ETH/USDT',
      '0.5',
      '2500.00'
    ])

    const trade = tradeResult.rows[0]
    console.log('✅ Trade confirmation created:', {
      id: trade.id,
      tradeHash: trade.trade_hash,
      type: trade.trade_type,
      pair: trade.token_pair,
      status: trade.broadcast_status
    })

    // Test querying relationships
    console.log('\n📊 Testing relationships...')
    const joinResult = await pool.query(`
      SELECT
        s.name as strategy_name,
        sub.subscriber_wallet,
        sub.subscription_amount,
        COUNT(tc.id) as trade_count
      FROM strategies s
      LEFT JOIN subscriptions sub ON s.id = sub.strategy_id
      LEFT JOIN trade_confirmations tc ON s.id = tc.strategy_id
      WHERE s.id = $1
      GROUP BY s.name, sub.subscriber_wallet, sub.subscription_amount
    `, [strategy.id])

    console.log('✅ Relationship query results:')
    joinResult.rows.forEach(row => {
      console.log(`   - Strategy: ${row.strategy_name}`)
      console.log(`     Subscriber: ${row.subscriber_wallet}`)
      console.log(`     Amount: ${row.subscription_amount}`)
      console.log(`     Trades: ${row.trade_count}`)
    })

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...')
    await pool.query('DELETE FROM trade_confirmations WHERE strategy_id = $1', [strategy.id])
    await pool.query('DELETE FROM subscriptions WHERE strategy_id = $1', [strategy.id])
    await pool.query('DELETE FROM strategies WHERE id = $1', [strategy.id])
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 All model tests passed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error(error.detail || '')
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run tests
testModels().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})