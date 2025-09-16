import pino from 'pino';

// Generate unique session ID for this browser session
const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const API_BASE_URL = process.env.NEXT_PUBLIC_LEARNLEDGER_API_URL || 'http://localhost:3001';

// Track if we've started the session
let sessionStarted = false;

// Send log to backend
interface LogData {
  type?: string;
  msg?: string;
  level?: string;
  levelValue?: number;
  [key: string]: unknown;
}

async function sendLogToBackend(logData: LogData) {
  try {
    await fetch(`${API_BASE_URL}/api/client-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({
        ...logData,
        sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      })
    });
  } catch {
    // Fallback to sessionStorage if backend is unavailable
    const logs = JSON.parse(sessionStorage.getItem('app_logs') || '[]');
    logs.push({
      ...logData,
      sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      backendError: 'Failed to send to backend'
    });

    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.shift();
    }
    sessionStorage.setItem('app_logs', JSON.stringify(logs));
  }
}

// Start session on first log
async function ensureSessionStarted() {
  if (!sessionStarted) {
    sessionStarted = true;
    await sendLogToBackend({
      type: 'session-start',
      msg: 'Frontend session started',
      level: 'info'
    });

    // Register cleanup on page unload
    window.addEventListener('beforeunload', () => {
      // Use sendBeacon for reliability on page unload
      const data = JSON.stringify({
        type: 'session-end',
        sessionId,
        timestamp: new Date().toISOString()
      });
      navigator.sendBeacon(`${API_BASE_URL}/api/client-logs`, data);
    });
  }
}

const logger = pino({
  browser: {
    asObject: true,
    transmit: {
      level: 'debug', // Send all logs to backend
      send: async function (level, logEvent) {
        await ensureSessionStarted();

        // Send to backend
        const levelString = typeof level === 'object' && level !== null && 'label' in level
          ? (level as { label: string }).label
          : String(level);
        const levelNum = typeof level === 'object' && level !== null && 'value' in level
          ? (level as { value: number }).value
          : undefined;

        await sendLogToBackend({
          ...logEvent,
          level: levelString,
          levelValue: levelNum
        });

        // Also store locally for debugging
        const logs = JSON.parse(sessionStorage.getItem('app_logs') || '[]');
        logs.push({
          ...logEvent,
          level: levelString,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          sessionId
        });

        // Keep only last 100 logs
        if (logs.length > 100) {
          logs.shift();
        }
        sessionStorage.setItem('app_logs', JSON.stringify(logs));
      }
    }
  }
});

export { logger, sessionId };

// Helper to get logs for debugging
export function getStoredLogs() {
  return JSON.parse(sessionStorage.getItem('app_logs') || '[]');
}

// Helper to clear stored logs
export function clearStoredLogs() {
  sessionStorage.removeItem('app_logs');
}

// Helper to manually end session (useful for testing)
export async function endSession() {
  await sendLogToBackend({
    type: 'session-end',
    msg: 'Frontend session manually ended',
    level: 'info'
  });
  sessionStarted = false;
}