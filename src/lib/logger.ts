type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
  };
  const output = JSON.stringify(entry);
  switch (level) {
    case 'error': console.error(output); break;
    case 'warn': console.warn(output); break;
    case 'debug': console.debug(output); break;
    default: console.log(output);
  }
}

export const logger = {
  debug: (message: string, metadata?: Record<string, unknown>) => log('debug', message, metadata),
  info: (message: string, metadata?: Record<string, unknown>) => log('info', message, metadata),
  warn: (message: string, metadata?: Record<string, unknown>) => log('warn', message, metadata),
  error: (message: string, metadata?: Record<string, unknown>) => log('error', message, metadata),
};
