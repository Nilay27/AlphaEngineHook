// cleanup-openapi.js
// This script removes duplicate OpenAPI specification files and updates references

const fs = require('fs');
const path = require('path');

// Configuration
const PRIMARY_OPENAPI_PATH = path.join(__dirname, '../project-ledger-docs/static/openapi.json');
const FILES_TO_REMOVE = [
  path.join(__dirname, '../project-ledger-docs/static/openapi-updated.json'),
  path.join(__dirname, '../project-ledger-docs/static/api-spec.json'),
  path.join(__dirname, '../app/api-docs/openapi.json')
];

/**
 * Main function to cleanup OpenAPI files
 */
function cleanupOpenAPIFiles() {
  console.log('Starting OpenAPI cleanup...');
  console.log(`Primary OpenAPI spec will be: ${PRIMARY_OPENAPI_PATH}`);
  
  // Check if primary file exists
  if (!fs.existsSync(PRIMARY_OPENAPI_PATH)) {
    console.error(`Error: Primary OpenAPI spec not found at ${PRIMARY_OPENAPI_PATH}`);
    process.exit(1);
  }
  
  // Remove duplicate files
  let removedCount = 0;
  for (const filePath of FILES_TO_REMOVE) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Removed duplicate file: ${filePath}`);
        removedCount++;
      } else {
        console.log(`File already removed or doesn't exist: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error removing ${filePath}:`, error.message);
    }
  }
  
  console.log(`\nRemoved ${removedCount} duplicate OpenAPI files.`);
  
  // Update the update-api-docs.js file to use only the primary file
  updateScriptReferences();
  
  console.log('\n✅ Cleanup complete. Now using a single OpenAPI specification file.');
  console.log(`Primary file location: ${PRIMARY_OPENAPI_PATH}`);
}

/**
 * Updates references in other scripts
 */
function updateScriptReferences() {
  console.log('\nUpdating script references...');
  
  // Update update-api-docs.js
  const updateScriptPath = path.join(__dirname, 'update-api-docs.js');
  if (fs.existsSync(updateScriptPath)) {
    let content = fs.readFileSync(updateScriptPath, 'utf8');
    
    // Replace file paths
    content = content.replace(/const UPDATED_SPEC_PATH = .*$/m, '// Using single file approach - no separate updated spec');
    content = content.replace(/const API_DOCS_PATH = .*$/m, '// Using single file approach - no separate api docs spec');
    
    // Replace file writing logic
    content = content.replace(/fs\.writeFileSync\(UPDATED_SPEC_PATH.*\);/g, '// Using single file approach - writing only to primary file');
    content = content.replace(/console\.log\(`Updated OpenAPI spec written to: \${UPDATED_SPEC_PATH}`\);/g, 
                             'console.log(`Updated primary OpenAPI spec at: ${OPENAPI_SPEC_PATH}`);');
    
    // Remove copy operations
    content = content.replace(/fs\.copyFileSync\(UPDATED_SPEC_PATH.*\);/g, '// Using single file approach - no copying needed');
    content = content.replace(/console\.log\(`Updated OpenAPI spec copied to:.*\);/g, '// Using single file approach - no copying needed');
    
    // Update functions that update the spec
    content = content.replace(/const updatedSpec = JSON\.parse\(JSON\.stringify\(openApiSpec\)\);/g, 
                            'let updatedSpec = JSON.parse(JSON.stringify(openApiSpec));');
    
    // Add direct writing to the primary file
    content = content.replace(/const updates = \[\];/, 'const updates = [];\n\n  // We will write changes directly to the primary file');
    
    // Update the final write logic - make sure this only happens once
    content = content.replace(/\/\/ Record of updates made[\s\S]*?for \(const endpoint of endpoints\) {/m, 
                            '// Record of updates made\n  const updates = [];\n\n  // We will write changes directly to the primary file\n\n  for (const endpoint of endpoints) {');
    
    // Add writing to primary file at the end
    const writeFileCode = `
  // Write the updated spec back to the primary file
  if (updates.length > 0) {
    fs.writeFileSync(OPENAPI_SPEC_PATH, JSON.stringify(updatedSpec, null, 4));
    console.log(\`Updated primary OpenAPI spec at: \${OPENAPI_SPEC_PATH}\`);
  } else {
    console.log('No updates needed to the OpenAPI spec.');
  }
`;
    
    content = content.replace(/\/\/ Generate and write the update report[\s\S]*?generateUpdateReport\(updates\);/m, 
                            `// Write the updated spec back to the primary file\n  if (updates.length > 0) {
    fs.writeFileSync(OPENAPI_SPEC_PATH, JSON.stringify(updatedSpec, null, 4));
    console.log(\`Updated primary OpenAPI spec at: \${OPENAPI_SPEC_PATH}\`);
  } else {
    console.log('No updates needed to the OpenAPI spec.');
  }\n\n  // Generate and write the update report\n  generateUpdateReport(updates);`);
    
    fs.writeFileSync(updateScriptPath, content);
    console.log('Updated references in update-api-docs.js');
  }
  
  // Update validate-api-docs.js
  const validateScriptPath = path.join(__dirname, 'validate-api-docs.js');
  if (fs.existsSync(validateScriptPath)) {
    let content = fs.readFileSync(validateScriptPath, 'utf8');
    // No changes needed here as it already uses the primary file
    console.log('No changes needed in validate-api-docs.js');
  }
  
  // Update validate-error-responses.js
  const errorScriptPath = path.join(__dirname, 'validate-error-responses.js');
  if (fs.existsSync(errorScriptPath)) {
    let content = fs.readFileSync(errorScriptPath, 'utf8');
    // No changes needed here as it already uses the primary file
    console.log('No changes needed in validate-error-responses.js');
  }
  
  // Rename this script to make its purpose clear
  const thisScriptPath = path.join(__dirname, 'sync-openapi.js');
  const newScriptPath = path.join(__dirname, 'cleanup-openapi.js');
  if (fs.existsSync(thisScriptPath) && thisScriptPath !== newScriptPath) {
    fs.renameSync(thisScriptPath, newScriptPath);
    console.log(`Renamed script from sync-openapi.js to cleanup-openapi.js`);
  }
  
  // Update validate-and-update-api-docs.js
  const mainScriptPath = path.join(__dirname, 'validate-and-update-api-docs.js');
  if (fs.existsSync(mainScriptPath)) {
    let content = fs.readFileSync(mainScriptPath, 'utf8');
    
    // Replace sync-openapi.js references with cleanup-openapi.js
    content = content.replace(/'sync-openapi\.js'/g, "'cleanup-openapi.js'");
    
    // Update menu option
    content = content.replace(/{ value: 4, label: 'Sync OpenAPI files \(sync primary file to all locations\)' }/g, 
                            "{ value: 4, label: 'Clean up duplicate OpenAPI files' }");
    
    fs.writeFileSync(mainScriptPath, content);
    console.log('Updated references in validate-and-update-api-docs.js');
  }
}

// Run the cleanup function
cleanupOpenAPIFiles(); 