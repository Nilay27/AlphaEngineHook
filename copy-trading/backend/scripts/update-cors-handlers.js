#!/usr/bin/env node

/**
 * Script to update all API routes to use the correct CORS approach for OPTIONS handlers
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Root directory of the API routes
const API_DIR = path.join(__dirname, '..', 'app', 'api');

// Find all route.ts files
const routeFiles = findRouteFiles(API_DIR);
console.log(`Found ${routeFiles.length} route files to check.`);

// Update each file
let updatedCount = 0;
for (const file of routeFiles) {
  if (updateFile(file)) {
    updatedCount++;
  }
}

console.log(`Updated ${updatedCount} files successfully.`);

/**
 * Find all route.ts files in the API directory
 */
function findRouteFiles(directory) {
  try {
    // Use grep to find files that likely contain CORS and OPTIONS handlers
    const grepCommand = `grep -l "OPTIONS.*withCors" --include="*.ts" -r ${directory}`;
    const output = execSync(grepCommand, { encoding: 'utf-8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding route files:', error.message);
    return [];
  }
}

/**
 * Update a route file to use the correct CORS approach
 */
function updateFile(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Look for OPTIONS handler pattern
    const optionsHandlerRegex = /export\s+const\s+OPTIONS\s*=\s*withCors\s*\(\s*async.*?\)\s*=>\s*\{[^}]*\}\s*\)\s*;/gs;
    
    // If we find the pattern, update it
    if (optionsHandlerRegex.test(content)) {
      const updatedContent = content.replace(
        optionsHandlerRegex,
        `export const OPTIONS = withCors(async () => {
  // Empty handler, the CORS middleware will create the proper OPTIONS response
  return new Response(null, { status: 204 });
});`
      );
      
      // Write the updated content
      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf-8');
        console.log(`✅ Updated: ${filePath}`);
        return true;
      } else {
        console.log(`ℹ️ Already up to date: ${filePath}`);
      }
    } else {
      console.log(`⚠️ No OPTIONS handler found in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating file ${filePath}:`, error.message);
  }
  return false;
} 