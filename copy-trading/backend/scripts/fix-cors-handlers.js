#!/usr/bin/env node

/**
 * Script to fix the CORS OPTIONS handlers in API route files
 * Specifically, this fixes the extra closing brackets that were
 * introduced by the previous script
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
  if (fixFile(file)) {
    updatedCount++;
  }
}

console.log(`Fixed ${updatedCount} files successfully.`);

/**
 * Find all route.ts files in the API directory
 */
function findRouteFiles(directory) {
  try {
    // Find files that might have duplicate closing brackets
    const grepCommand = `find ${directory} -name "*.ts" -type f`;
    const output = execSync(grepCommand, { encoding: 'utf-8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding route files:', error.message);
    return [];
  }
}

/**
 * Fix a route file by removing extra closing brackets
 */
function fixFile(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Look for duplicate closing brackets pattern
    // This pattern matches one closing bracket followed by another
    const duplicateClosingPattern = /\}\);(\s*)\}\);/g;
    
    // If we find the pattern, fix it
    if (duplicateClosingPattern.test(content)) {
      const updatedContent = content.replace(
        duplicateClosingPattern, 
        '});'
      );
      
      // Write the updated content
      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf-8');
        console.log(`✅ Fixed: ${filePath}`);
        return true;
      } else {
        console.log(`⚠️ No changes needed in: ${filePath}`);
      }
    } else {
      // No need to log this for every file
      // console.log(`ℹ️ No syntax errors found in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error.message);
  }
  return false;
} 