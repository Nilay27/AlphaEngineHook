// This file runs before each test file
// You can add global setup logic here

// Set a reasonable test timeout
jest.setTimeout(30000); // 30 seconds

// Set up global environment variables for testing if needed
process.env.TEST_API_URL = process.env.TEST_API_URL || 'http://localhost:3000/api';

// Silence console logs during tests if needed
// console.log = jest.fn();
// console.error = jest.fn(); 