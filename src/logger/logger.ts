import pino from 'pino';

export const logger = pino({
  prettyPrint: process.env.LOG_PRETTY_PRINT || false,
  level: process.env.LOG_LEVEL || 'warn',
});
