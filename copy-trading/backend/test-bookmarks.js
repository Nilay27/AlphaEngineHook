// Test script for the bookmarks API

const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_WALLET_ENS = 'sattu';
const TEST_WALLET_ADDRESS = '0xf73b452fa361f3403b20a35c4650f69916c3271b';
const TEST_PROJECT_ID = '024bb8ee-5729-40bf-9876-df4a15dd9024';

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
  if (body) console.log('Request body:', JSON.stringify(body, null, 2));

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Test add bookmark
async function testAddBookmark() {
  console.log('\n=== Testing Add Bookmark ===');
  return callApi('/api/freelancer/bookmarks', 'POST', {
    walletEns: TEST_WALLET_ENS,
    walletAddress: TEST_WALLET_ADDRESS,
    projectId: TEST_PROJECT_ID
  });
}

// Test get bookmarks
async function testGetBookmarks() {
  console.log('\n=== Testing Get Bookmarks ===');
  return callApi(`/api/freelancer/bookmarks?walletEns=${TEST_WALLET_ENS}`, 'GET');
}

// Test delete bookmark
async function testDeleteBookmark() {
  console.log('\n=== Testing Delete Bookmark ===');
  return callApi('/api/freelancer/bookmarks', 'DELETE', {
    walletEns: TEST_WALLET_ENS,
    projectId: TEST_PROJECT_ID
  });
}

// Run tests
async function runTests() {
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
    console.error('Please ensure your Next.js server is running on http://localhost:3000');
    return;
  }

  // Run the actual tests
  await testAddBookmark();
  await testGetBookmarks();
  await testDeleteBookmark();
}

// Execute tests
runTests(); 