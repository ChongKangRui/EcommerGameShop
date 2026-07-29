// utils/loggerHelper.ts
type LogMeta = Record<string, unknown>;

export interface Logger {
  info: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
  error: (message: string, error?: unknown) => void;
  debug: (message: string, meta?: LogMeta) => void;
}

const baseLogger: Logger = {
  info: (message, meta) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ?? ''),
  error: (message, error) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error ?? ''),
  warn: (message, meta) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ?? ''),
  debug: (message, meta) => console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta ?? ''),
};

export const generateLogId = (): string => Math.random().toString(36).substring(7);

// Binds a requestId once; every subsequent call auto-prefixes it.
export const createScopedLogger = (requestId: string): Logger => ({
  info: (message, meta) => baseLogger.info(`[${requestId}] ${message}`, meta),
  warn: (message, meta) => baseLogger.warn(`[${requestId}] ${message}`, meta),
  error: (message, error) => baseLogger.error(`[${requestId}] ${message}`, error),
  debug: (message, meta) => baseLogger.debug(`[${requestId}] ${message}`, meta),
});

// kept for any code not yet migrated to the scoped pattern
export const logger = baseLogger;