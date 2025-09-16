// Test script for the suggested projects API
const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3001';
const TEST_WALLET_ENS = 'sattu';

// Helper function to make API calls
async function callApi(endpoint, method, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`${method} ${API_BASE_URL}${endpoint}`);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    console.log('Response status:', response.status);
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Test get suggested projects
async function testGetSuggestedProjects() {
  console.log('\n=== Testing Get Suggested Projects ===');
  const data = await callApi(`/api/freelancer/suggested?walletEns=${TEST_WALLET_ENS}`, 'GET');
  
  if (data && data.isSuccess) {
    console.log(`Found ${data.data.length} suggested projects:`);
    
    // Display project details in a table format
    if (data.data.length > 0) {
      data.data.forEach((project, index) => {
        console.log(`\nProject #${index + 1}:`);
        console.log(`Name: ${project.projectName || 'Untitled'}`);
        console.log(`Description: ${project.projectDescription || 'No description'}`);
        console.log(`Prize: ${project.prizeAmount || '0'} tokens`);
        console.log(`Status: ${project.projectStatus || 'unknown'}`);
        console.log(`Required Skills: ${project.requiredSkills || 'None'}`);
        console.log(`Owner: ${project.projectOwnerWalletEns || 'Unknown'}`);
        console.log('-'.repeat(50));
      });
    }
  } else {
    console.log('Failed to get suggested projects:', data);
  }
  
  return data;
}

// Run test
async function runTest() {
  // First check if the server is accessible
  console.log('=== Testing API Server ===');
  try {
    const response = await fetch(`${API_BASE_URL}/api`);
    if (!response.ok) {
      console.log(`Server responded with ${response.status}. This is expected if /api route doesn't exist, continuing with tests.`);
    } else {
      console.log('Server is accessible');
    }
  } catch (error) {
    console.error('Server Error:', error.message);
    console.error('Please ensure your Next.js server is running on http://localhost:3001');
    return;
  }

  // Run the actual test
  await testGetSuggestedProjects();
}

// Execute test
runTest(); 