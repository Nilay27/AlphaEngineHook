#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Configuration - logs directory configurable via LOGS_DIR env variable
const logsDir = process.env.LOGS_DIR || path.join(__dirname, '../../../logs');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputFile = path.join(logsDir, `debug-analysis-${timestamp}.json`);

console.log('🔍 Log Collection & Analysis Script');
console.log('====================================');

// Check if logs directory exists
if (!fs.existsSync(logsDir)) {
  console.error('❌ Logs directory not found:', logsDir);
  console.log('Make sure the application has been running and generating logs.');
  process.exit(1);
}

// Find all log files
const logFiles = fs.readdirSync(logsDir).filter(file => file.endsWith('.log'));

if (logFiles.length === 0) {
  console.error('❌ No log files found in:', logsDir);
  console.log('Make sure the application has been running and generating logs.');
  process.exit(1);
}

// Separate frontend and backend logs
const frontendLogs = logFiles.filter(f => f.startsWith('frontend-'));
const backendLogs = logFiles.filter(f => f.startsWith('backend-'));

console.log(`📁 Found ${logFiles.length} log files:`);
console.log(`   Backend logs: ${backendLogs.length}`);
console.log(`   Frontend logs: ${frontendLogs.length}`);

// Sort logs by timestamp (newest first)
const sortByTimestamp = (a, b) => {
  // Extract timestamp from filename (format: service-YYYYMMDD-HHMMSS-logs.log)
  const getTimestamp = (filename) => {
    const match = filename.match(/(\d{8})-(\d{6})/);
    return match ? match[0] : '0';
  };
  return getTimestamp(b).localeCompare(getTimestamp(a));
};

frontendLogs.sort(sortByTimestamp);
backendLogs.sort(sortByTimestamp);

// Get most recent logs
const recentBackendLog = backendLogs[0];
const recentFrontendLog = frontendLogs[0];

console.log('\n📊 Most Recent Sessions:');
if (recentBackendLog) {
  console.log(`   Backend:  ${recentBackendLog}`);
}
if (recentFrontendLog) {
  console.log(`   Frontend: ${recentFrontendLog}`);
}

// Function to parse log file
function parseLogFile(filename) {
  const filepath = path.join(logsDir, filename);
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  const logs = [];
  const parseErrors = [];

  lines.forEach((line, index) => {
    try {
      const parsed = JSON.parse(line);
      logs.push(parsed);
    } catch (e) {
      // Some lines might not be JSON (like console output)
      if (line.includes('{') && line.includes('}')) {
        // Try to extract JSON from the line
        const jsonMatch = line.match(/\{.*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            logs.push(parsed);
          } catch (e2) {
            parseErrors.push({ lineNumber: index + 1, raw: line });
          }
        } else {
          parseErrors.push({ lineNumber: index + 1, raw: line });
        }
      }
    }
  });

  return { logs, parseErrors, filename };
}

// Parse recent logs
const analysis = {
  metadata: {
    collectedAt: new Date().toISOString(),
    logsDir: logsDir,
    backendLog: recentBackendLog || 'none',
    frontendLog: recentFrontendLog || 'none'
  },
  backend: null,
  frontend: null,
  combinedTimeline: [],
  errors: [],
  warnings: [],
  correlations: {}
};

// Parse backend logs
if (recentBackendLog) {
  const { logs, parseErrors } = parseLogFile(recentBackendLog);
  analysis.backend = {
    filename: recentBackendLog,
    totalLogs: logs.length,
    parseErrors: parseErrors.length,
    logs: logs
  };

  // Extract errors and warnings
  logs.forEach(log => {
    if (log.level >= 50 || log.level === 'error' || log.level === 'fatal') {
      analysis.errors.push({ source: 'backend', ...log });
    } else if (log.level >= 40 || log.level === 'warn') {
      analysis.warnings.push({ source: 'backend', ...log });
    }

    // Track correlation IDs
    if (log.correlationId) {
      if (!analysis.correlations[log.correlationId]) {
        analysis.correlations[log.correlationId] = [];
      }
      analysis.correlations[log.correlationId].push({ source: 'backend', ...log });
    }

    // Add to timeline
    analysis.combinedTimeline.push({ source: 'backend', ...log });
  });
}

