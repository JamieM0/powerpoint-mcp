import { createLogger, format, transports } from 'winston';

const { combine, timestamp, json, simple } = format;

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    process.env.NODE_ENV === 'production' ? json() : simple()
  ),
  transports: [
    new transports.Console(),
  ],
});

export { logger };