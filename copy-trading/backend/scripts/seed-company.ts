import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { companyTable } from '../db/schema';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function seedCompany() {
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
    console.log('🌱 Starting to seed company profile...');

    // Insert the hardcoded company profile
    const newCompany = await db.insert(companyTable).values({
      walletAddress: '0xd8b3522f7731086c8a88fae103a530194af928d6', // Lowercase version
      walletEns: '',
      companyName: 'TechCorp Solutions',
      shortDescription: 'Leading blockchain development company specializing in Web3 solutions',
      logoUrl: 'https://via.placeholder.com/150',
      githubProfileUsername: 'techcorp-solutions',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log('✅ Company profile created successfully:', newCompany[0]);

    await pool.end();
    process.exit(0);
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('⚠️  Company profile already exists for this wallet address');
      await pool.end();
      process.exit(0);
    }
    console.error('❌ Error seeding company:', error);
    await pool.end();
    process.exit(1);
  }
}

seedCompany();