// Parse frontend logs
if (recentFrontendLog) {
  const { logs, parseErrors } = parseLogFile(recentFrontendLog);
  analysis.frontend = {
    filename: recentFrontendLog,
    totalLogs: logs.length,
    parseErrors: parseErrors.length,
    logs: logs
  };

  // Extract errors and warnings
  logs.forEach(log => {
    if (log.level >= 50 || log.level === 'error' || log.level === 'fatal' || log.levelValue >= 50) {
      analysis.errors.push({ source: 'frontend', ...log });
    } else if (log.level >= 40 || log.level === 'warn' || log.levelValue >= 40) {
      analysis.warnings.push({ source: 'frontend', ...log });
    }

    // Track correlation IDs
    if (log.correlationId) {
      if (!analysis.correlations[log.correlationId]) {
        analysis.correlations[log.correlationId] = [];
      }
      analysis.correlations[log.correlationId].push({ source: 'frontend', ...log });
    }

    // Add to timeline
    analysis.combinedTimeline.push({ source: 'frontend', ...log });
  });
}

// Sort combined timeline by timestamp
analysis.combinedTimeline.sort((a, b) => {
  const timeA = new Date(a.time || a.timestamp || 0).getTime();
  const timeB = new Date(b.time || b.timestamp || 0).getTime();
  return timeA - timeB;
});

// Create summary
analysis.summary = {
  totalLogs: analysis.combinedTimeline.length,
  backendLogs: analysis.backend ? analysis.backend.totalLogs : 0,
  frontendLogs: analysis.frontend ? analysis.frontend.totalLogs : 0,
  errors: analysis.errors.length,
  warnings: analysis.warnings.length,
  uniqueCorrelationIds: Object.keys(analysis.correlations).length,
  timeRange: {
    start: analysis.combinedTimeline[0]?.time || 'unknown',
    end: analysis.combinedTimeline[analysis.combinedTimeline.length - 1]?.time || 'unknown'
  }
};

// Write analysis to file
fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2));

console.log('\n📈 Analysis Summary:');
console.log(`   Total logs: ${analysis.summary.totalLogs}`);
console.log(`   Backend logs: ${analysis.summary.backendLogs}`);
console.log(`   Frontend logs: ${analysis.summary.frontendLogs}`);
console.log(`   Errors: ${analysis.summary.errors}`);
console.log(`   Warnings: ${analysis.summary.warnings}`);
console.log(`   Unique correlation IDs: ${analysis.summary.uniqueCorrelationIds}`);

console.log(`\n✅ Analysis complete!`);
console.log(`📁 Output file: ${outputFile}`);
console.log(`📏 File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);

// Print instructions for debugging
console.log(`\n🤖 For Debugging with Claude:`);
console.log(`1. The analysis includes the most recent frontend and backend sessions`);
console.log(`2. Logs are combined in chronological order for timeline analysis`);
console.log(`3. Correlation IDs link related frontend and backend events`);
console.log(`4. All errors and warnings are extracted for quick review`);

console.log(`\n🔧 Chrome Debug Integration:`);
console.log(`If you're also using chrome-debug and chrome-monitor:`);
console.log(`1. Start Chrome: chrome-debug start`);
console.log(`2. Start monitoring: chrome-monitor start`);
console.log(`3. Check browser console errors: chrome-monitor logs`);
console.log(`4. The frontend logs in this analysis will correlate with browser console errors`);

// Print sample errors if any
if (analysis.errors.length > 0) {
  console.log(`\n🔴 Sample Errors Found:`);
  analysis.errors.slice(0, 3).forEach((error, i) => {
    console.log(`\n${i + 1}. [${error.source.toUpperCase()}] ${error.msg || error.message || 'Unknown error'}`);
    if (error.error) {
      console.log(`   Error: ${JSON.stringify(error.error).substring(0, 200)}`);
    }
    if (error.correlationId) {
      console.log(`   Correlation ID: ${error.correlationId}`);
    }
  });

  if (analysis.errors.length > 3) {
    console.log(`\n   ... and ${analysis.errors.length - 3} more errors in the output file`);
  }
}

// Check for incomplete sessions
const backendContent = recentBackendLog ? fs.readFileSync(path.join(logsDir, recentBackendLog), 'utf-8') : '';
const frontendContent = recentFrontendLog ? fs.readFileSync(path.join(logsDir, recentFrontendLog), 'utf-8') : '';

if (recentBackendLog && !backendContent.includes('Backend session ending')) {
  console.log('\n⚠️  Warning: Backend session may still be running (no session end detected)');
}

if (recentFrontendLog && !frontendContent.includes('Frontend session ending')) {
  console.log('\n⚠️  Warning: Frontend session may still be running (no session end detected)');
}