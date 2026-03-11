import winston from 'winston';

const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  http: '\x1b[35m',
  success: '\x1b[32m',
  reset: '\x1b[0m'
};

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  const color = level === 'error' ? colors.error :
                level === 'warn' ? colors.warn :
                level === 'info' ? colors.info :
                level === 'http' ? colors.http :
                colors.success;
  
  return `${colors.reset}[${timestamp}] ${color}${level.toUpperCase()}${colors.reset}: ${message}`;
});

export const logger = winston.createLogger({
  level: 'http',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
});
