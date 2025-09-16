import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { freelancerTable } from '../db/schema';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function seedFreelancer() {
  // Disable SSL validation for local development
  if (process.env.DISABLE_SSL_VALIDATION === 'true') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false // Disable SSL completely for local PostgreSQL
  });

  const db = drizzle(pool);

  try {
    console.log('🌱 Starting to seed freelancer profile...');

    // Insert the hardcoded freelancer profile
    const newFreelancer = await db.insert(freelancerTable).values({
      walletAddress: '0xd8b3522f7731086c8a88fae103a530194af928d6', // Lowercase version - same wallet
      walletEns: 'randomsinha.eth', // Adding ENS name as shown in the image
      freelancerName: 'Random Sinha',
      skills: 'Web3 Development, Smart Contracts, React, Node.js, TypeScript, Solidity, DeFi, NFTs',
      profilePicUrl: 'https://via.placeholder.com/150',
      githubProfileUsername: 'randomsinha',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log('✅ Freelancer profile created successfully:', newFreelancer[0]);

    await pool.end();
    process.exit(0);
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('⚠️  Freelancer profile already exists for this wallet address');
      await pool.end();
      process.exit(0);
    }
    console.error('❌ Error seeding freelancer:', error);
    await pool.end();
    process.exit(1);
  }
}

seedFreelancer();