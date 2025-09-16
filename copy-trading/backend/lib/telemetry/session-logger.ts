// Session-based logger that creates a new file for each backend session
import pino from 'pino';
import * as fs from 'fs';
import * as path from 'path';

let logger: pino.Logger | null = null;
let logStream: any = null;
let sessionLogFile: string | null = null;

function getISTTimestamp(): string {
  const now = new Date();
  // Convert to IST (UTC+5:30)
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

function initializeSessionLogger() {
  if (logger) return logger;

  // Only initialize in Node.js runtime (API routes)
  if (typeof window === 'undefined' && process.versions?.node) {
    try {
      // Ensure logs directory exists - configurable via LOGS_DIR env variable
      const logsDir = process.env.LOGS_DIR || path.join(process.cwd(), '..', '..', 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      // Create session-specific log file with IST timestamp
      const timestamp = getISTTimestamp();
      sessionLogFile = path.join(logsDir, `backend-${timestamp}-logs.log`);

      console.log(`[Telemetry] Starting new backend session log: ${sessionLogFile}`);

      // Create write stream for the session
      logStream = pino.destination({
        dest: sessionLogFile,
        sync: false,
        mkdir: true
      });

      // Create logger instance
      logger = pino({
        level: process.env.LOG_LEVEL || 'debug',
        formatters: {
          level: (label) => ({ level: label }),
          bindings: () => ({
            service: 'alphaengine-backend',
            env: process.env.NODE_ENV || 'development',
            pid: process.pid,
            sessionFile: path.basename(sessionLogFile)
          })
        },
        timestamp: () => {
          const now = new Date();
          const istOffset = 5.5 * 60 * 60 * 1000;
          const istTime = new Date(now.getTime() + istOffset);
          return `,"time":"${istTime.toISOString()}"`;
        }
      }, logStream);

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        const consoleTransport = pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard'
          }
        });

        const multiStream = pino.multistream([
          { stream: logStream },
          { stream: consoleTransport }
        ]);

        logger = pino({
          level: process.env.LOG_LEVEL || 'debug',
          formatters: {
            level: (label) => ({ level: label }),
            bindings: () => ({
              service: 'alphaengine-backend',
              env: process.env.NODE_ENV || 'development',
              sessionFile: path.basename(sessionLogFile)
            })
          },
          timestamp: () => {
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istTime = new Date(now.getTime() + istOffset);
            return `,"time":"${istTime.toISOString()}"`;
          }
        }, multiStream);
      }

      logger.info({
        msg: 'Backend session started',
        sessionFile: path.basename(sessionLogFile),
        timestamp: new Date().toISOString()
      });

      // Handle process exit to properly close the log stream
      const cleanup = () => {
        if (logger) {
          logger.info({
            msg: 'Backend session ending',
            sessionFile: sessionLogFile ? path.basename(sessionLogFile) : 'unknown',
            timestamp: new Date().toISOString()
          });
          logger.flush();
        }
        if (logStream) {
          logStream.flushSync();
        }
      };

      process.on('exit', cleanup);
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
      process.on('uncaughtException', (error) => {
        if (logger) {
          logger.fatal({ error, msg: 'Uncaught exception' });
        }
        cleanup();
        process.exit(1);
      });

    } catch (error) {
      console.error('Failed to initialize session logger:', error);
      // Fallback to console
      logger = {
        info: console.log,
        error: console.error,
        warn: console.warn,
        debug: console.log,
        child: () => logger!
      } as any;
    }
  } else {
    // Fallback for non-Node environments
    logger = {
      info: console.log,
      error: console.error,
      warn: console.warn,
      debug: console.log,
      child: () => logger!
    } as any;
  }

  return logger;
}

export function getLogger() {
  if (!logger) {
    initializeSessionLogger();
  }
  return logger!;
}

export function createContextLogger(context: Record<string, any>) {
  const log = getLogger();
  return log.child(context);
}

export function getSessionLogFile(): string | null {
  return sessionLogFile;
}