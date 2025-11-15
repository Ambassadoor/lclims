import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const config = {
  // Server
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3001,
  env: process.env.NODE_ENV || 'development',

  // Printer Adapter Selection
  printerAdapter: process.env.PRINTER_ADAPTER || 'mock', // 'mock' or 'bpac'

  // Template Configuration
  templateDir: process.env.TEMPLATE_DIR || join(__dirname, '../../templates'),

  // b-PAC Configuration (Windows only)
  bpac: {
    defaultPrinter: process.env.DEFAULT_PRINTER || 'Brother PT-P950NW',
    installDir: process.env.BPAC_INSTALL_DIR || 'C:\\Program Files\\Brother bPAC3 SDK\\',
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // CORS
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:3001'],
};
