import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { companyTable, freelancerTable } from '../db/schema';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function importCSVData() {
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
    console.log('📁 Starting CSV data import...\n');

    // Import Company data
    const companyCSVPath = path.resolve(__dirname, '../../local-working-project-folder/company.csv');
    if (fs.existsSync(companyCSVPath)) {
      console.log('📊 Reading company.csv...');
      const companyCSV = fs.readFileSync(companyCSVPath, 'utf-8');
      const companyRecords = parse(companyCSV, {
        columns: true,
        skip_empty_lines: true
      });

      console.log(`Found ${companyRecords.length} company records to import`);

      for (const record of companyRecords) {
        try {
          // Skip if ID already exists (to avoid duplicates)
          const newCompany = await db.insert(companyTable).values({
            walletAddress: record.walletAddress.toLowerCase(),
            walletEns: record.walletEns || '',
            companyName: record.companyName,
            shortDescription: record.shortDescription,
            logoUrl: record.logoUrl,
            githubProfileUsername: record.githubProfileUsername,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt)
          }).onConflictDoNothing().returning();

          if (newCompany.length > 0) {
            console.log(`✅ Imported company: ${record.companyName}`);
          } else {
            console.log(`⏭️  Skipped existing company: ${record.companyName}`);
          }
        } catch (error: any) {
          if (error.code === '23505') {
            console.log(`⏭️  Company already exists: ${record.companyName}`);
          } else {
            console.error(`❌ Error importing company ${record.companyName}:`, error.message);
          }
        }
      }
    } else {
      console.log('⚠️  company.csv not found');
    }

    console.log('\n');

    // Import Freelancer data
    const freelancerCSVPath = path.resolve(__dirname, '../../local-working-project-folder/freelancer.csv');
    if (fs.existsSync(freelancerCSVPath)) {
      console.log('📊 Reading freelancer.csv...');
      const freelancerCSV = fs.readFileSync(freelancerCSVPath, 'utf-8');
      const freelancerRecords = parse(freelancerCSV, {
        columns: true,
        skip_empty_lines: true
      });

      console.log(`Found ${freelancerRecords.length} freelancer records to import`);

      for (const record of freelancerRecords) {
        try {
          const newFreelancer = await db.insert(freelancerTable).values({
            walletAddress: record.walletAddress.toLowerCase(),
            walletEns: record.walletEns || null,
            freelancerName: record.freelancerName,
            skills: record.skills,
            profilePicUrl: record.profilePicUrl,
            githubProfileUsername: record.githubProfileUsername,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt)
          }).onConflictDoNothing().returning();

          if (newFreelancer.length > 0) {
            console.log(`✅ Imported freelancer: ${record.freelancerName}`);
          } else {
            console.log(`⏭️  Skipped existing freelancer: ${record.freelancerName}`);
          }
        } catch (error: any) {
          if (error.code === '23505') {
            console.log(`⏭️  Freelancer already exists: ${record.freelancerName}`);
          } else {
            console.error(`❌ Error importing freelancer ${record.freelancerName}:`, error.message);
          }
        }
      }
    } else {
      console.log('⚠️  freelancer.csv not found');
    }

    console.log('\n✨ CSV import completed!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during CSV import:', error);
    await pool.end();
    process.exit(1);
  }
}

importCSVData();