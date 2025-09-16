// validate-and-update-api-docs.js
// Main script to validate and update API documentation

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create an interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Main function to validate and update API documentation
 */
async function validateAndUpdateApiDocs() {
  console.log('=== LearnLedger API Documentation Validation and Update Tool ===');
  console.log('This tool will help ensure that API documentation matches actual API responses.');
  console.log();
  
  // Check if the required scripts exist
  const requiredScripts = [
    'validate-api-docs.js',
    'validate-error-responses.js',
    'update-api-docs.js',
    'cleanup-openapi.js'
  ];
  
  for (const script of requiredScripts) {
    const scriptPath = path.join(__dirname, script);
    if (!fs.existsSync(scriptPath)) {
      console.error(`Error: Required script not found: ${scriptPath}`);
      console.error('Please make sure all required scripts are in the current directory.');
      rl.close();
      return;
    }
  }
  
  // Define menu options
  const options = [
    { value: 1, label: 'Validate API endpoints against documentation' },
    { value: 2, label: 'Test error responses against documentation' },
    { value: 3, label: 'Update API documentation based on actual responses' },
    { value: 4, label: 'Clean up duplicate OpenAPI files' },
    { value: 5, label: 'Run all steps (validate, test errors, update)' },
    { value: 6, label: 'Exit' }
  ];
  
  // Display menu
  console.log('Please select an option:');
  options.forEach(option => {
    console.log(`${option.value}. ${option.label}`);
  });
  
  const choice = await promptForNumber('Enter your choice: ', 1, options.length);
  
  switch (choice) {
    case 1:
      await runScript('validate-api-docs.js');
      break;
    case 2:
      await runScript('validate-error-responses.js');
      break;
    case 3:
      await runScript('update-api-docs.js');
      break;
    case 4:
      await runScript('cleanup-openapi.js');
      break;
    case 5:
      console.log('Running all steps...');
      await runScript('validate-api-docs.js');
      await runScript('validate-error-responses.js');
      await runScript('update-api-docs.js');
      break;
    case 6:
      console.log('Exiting...');
      break;
  }
  
  rl.close();
}

/**
 * Run a Node.js script
 */
async function runScript(scriptPath) {
  const fullPath = path.join(__dirname, scriptPath);
  console.log(`Running ${path.basename(scriptPath)}...`);
  try {
    execSync(`node ${fullPath}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running ${path.basename(scriptPath)}:`, error.message);
    return false;
  }
}

/**
 * Prompt for a number within a range
 */
function promptForNumber(prompt, min, max) {
  return new Promise(resolve => {
    const promptUser = () => {
      rl.question(prompt, answer => {
        const num = parseInt(answer, 10);
        if (isNaN(num) || num < min || num > max) {
          console.log(`Please enter a number between ${min} and ${max}.`);
          promptUser();
        } else {
          resolve(num);
        }
      });
    };
    promptUser();
  });
}

/**
 * Prompt for a yes/no answer
 */
function promptYesNo(prompt) {
  return new Promise(resolve => {
    const promptUser = () => {
      rl.question(prompt, answer => {
        const normalized = answer.toLowerCase().trim();
        if (['y', 'yes'].includes(normalized)) {
          resolve(true);
        } else if (['n', 'no'].includes(normalized)) {
          resolve(false);
        } else {
          console.log('Please answer y or n.');
          promptUser();
        }
      });
    };
    promptUser();
  });
}

// Run the tool
validateAndUpdateApiDocs().catch(error => {
  console.error('Error:', error);
  rl.close();
}); 