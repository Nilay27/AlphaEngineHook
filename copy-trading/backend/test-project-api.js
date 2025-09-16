/**
 * Test script for the projects API
 * Tests both DELETE and PUT (update) endpoints
 * 
 * Run with: node test-project-api.js
 */

// Set your projectId here
const projectId = '871cff03-74da-4b47-bbe4-800042f7db2f';
const baseUrl = 'http://localhost:3001/api/projects';

// Test user credentials
const testCredentials = {
  walletEns: "consentsam",
  walletAddress: "0xB92749d0769EB9fb1B45f2dE0CD51c97aa220f93"
};

// Test update data
const updateData = {
  ...testCredentials,
  projectName: "Updated Test Project",
  projectDescription: "This is an updated test project",
  prizeAmount: "200",
  requiredSkills: "JavaScript,React,Node.js",
  completionSkills: "API Development,Testing",
  projectRepo: "https://github.com/test/updated-repo",
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
};

// Helper function to make HTTP requests
async function makeRequest(url, method, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return {
      status: response.status,
      data
    };
  } catch (error) {
    console.error(`Error making ${method} request to ${url}:`, error);
    return {
      status: 500,
      error: error.message
    };
  }
}

// Test the PUT (update) endpoint
async function testUpdateProject() {
  console.log('\n--- Testing PUT (Update) Project Endpoint ---');
  console.log(`PUT ${baseUrl}/${projectId}`);
  console.log('Request body:', updateData);

  const result = await makeRequest(`${baseUrl}/${projectId}`, 'PUT', updateData);
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

// Test the DELETE endpoint
async function testDeleteProject() {
  console.log('\n--- Testing DELETE Project Endpoint ---');
  console.log(`DELETE ${baseUrl}/${projectId}`);
  console.log('Request body:', testCredentials);

  const result = await makeRequest(`${baseUrl}/${projectId}`, 'DELETE', testCredentials);
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

// Run the tests
async function runTests() {
  try {
    // First, test update
    await testUpdateProject();
    
    // Then test delete (comment this out if you want to preserve the project)
    await testDeleteProject();
    
    console.log('\nTests completed!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Execute the tests
runTests();
