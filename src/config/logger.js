// logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', // Niveau de log (info, warn, error)
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'process.log' }),
  ],
});

export default logger;
