// Telemetry exports for API routes only
// Do NOT use in middleware.ts as it runs in Edge Runtime

import { getLogger, createContextLogger, getSessionLogFile } from './session-logger';

// For backwards compatibility
export const logger = {
  info: (...args: any[]) => getLogger().info(...args),
  error: (...args: any[]) => getLogger().error(...args),
  warn: (...args: any[]) => getLogger().warn(...args),
  debug: (...args: any[]) => getLogger().debug(...args),
  child: (context: any) => getLogger().child(context)
};

export { createContextLogger, getSessionLogFile };

export function initTelemetry() {
  // Logger initializes on first use
  getLogger();
}

// Simple middleware wrapper for API routes
export function withTelemetry(
  handler: (req: any, logger: any) => Promise<any>
) {
  return async (req: any) => {
    const correlationId = req.headers?.get?.('x-correlation-id') || crypto.randomUUID();
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    // Create request-specific logger
    const requestLogger = createContextLogger({
      correlationId,
      requestId,
      method: req.method,
      path: req.url || req.nextUrl?.pathname,
    });

    try {
      requestLogger.info('Request started');

      const response = await handler(req, requestLogger);
      const duration = Date.now() - startTime;

      requestLogger.info({
        msg: 'Request completed',
        status: response?.status,
        duration,
      });

      // Add tracking headers to response
      if (response?.headers?.set) {
        response.headers.set('x-correlation-id', correlationId);
        response.headers.set('x-request-id', requestId);
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      requestLogger.error({
        msg: 'Request failed',
        error: error as Error,
        stack: (error as Error).stack,
        duration,
      });

      throw error;
    }
  };
}