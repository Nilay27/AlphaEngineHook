// scripts/export-docs.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Make sure the build directory exists
const buildDir = path.join(__dirname, '../out');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Skip the Next.js build since we only want the API docs
console.log('Skipping Next.js build, generating only API documentation...');

// Generate static API docs
console.log('Generating static API documentation...');
try {
  execSync('npm run generate-docs', { stdio: 'inherit' });
} catch (error) {
  console.error('Error generating API docs:', error);
  process.exit(1);
}

// Export the OpenAPI spec as a JSON file
console.log('Exporting OpenAPI spec as JSON...');
try {
  const { apiSchema } = require('../lib/openapi');
  const specPath = path.join(__dirname, '../out/api-spec.json');
  fs.writeFileSync(specPath, JSON.stringify(apiSchema, null, 2));
  console.log(`OpenAPI spec exported to ${specPath}`);
} catch (error) {
  console.error('Error exporting OpenAPI spec:', error);
  process.exit(1);
}

// Copy API documentation
console.log('Copying API documentation...');
try {
  const docSource = path.join(__dirname, '../API-DOCUMENTATION.md');
  const docDest = path.join(__dirname, '../out/README.md');
  fs.copyFileSync(docSource, docDest);
  console.log(`API documentation copied to ${docDest}`);
} catch (error) {
  console.error('Error copying API documentation:', error);
  process.exit(1);
}

console.log('Documentation export complete!');
console.log('You can now:');
console.log('1. Deploy the "out" directory to any static hosting service like GitHub Pages, Netlify, or Vercel');
console.log('2. Share the API spec file "out/api-spec.json" with API consumers');
console.log('3. Share the Swagger UI at "out/api-docs/index.html" for interactive documentation'); 