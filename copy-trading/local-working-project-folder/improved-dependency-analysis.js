#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcDir = '/Users/consentsam/blockchain/copy-trading/frontend/src';

// Path aliases from tsconfig.json
const pathAliases = {
  '@/': './src/'
};

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

// Resolve imports including path aliases
function resolveImportPath(importPath, fromFile) {
  // Handle external packages (not starting with . or @/)
  if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
    return null;
  }

  let resolvedPath;

  // Handle alias imports
  if (importPath.startsWith('@/')) {
    const relativePath = importPath.replace('@/', '');
    resolvedPath = path.join(srcDir, relativePath);
  } else {
    // Handle relative imports
    const fromDir = path.dirname(fromFile);
    resolvedPath = path.resolve(fromDir, importPath);
  }

  // Try different extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];

  if (fs.existsSync(resolvedPath)) {
    const stat = fs.statSync(resolvedPath);
    if (stat.isDirectory()) {
      // Check for index file
      for (const ext of extensions) {
        const indexFile = path.join(resolvedPath, `index${ext}`);
        if (fs.existsSync(indexFile)) {
          return indexFile;
        }
      }
    } else {
      return resolvedPath;
    }
  } else {
    // Try with extensions
    for (const ext of extensions) {
      const withExt = `${resolvedPath}${ext}`;
      if (fs.existsSync(withExt)) {
        return withExt;
      }
    }
  }

  return null;
}

// Check if a file is a Next.js page or special file
function isSpecialFile(relativePath) {
  if (relativePath.startsWith('pages/')) return true;
  if (relativePath === 'pages/_app.tsx' || relativePath === 'pages/_document.tsx') return true;
  if (relativePath.includes('config/') || relativePath.includes('libs/')) return true;
  if (relativePath.endsWith('.d.ts')) return true;
  return false;
}

