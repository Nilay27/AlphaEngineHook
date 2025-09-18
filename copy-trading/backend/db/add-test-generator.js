require('dotenv').config({ path: '.env.local' });

// Disable TLS certificate validation for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/alphaengine',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addTestGenerator(index = 1) {
  const client = await pool.connect();

  try {
    console.log(`\n🎯 Adding Test Generator #${index}...`);

    // Test data variations
    const generators = [
      {
        generator_address: '0x1234567890123456789012345678901234567890',
        name: 'Momentum King Strategy',
        description: 'High-frequency momentum trading with ML-powered signals',
        performance_stats: { winRate: 0.67, avgReturn: 0.12, sharpeRatio: 1.85 },
        encryption_support: true,
        fee_percentage: 250, // 2.5%
        min_subscription_amount: '1.000000000000000000', // 1 ETH
        max_subscribers: 100,
        current_subscribers: 42,
        is_active: true,
        metadata: {
          verified: true,
          rating: 4.5,
          subscriptionFee: '1000000000000000000', // 1 ETH in wei
          totalVolume: '125000000000000000000', // 125 ETH
          displayName: 'Momentum King',
          walletAddress: '0x1234567890123456789012345678901234567890'
        }
      },
      {
        generator_address: '0x2345678901234567890123456789012345678901',
        name: 'DeFi Yield Hunter',
        description: 'Automated yield farming across multiple protocols',
        performance_stats: { winRate: 0.82, avgReturn: 0.08, sharpeRatio: 2.1 },
        encryption_support: false,
        fee_percentage: 150, // 1.5%
        min_subscription_amount: '0.500000000000000000', // 0.5 ETH
        max_subscribers: 200,
        current_subscribers: 89,
        is_active: true,
        metadata: {
          verified: false,
          rating: 4.2,
          subscriptionFee: '500000000000000000', // 0.5 ETH in wei
          totalVolume: '89000000000000000000', // 89 ETH
          displayName: 'Yield Hunter Pro',
          walletAddress: '0x2345678901234567890123456789012345678901'
        }
      },
      {
        generator_address: '0x3456789012345678901234567890123456789012',
        name: 'Arbitrage Scanner',
        description: 'Cross-DEX arbitrage opportunity detection',
        performance_stats: { winRate: 0.91, avgReturn: 0.03, sharpeRatio: 3.2 },
        encryption_support: true,
        fee_percentage: 500, // 5%
        min_subscription_amount: '2.000000000000000000', // 2 ETH
        max_subscribers: 50,
        current_subscribers: 23,
        is_active: true,
        metadata: {
          verified: true,
          rating: 4.8,
          subscriptionFee: '2000000000000000000', // 2 ETH in wei
          totalVolume: '450000000000000000000', // 450 ETH
          displayName: 'Arb Master 3000',
          walletAddress: '0x3456789012345678901234567890123456789012'
        }
      }
    ];

    const genData = generators[index - 1] || generators[0];

    // Insert the generator
    const query = `
      INSERT INTO alpha_generators (
        generator_address,
        name,
        description,
        performance_stats,
        encryption_support,
        fee_percentage,
        min_subscription_amount,
        max_subscribers,
        current_subscribers,
        is_active,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      genData.generator_address,
      genData.name,
      genData.description,
      JSON.stringify(genData.performance_stats),
      genData.encryption_support,
      genData.fee_percentage,
      genData.min_subscription_amount,
      genData.max_subscribers,
      genData.current_subscribers,
      genData.is_active,
      JSON.stringify(genData.metadata)
    ];

    const result = await client.query(query, values);

    console.log('✅ Generator added successfully!');
    console.log('   Name:', result.rows[0].name);
    console.log('   Address:', result.rows[0].generator_address);
    console.log('   Fee:', result.rows[0].fee_percentage / 100 + '%');
    console.log('   Subscribers:', result.rows[0].current_subscribers);
    console.log('   Verified:', genData.metadata.verified);
    console.log('   Rating:', genData.metadata.rating);

  } catch (error) {
    console.error('❌ Error adding generator:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Get generator index from command line
const index = parseInt(process.argv[2]) || 1;

addTestGenerator(index)
  .then(() => {
    console.log('\n🎉 Test generator added successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed to add generator:', error);
    process.exit(1);
  });