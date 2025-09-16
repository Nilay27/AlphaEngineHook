// test-delete-submission.js
const { exec } = require('child_process');

// Format JSON payload
const payload = {
  submissionId: "c1888c67-3974-4481-bfab-6c008727d034",
  walletAddress: "0xb92749d0769eb9fb1b45f2de0cd51c97aa220f93",
  walletEns: "consentsam"
};

const payloadStr = JSON.stringify(payload);

// Build the curl command
const curlCmd = `curl -X POST http://localhost:3000/api/submissions/delete \
  -H "Content-Type: application/json" \
  -d '${payloadStr}' \
  -v`;

console.log('Executing command:', curlCmd);

// Execute the curl command
exec(curlCmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`Curl Info: ${stderr}`);
  }
  console.log(`Response: ${stdout}`);
}); 