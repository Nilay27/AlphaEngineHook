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

async function seedData() {
  try {
    console.log('Connecting to DigitalOcean PostgreSQL database...');
    console.log(`Using connection string: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);
    
    const client = await pool.connect();
    
    console.log('Connected successfully. Seeding data...');
    
    // Insert sample company
    console.log('Adding sample company...');
    await client.query(`
      INSERT INTO company (company_name, wallet_address)
      VALUES ('TechCorp', '0xb92749d0769eb9fb1b45f2de0cd51c97aa220f93')
      ON CONFLICT (wallet_address) DO NOTHING;
    `);
    
    // Insert sample skills
    console.log('Adding sample skills...');
    const skills = [
      { name: 'React', description: 'Frontend JavaScript library' },
      { name: 'Solidity', description: 'Smart contract programming language' },
      { name: 'TypeScript', description: 'Typed JavaScript' },
      { name: 'Node.js', description: 'JavaScript runtime' },
      { name: 'Foundry', description: 'Smart contract development toolkit' }
    ];
    
    for (const skill of skills) {
      await client.query(`
        INSERT INTO skills (skill_name, skill_description)
        VALUES ($1, $2)
        ON CONFLICT (skill_name) DO NOTHING;
      `, [skill.name, skill.description]);
    }
    
    // Insert sample projects
    console.log('Adding sample projects...');
    const projects = [
      {
        name: 'Project 1x10',
        description: 'Project 1x10 desc',
        prize: 110.00,
        status: 'open',
        owner: '0xb92749d0769eb9fb1b45f2de0cd51c97aa220f93',
        required_skills: 'react, solidity',
        completion_skills: 'foundry'
      },
      {
        name: 'Project 1x9',
        description: 'Project 1x9 descr',
        prize: 19.00,
        status: 'open',
        owner: '0xb92749d0769eb9fb1b45f2de0cd51c97aa220f93',
        required_skills: 'react, solidity',
        completion_skills: 'foundry'
      }
    ];
    
    for (const project of projects) {
      await client.query(`
        INSERT INTO projects (
          project_name, 
          project_description, 
          prize_amount, 
          project_status, 
          project_owner, 
          required_skills, 
          completion_skills
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `, [
        project.name,
        project.description,
        project.prize,
        project.status,
        project.owner,
        project.required_skills,
        project.completion_skills
      ]);
    }
    
    // Insert sample courses
    console.log('Adding sample courses...');
    const courses = [
      {
        name: 'Intro to React',
        description: 'Learn the basics of React',
        fee: 50.00,
        skills: 'react'
      },
      {
        name: 'Solidity Masterclass',
        description: 'Advanced Solidity programming',
        fee: 100.00,
        skills: 'solidity, foundry'
      }
    ];
    
    for (const course of courses) {
      await client.query(`
        INSERT INTO courses (
          course_name, 
          course_description, 
          course_fee, 
          skills_taught
        )
        VALUES ($1, $2, $3, $4);
      `, [
        course.name,
        course.description,
        course.fee,
        course.skills
      ]);
    }
    
    console.log('Data seeding complete!');
    
    client.release();
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await pool.end();
  }
}

seedData(); 