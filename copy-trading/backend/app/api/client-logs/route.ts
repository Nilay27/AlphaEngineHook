// Frontend log receiver endpoint
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';

// Store frontend session files in memory to reuse across requests
const frontendSessions = new Map<string, { logFile: string; logger: pino.Logger; stream: any }>();

function getISTTimestamp(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);

  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');
  const hours = String(istTime.getHours()).padStart(2, '0');
  const minutes = String(istTime.getMinutes()).padStart(2, '0');
  const seconds = String(istTime.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function getOrCreateFrontendLogger(sessionId: string) {
  // Check if we already have a logger for this session
  if (frontendSessions.has(sessionId)) {
    return frontendSessions.get(sessionId)!.logger;
  }

  // Create new logger for this frontend session - configurable via LOGS_DIR env variable
  const logsDir = process.env.LOGS_DIR || path.join(process.cwd(), '..', '..', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const timestamp = getISTTimestamp();
  const logFile = path.join(logsDir, `frontend-${timestamp}-logs.log`);

  console.log(`[Telemetry] Starting new frontend session log: ${logFile}`);

  const stream = pino.destination({
    dest: logFile,
    sync: false,
    mkdir: true
  });

  const logger = pino({
    level: 'debug',
    formatters: {
      level: (label) => ({ level: label }),
      bindings: () => ({
        service: 'alphaengine-frontend',
        sessionId,
        sessionFile: path.basename(logFile)
      })
    },
    timestamp: () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset);
      return `,"time":"${istTime.toISOString()}"`;
    }
  }, stream);

  // Store session info
  frontendSessions.set(sessionId, { logFile, logger, stream });

  // Clean up old sessions (keep only last 10)
  if (frontendSessions.size > 10) {
    const oldestKey = frontendSessions.keys().next().value;
    const oldSession = frontendSessions.get(oldestKey);
    if (oldSession) {
      oldSession.logger.info({ msg: 'Session expired from memory' });
      oldSession.stream.flushSync();
    }
    frontendSessions.delete(oldestKey);
  }

  logger.info({
    msg: 'Frontend session started',
    sessionId,
    userAgent: 'Will be set on first log',
    timestamp: new Date().toISOString()
  });

  return logger;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract session ID or create one
    const sessionId = body.sessionId || request.headers.get('x-session-id') || 'default';

    // Get or create logger for this session
    const logger = getOrCreateFrontendLogger(sessionId);

    // Handle different log types
    if (body.type === 'session-end') {
      logger.info({
        msg: 'Frontend session ending',
        sessionId,
        timestamp: new Date().toISOString()
      });

      // Flush and close the session
      const session = frontendSessions.get(sessionId);
      if (session) {
        session.stream.flushSync();
        frontendSessions.delete(sessionId);
      }

      return NextResponse.json({ success: true, message: 'Session ended' });
    }

    // Log the frontend event
    const logData = {
      ...body,
      sessionId,
      correlationId: body.correlationId || request.headers.get('x-correlation-id'),
      userAgent: body.userAgent || request.headers.get('user-agent'),
      url: body.url,
      timestamp: body.timestamp || new Date().toISOString()
    };

    // Use appropriate log level
    const level = body.level || 'info';
    switch (level) {
      case 'error':
      case 'fatal':
        logger.error(logData);
        break;
      case 'warn':
      case 'warning':
        logger.warn(logData);
        break;
      case 'debug':
        logger.debug(logData);
        break;
      default:
        logger.info(logData);
    }

    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Log received'
    });

  } catch (error) {
    console.error('Error receiving frontend log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process log' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-session-id, x-correlation-id'
    }
  });
}