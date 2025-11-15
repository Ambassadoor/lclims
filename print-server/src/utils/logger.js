import { config } from '../config/config.js';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = levels[config.logLevel] || levels.info;

const formatMessage = (level, message, data) => {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
};

export const logger = {
  error: (message, data) => {
    if (currentLevel >= levels.error) {
      console.error(formatMessage('error', message, data));
    }
  },

  warn: (message, data) => {
    if (currentLevel >= levels.warn) {
      console.warn(formatMessage('warn', message, data));
    }
  },

  info: (message, data) => {
    if (currentLevel >= levels.info) {
      console.log(formatMessage('info', message, data));
    }
  },

  debug: (message, data) => {
    if (currentLevel >= levels.debug) {
      console.log(formatMessage('debug', message, data));
    }
  },
};
