// @ts-check
/**
 * Script to add test users (freelancers and companies) to the database
 * 
 * Run with: node scripts/add-test-users.js
 */

const { db } = require('../db/db');
const { sql } = require('drizzle-orm');

async function main() {
  console.log('Adding test users to the database...');

  // Add test freelancer
  try {
    const testFreelancer = {
      walletAddress: '0xf73b452fa361f3403b20a35c4650f69916c3271a',
      walletEns: 'consentsam',
      freelancerName: 'Test Freelancer',
      skills: 'JavaScript,React,Next.js',
      profilePicUrl: 'https://ui-avatars.com/api/?name=Test+Freelancer'
    };
    
    // Using raw client
    const existingFreelancer = await db.$client.query(
      `SELECT * FROM freelancer WHERE "walletAddress" = $1 LIMIT 1`,
      [testFreelancer.walletAddress]
    );

    if (existingFreelancer.rows && existingFreelancer.rows.length > 0) {
      console.log('Test freelancer already exists:', existingFreelancer.rows[0]);
    } else {
      // Insert new freelancer
      const result = await db.$client.query(
        `INSERT INTO freelancer ("walletAddress", "walletEns", "freelancerName", "skills", "profilePicUrl") 
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          testFreelancer.walletAddress,
          testFreelancer.walletEns,
          testFreelancer.freelancerName,
          testFreelancer.skills,
          testFreelancer.profilePicUrl
        ]
      );
      console.log('Added test freelancer:', result.rows[0]);
    }
  } catch (error) {
    console.error('Error adding test freelancer:', error);
  }

  // Add test company
  try {
    const testCompany = {
      walletAddress: '0xf73b452fa361f3403b20a35c4650f69916c3275a',
      walletEns: 'consentsam',
      companyName: 'Test Company',
      shortDescription: 'A test company for API testing',
      logoUrl: 'https://ui-avatars.com/api/?name=Test+Company'
    };
    
    // Using raw client
    const existingCompany = await db.$client.query(
      `SELECT * FROM company WHERE "walletAddress" = $1 LIMIT 1`,
      [testCompany.walletAddress]
    );

    if (existingCompany.rows && existingCompany.rows.length > 0) {
      console.log('Test company already exists:', existingCompany.rows[0]);
    } else {
      // Insert new company
      const result = await db.$client.query(
        `INSERT INTO company ("walletAddress", "walletEns", "companyName", "shortDescription", "logoUrl") 
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          testCompany.walletAddress,
          testCompany.walletEns,
          testCompany.companyName,
          testCompany.shortDescription,
          testCompany.logoUrl
        ]
      );
      console.log('Added test company:', result.rows[0]);
    }
  } catch (error) {
    console.error('Error adding test company:', error);
  }

  console.log('Done!');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Script error:', err);
    process.exit(1);
  }); 