#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcDir = '/Users/consentsam/blockchain/copy-trading/frontend/src';

// Get all TypeScript files
function getAllTSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getAllTSFiles(fullPath, files);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Extract imports from a file
function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = [];

  // Match various import patterns
  const importPatterns = [
    /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g,
    /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
  ];

  importPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.push(match[1]);
    }
  });

  return imports;
}

// Extract exports from a file
function extractExports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const exports = [];

  // Match export patterns
  const exportPatterns = [
    /export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g,
    /export\s+default\s+([A-Za-z_$][A-Za-z0-9_$]*)/g,
    /export\s*{\s*([^}]+)\s*}/g
  ];

  exportPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (pattern.source.includes('{')) {
        // Handle named exports in braces
        const namedExports = match[1].split(',').map(e => e.trim().split(' as ')[0]);
        exports.push(...namedExports);
      } else {
        exports.push(match[1]);
      }
    }
  });

  return [...new Set(exports)]; // Remove duplicates
}

// Resolve relative imports to absolute paths
function resolveImportPath(importPath, fromFile) {
  if (!importPath.startsWith('.')) {
    return null; // External package or absolute import
  }

  const fromDir = path.dirname(fromFile);
  let resolved = path.resolve(fromDir, importPath);

  // Try different extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];

  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    // Check for index file
    for (const ext of extensions) {
      const indexFile = path.join(resolved, `index${ext}`);
      if (fs.existsSync(indexFile)) {
        return indexFile;
      }
    }
  } else {
    // Try with extensions
    for (const ext of extensions) {
      const withExt = `${resolved}${ext}`;
      if (fs.existsSync(withExt)) {
        return withExt;
      }
    }
  }

  return resolved; // Return as-is if not found
}

// Main analysis
function analyzeProject() {
  const allFiles = getAllTSFiles(srcDir);
  const analysis = {
    files: {},
    dependencies: {},
    unusedFiles: [],
    orphanedFiles: []
  };

  console.log(`Analyzing ${allFiles.length} TypeScript files...`);

  // First pass: extract imports and exports
  allFiles.forEach(file => {
    const relativePath = path.relative(srcDir, file);
    const imports = extractImports(file);
    const exports = extractExports(file);

    analysis.files[file] = {
      relativePath,
      imports,
      exports,
      importedBy: [],
      resolvedImports: []
    };

    // Resolve imports
    imports.forEach(imp => {
      const resolved = resolveImportPath(imp, file);
      if (resolved && allFiles.includes(resolved)) {
        analysis.files[file].resolvedImports.push(resolved);
        if (!analysis.dependencies[resolved]) {
          analysis.dependencies[resolved] = [];
        }
        analysis.dependencies[resolved].push(file);
      }
    });
  });

  // Second pass: find files that are not imported by anything
  allFiles.forEach(file => {
    const importedBy = analysis.dependencies[file] || [];
    analysis.files[file].importedBy = importedBy;

    if (importedBy.length === 0) {
      // Check if it's a page route or entry point
      const relativePath = analysis.files[file].relativePath;
      const isPage = relativePath.startsWith('pages/');
      const isAppFile = relativePath === 'pages/_app.tsx' || relativePath === 'pages/_document.tsx';
      const isConfig = relativePath.includes('config/') || relativePath.includes('libs/');

      if (!isPage && !isAppFile && !isConfig) {
        analysis.unusedFiles.push(file);
      } else if (isPage && !isAppFile) {
        // For pages, check if they're actually routes that exist
        console.log(`Page file found: ${relativePath}`);
      }
    }
  });

  return analysis;
}

// Run analysis
const analysis = analyzeProject();

console.log('\n=== DEPENDENCY ANALYSIS RESULTS ===\n');

console.log('📁 POTENTIALLY UNUSED FILES:');
if (analysis.unusedFiles.length === 0) {
  console.log('  ✅ No obviously unused files found');
} else {
  analysis.unusedFiles.forEach(file => {
    const info = analysis.files[file];
    console.log(`  🔶 ${info.relativePath}`);
    console.log(`     Exports: ${info.exports.length > 0 ? info.exports.join(', ') : 'none'}`);
    console.log(`     Imports: ${info.imports.length}`);
    console.log('');
  });
}

console.log('\n📄 ALL FILES IMPORT STATUS:');
Object.entries(analysis.files).forEach(([file, info]) => {
  const status = info.importedBy.length > 0 ? '✅ USED' :
                 info.relativePath.startsWith('pages/') ? '📄 PAGE' :
                 info.relativePath.includes('config/') || info.relativePath.includes('libs/') ? '⚙️  CONFIG' :
                 '❓ UNUSED';

  console.log(`${status} ${info.relativePath}`);
  if (info.importedBy.length > 0) {
    const importers = info.importedBy.map(imp => analysis.files[imp].relativePath);
    console.log(`       Used by: ${importers.join(', ')}`);
  }
  console.log('');
});

console.log('\n🔍 SUMMARY:');
console.log(`Total files: ${Object.keys(analysis.files).length}`);
console.log(`Potentially unused: ${analysis.unusedFiles.length}`);
console.log(`Page routes: ${Object.values(analysis.files).filter(f => f.relativePath.startsWith('pages/')).length}`);
console.log(`Config files: ${Object.values(analysis.files).filter(f => f.relativePath.includes('config/') || f.relativePath.includes('libs/')).length}`);