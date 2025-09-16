# AlphaEngine Debugging Workflow

**Created**: 16-September-2025-12:12PM IST

## CHANGELOG
- **16-Sep-2025 12:12PM IST**: Initial creation with comprehensive debugging workflow

## Overview

This document provides the complete debugging workflow for AlphaEngine, including session-based logging, Chrome integration, and log analysis procedures.

## Session-Based Logging System

### Architecture
- **Backend logs**: Each backend session creates `backend-{IST-timestamp}-logs.log`
- **Frontend logs**: Each frontend session creates `frontend-{IST-timestamp}-logs.log`
- **Automatic collection**: Logs are automatically collected from the most recent sessions
- **Correlation IDs**: All logs include correlation IDs to track requests across frontend and backend

### Log File Structure

- **Location**: `logs/` (in project root, above backend/frontend folders)
- **Naming**: `{service}-{YYYYMMDD}-{HHMMSS}-logs.log` (IST timezone)
- **Format**: NDJSON (newline-delimited JSON)
- **Contents**: Structured logs with:
  - Timestamps in IST
  - Correlation IDs
  - Request/response tracking
  - Error stack traces
  - Performance metrics

## Integrated Debugging Workflow

### Step-by-Step Process

#### 1. Start Chrome Debug Session (for frontend issues)
```bash
chrome-debug start    # Opens Chrome with debugging port 9222
chrome-monitor start  # Starts capturing console errors
```

#### 2. Reproduce the Issue
- Navigate to the application (localhost:3000)
- Perform actions that trigger the error
- Both frontend and backend logs are automatically captured

#### 3. Collect and Analyze Logs
```bash
# Collect logs from most recent sessions
cd backend
node scripts/collect-logs.js

# This will:
# - Find the most recent frontend and backend log files
# - Combine them chronologically
# - Extract all errors and warnings
# - Group by correlation IDs
# - Output: logs/debug-analysis-{timestamp}.json
```

#### 4. Check Browser Console (if needed)
```bash
chrome-monitor logs  # View captured browser console errors
```

#### 5. Provide to Claude for Analysis
The analysis file contains:
- Combined timeline of frontend and backend events
- All errors with stack traces
- Correlation IDs linking related events
- Browser console errors (if chrome-monitor was running)

## Key Features for Debugging

1. **Correlation IDs**: Link frontend actions to backend processing
2. **Session Tracking**: Each browser/server session has unique log file
3. **Automatic Selection**: Log collector automatically picks most recent sessions
4. **Chrome Integration**: Browser console errors correlate with frontend logs
5. **Timeline View**: Combined chronological view of all events

## Environment Variables for Telemetry

```env
# Backend
LOG_LEVEL=debug      # Set to 'debug' for maximum detail
NODE_ENV=development # Enables console output

# Frontend
NEXT_PUBLIC_LOG_LEVEL=debug # Browser log level
```

## Quick Debug Commands Reference

### Full Debug Workflow
```bash
chrome-debug start && chrome-monitor start  # Start browser monitoring
# ... reproduce issue in browser ...
cd backend && node scripts/collect-logs.js  # Collect logs
chrome-monitor logs | tail -50              # Check recent browser errors
```

### Backend Only
```bash
cd backend && bun run dev                   # Logs to backend-{timestamp}-logs.log
node scripts/collect-logs.js                # Analyze
```

### Frontend Only
```bash
cd frontend && bun run dev                  # Logs sent to backend
cd ../backend && node scripts/collect-logs.js # Analyze
```

## Example Debugging Session

### Scenario: User login fails silently

1. **Setup**:
   ```bash
   chrome-debug start && chrome-monitor start
   ```

2. **Reproduce**:
   - Navigate to localhost:3000/login
   - Enter credentials and click login
   - Observe silent failure

3. **Collect Data**:
   ```bash
   cd backend
   node scripts/collect-logs.js
   chrome-monitor logs | grep -i error
   ```

4. **Analyze**:
   - Check `logs/debug-analysis-{timestamp}.json`
   - Look for correlation IDs linking frontend login action to backend authentication
   - Review stack traces for authentication failures
   - Check browser console for frontend JavaScript errors

5. **Common Issues**:
   - CORS errors (visible in browser console)
   - Database connection failures (backend logs)
   - JWT token issues (correlation ID tracking)
   - API endpoint mismatches (network requests)

## Troubleshooting Common Issues

### Chrome Debug Not Starting
```bash
# Kill existing Chrome processes
pkill -f chrome
chrome-debug start
```

### Logs Not Being Generated
```bash
# Check environment variables
echo $LOG_LEVEL
echo $NODE_ENV
```

### Log Collector Not Finding Files
```bash
# Manually check log directory
ls -la logs/
# Ensure backend and frontend have run recently
```

## Integration with Claude Code

When providing logs to Claude for analysis:
1. Always use the output from `node scripts/collect-logs.js`
2. Include both the JSON analysis file and recent chrome-monitor output
3. Provide context about what actions were performed to trigger the issue
4. Mention any error patterns or frequency of occurrence