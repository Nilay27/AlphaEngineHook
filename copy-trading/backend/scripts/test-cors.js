// CORS Test Script
// Run this script with Node.js to test if CORS is configured correctly

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api/company/my-projects?walletEns=consentsam';
const ORIGIN = 'http://localhost:3004'; // Frontend origin

async function testCors() {
  console.log('Testing CORS configuration for API endpoint');
  console.log(`API URL: ${API_URL}`);
  console.log(`Origin: ${ORIGIN}`);
  
  try {
    // First test OPTIONS (preflight)
    console.log('\n🔍 Testing OPTIONS (preflight)...');
    const optionsResponse = await fetch(API_URL, {
      method: 'OPTIONS',
      headers: {
        'Origin': ORIGIN,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`Status: ${optionsResponse.status}`);
    console.log('Headers:');
    optionsResponse.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    // Then test actual GET request
    console.log('\n🔍 Testing GET request...');
    const getResponse = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Origin': ORIGIN
      }
    });
    
    console.log(`Status: ${getResponse.status}`);
    console.log('Headers:');
    getResponse.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('\n✅ Response data:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('\n❌ Error response:');
      try {
        const errorData = await getResponse.text();
        console.log(errorData);
      } catch (e) {
        console.log('Could not parse error response');
      }
    }
    
    // Check CORS headers
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers'
    ];
    
    const missingHeaders = corsHeaders.filter(header => 
      !getResponse.headers.has(header)
    );
    
    if (missingHeaders.length > 0) {
      console.log('\n⚠️ Missing CORS headers:', missingHeaders);
    } else {
      console.log('\n✅ All required CORS headers present');
    }
    
    // Check if origin is allowed
    const allowOrigin = getResponse.headers.get('access-control-allow-origin');
    if (allowOrigin === ORIGIN || allowOrigin === '*') {
      console.log(`✅ Origin ${ORIGIN} is allowed`);
    } else {
      console.log(`❌ Origin ${ORIGIN} is not allowed (got ${allowOrigin})`);
    }
    
  } catch (error) {
    console.error('Error testing CORS:', error);
  }
}

testCors(); 