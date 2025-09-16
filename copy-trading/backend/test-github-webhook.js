// test-github-webhook.js
const fetch = require('node-fetch');

// Replace with your actual API URL
const WEBHOOK_URL = 'http://localhost:3000/api/github/webhook';
const DEBUG_URL = 'http://localhost:3000/api/github/debug';

// Sample payload for a GitHub PR merge event
const samplePrPayload = {
  action: "closed",
  pull_request: {
    merged: true,
    number: 4,
    title: "Test PR for webhook"
  },
  repository: {
    name: "project-ledger-demo-2",
    owner: {
      login: "consentsam"
    }
  }
};

// Sample payload for a GitHub push event with merge commit
const samplePushPayload = {
  ref: "refs/heads/main",
  head_commit: {
    message: "Merge pull request #4 from consentsam/feature-branch\n\nSome description",
    id: "02314f5743155c1cb1842c56143186c5de65a176"
  },
  repository: {
    name: "project-ledger-demo-2",
    owner: {
      login: "consentsam"
    }
  }
};

// Add the project ID mentioned in the error message
const projectId = "27061523-ea39-4f93-a0eb-691fed374427";

async function testDebugEndpoint() {
  console.log("Testing debug endpoint...");
  
  try {
    const response = await fetch(DEBUG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-github-event': 'pull_request'
      },
      body: JSON.stringify(samplePrPayload)
    });
    
    const result = await response.json();
    console.log("Debug response:", result);
  } catch (error) {
    console.error("Error testing debug endpoint:", error);
  }
}

async function testPrWebhook() {
  console.log("Testing PR webhook event...");
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-github-event': 'pull_request'
      },
      body: JSON.stringify(samplePrPayload)
    });
    
    const result = await response.json();
    console.log("PR webhook response:", result);
  } catch (error) {
    console.error("Error testing PR webhook:", error);
  }
}

async function testPushWebhook() {
  console.log("Testing Push webhook event...");
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-github-event': 'push'
      },
      body: JSON.stringify(samplePushPayload)
    });
    
    const result = await response.json();
    console.log("Push webhook response:", result);
  } catch (error) {
    console.error("Error testing Push webhook:", error);
  }
}

// Run tests
async function runTests() {
  await testDebugEndpoint();
  console.log("\n-----------------\n");
  
  console.log("Testing with PR event:");
  await testPrWebhook();
  
  console.log("\n-----------------\n");
  
  console.log("Testing with Push event:");
  await testPushWebhook();
}

runTests(); 