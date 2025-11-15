import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { logger } from './utils/logger.js';
import { printerService } from './services/PrinterService.js';
import labelRoutes from './routes/labelRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    adapter: printerService.getAdapterType(),
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/labels', labelRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'LCLIMS Print Server',
    version: '1.0.0',
    adapter: printerService.getAdapterType(),
    endpoints: {
      health: '/health',
      print: 'POST /api/labels/print',
      preview: 'POST /api/labels/preview',
      export: 'POST /api/labels/export',
      printers: 'GET /api/labels/printers',
      templates: 'GET /api/labels/templates',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.env === 'development' ? err.message : undefined,
  });
});

// Initialize printer service and start server
async function start() {
  try {
    logger.info('Starting LCLIMS Print Server', {
      env: config.env,
      adapter: config.printerAdapter,
    });

    // Initialize printer service
    await printerService.initialize();

    // Start server
    app.listen(config.port, config.host, () => {
      logger.info(`Server running on ${config.host}:${config.port}`, {
        adapter: printerService.getAdapterType(),
        env: config.env,
      });
      logger.info(`Health check: http://localhost:${config.port}/health`);
      logger.info(`From WSL2: http://<windows-ip>:${config.port}/health`);
      logger.info(`API docs: http://localhost:${config.port}/`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  await printerService.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  await printerService.cleanup();
  process.exit(0);
});

// Start the server
start();
