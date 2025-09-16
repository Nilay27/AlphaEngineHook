// db/init-schema.js
require('dotenv').config({ path: '.env.local' });

// Disable TLS certificate validation for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');

// Create connection pool with SSL for DigitalOcean PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initSchema() {
  try {
    console.log('Connecting to DigitalOcean PostgreSQL database...');
    console.log(`Using connection string: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);
    
    const client = await pool.connect();
    
    console.log('Connected successfully. Initializing schema...');
    
    // Enable UUID extension if not already enabled
    console.log('Enabling UUID extension...');
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    
    // Create projects table
    console.log('Creating projects table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_name TEXT NOT NULL,
        project_description TEXT,
        prize_amount NUMERIC(10, 2) DEFAULT 0,
        project_status TEXT NOT NULL DEFAULT 'open',
        project_owner TEXT NOT NULL,
        required_skills TEXT,
        completion_skills TEXT,
        assigned_freelancer TEXT,
        project_repo TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    
    // Create company table
    console.log('Creating company table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS company (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_name TEXT NOT NULL,
        wallet_address TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    
    // Create freelancer table
    console.log('Creating freelancer table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS freelancer (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        freelancer_name TEXT NOT NULL,
        wallet_address TEXT NOT NULL UNIQUE,
        skills TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    
    // Create skills table
    console.log('Creating skills table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        skill_name TEXT NOT NULL UNIQUE,
        skill_description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    
    // Create courses table
    console.log('Creating courses table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        course_name TEXT NOT NULL,
        course_description TEXT,
        course_fee NUMERIC(10, 2) DEFAULT 0,
        skills_taught TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    
    console.log('Schema initialization complete!');
    
    client.release();
  } catch (err) {
    console.error('Error initializing schema:', err);
  } finally {
    await pool.end();
  }
}

initSchema(); 