// Main analysis
function analyzeProject() {
  const allFiles = getAllTSFiles(srcDir);
  const analysis = {
    files: {},
    dependencies: {},
    unusedFiles: [],
    usedFiles: []
  };

  console.log(`Analyzing ${allFiles.length} TypeScript files...`);

  // First pass: extract imports and create dependency graph
  allFiles.forEach(file => {
    const relativePath = path.relative(srcDir, file);
    const imports = extractImports(file);

    analysis.files[file] = {
      relativePath,
      imports,
      importedBy: [],
      resolvedImports: [],
      isSpecial: isSpecialFile(relativePath)
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

  // Second pass: mark files as used or unused
  allFiles.forEach(file => {
    const fileInfo = analysis.files[file];
    const importedBy = analysis.dependencies[file] || [];
    fileInfo.importedBy = importedBy;

    if (importedBy.length === 0 && !fileInfo.isSpecial) {
      analysis.unusedFiles.push(file);
    } else {
      analysis.usedFiles.push(file);
    }
  });

  return analysis;
}

// Run analysis
const analysis = analyzeProject();

console.log('\n=== IMPROVED DEPENDENCY ANALYSIS RESULTS ===\n');

// Find categories of files
const components = Object.values(analysis.files).filter(f => f.relativePath.includes('Components/'));
const services = Object.values(analysis.files).filter(f => f.relativePath.includes('services/'));
const utils = Object.values(analysis.files).filter(f => f.relativePath.includes('utils/'));
const hooks = Object.values(analysis.files).filter(f => f.relativePath.includes('hooks/'));
const types = Object.values(analysis.files).filter(f => f.relativePath.includes('types/'));
const pages = Object.values(analysis.files).filter(f => f.relativePath.startsWith('pages/'));

console.log('📊 USAGE BREAKDOWN:');
console.log(`Total files analyzed: ${Object.keys(analysis.files).length}`);
console.log(`Actually used files: ${analysis.usedFiles.length}`);
console.log(`Potentially unused files: ${analysis.unusedFiles.length}`);
console.log('');

console.log('📁 BY CATEGORY:');
console.log(`Components: ${components.length} (${components.filter(c => analysis.unusedFiles.some(u => analysis.files[u].relativePath === c.relativePath)).length} unused)`);
console.log(`Services: ${services.length} (${services.filter(s => analysis.unusedFiles.some(u => analysis.files[u].relativePath === s.relativePath)).length} unused)`);
console.log(`Utils: ${utils.length} (${utils.filter(u => analysis.unusedFiles.some(unused => analysis.files[unused].relativePath === u.relativePath)).length} unused)`);
console.log(`Hooks: ${hooks.length} (${hooks.filter(h => analysis.unusedFiles.some(u => analysis.files[u].relativePath === h.relativePath)).length} unused)`);
console.log(`Types: ${types.length} (${types.filter(t => analysis.unusedFiles.some(u => analysis.files[u].relativePath === t.relativePath)).length} unused)`);
console.log(`Pages: ${pages.length}`);
console.log('');

if (analysis.unusedFiles.length > 0) {
  console.log('🔶 POTENTIALLY UNUSED FILES:');
  analysis.unusedFiles.forEach(file => {
    const info = analysis.files[file];
    console.log(`  ${info.relativePath}`);
    console.log(`    Imports: ${info.imports.length > 0 ? info.imports.join(', ') : 'none'}`);
    console.log(`    Category: ${info.relativePath.includes('Components/') ? 'Component' :
                                info.relativePath.includes('services/') ? 'Service' :
                                info.relativePath.includes('utils/') ? 'Utility' :
                                info.relativePath.includes('hooks/') ? 'Hook' :
                                info.relativePath.includes('types/') ? 'Types' : 'Other'}`);
    console.log('');
  });
} else {
  console.log('✅ No unused files found!');
}

console.log('\n🔍 DETAILED COMPONENT ANALYSIS:');
components.forEach(comp => {
  const file = Object.keys(analysis.files).find(f => analysis.files[f].relativePath === comp.relativePath);
  const importedBy = analysis.dependencies[file] || [];
  const status = importedBy.length > 0 ? '✅ USED' : '❓ UNUSED';

  console.log(`${status} ${comp.relativePath}`);
  if (importedBy.length > 0) {
    const importers = importedBy.map(imp => analysis.files[imp].relativePath);
    console.log(`       Used by: ${importers.join(', ')}`);
  }
});

console.log('\n📋 SERVICES ANALYSIS:');
services.forEach(svc => {
  const file = Object.keys(analysis.files).find(f => analysis.files[f].relativePath === svc.relativePath);
  const importedBy = analysis.dependencies[file] || [];
  const status = importedBy.length > 0 ? '✅ USED' : '❓ UNUSED';

  console.log(`${status} ${svc.relativePath}`);
  if (importedBy.length > 0) {
    const importers = importedBy.map(imp => analysis.files[imp].relativePath);
    console.log(`       Used by: ${importers.join(', ')}`);
  }
});

console.log('\n🔧 UTILITIES & HOOKS ANALYSIS:');
[...utils, ...hooks].forEach(util => {
  const file = Object.keys(analysis.files).find(f => analysis.files[f].relativePath === util.relativePath);
  const importedBy = analysis.dependencies[file] || [];
  const status = importedBy.length > 0 ? '✅ USED' : '❓ UNUSED';

  console.log(`${status} ${util.relativePath}`);
  if (importedBy.length > 0) {
    const importers = importedBy.map(imp => analysis.files[imp].relativePath);
    console.log(`       Used by: ${importers.join(', ')}`);
  }
});

console.log('\n🎯 RECOMMENDATIONS:');
if (analysis.unusedFiles.length > 0) {
  console.log('The following files may be safe to remove:');
  analysis.unusedFiles.forEach(file => {
    const info = analysis.files[file];
    console.log(`  - ${info.relativePath}`);
  });
} else {
  console.log('✅ All files appear to be in use. The codebase is clean!');
}