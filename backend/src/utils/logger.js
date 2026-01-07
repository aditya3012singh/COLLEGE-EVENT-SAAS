/**
 * Logger Utility
 * Structured logging with timestamps and log levels
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const isDev = process.env.NODE_ENV !== 'production';
  
  const logEntry = {
    timestamp,
    level,
    message,
    ...(isDev || level === 'ERROR' ? data : {}),
  };

  if (level === 'ERROR') {
    console.error(JSON.stringify(logEntry, null, isDev ? 2 : 0));
  } else if (level === 'WARN') {
    console.warn(JSON.stringify(logEntry, null, isDev ? 2 : 0));
  } else {
    console.log(JSON.stringify(logEntry, null, isDev ? 2 : 0));
  }
};

export const logger = {
  error: (message, data) => log(LOG_LEVELS.ERROR, message, data),
  warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
  info: (message, data) => log(LOG_LEVELS.INFO, message, data),
  debug: (message, data) => log(LOG_LEVELS.DEBUG, message, data),
};

export default logger;
