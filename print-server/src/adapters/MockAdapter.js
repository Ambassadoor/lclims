import { IPrinterAdapter } from '../interfaces/IPrinterAdapter.js';
import { logger } from '../utils/logger.js';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { config } from '../config/config.js';

/**
 * MockAdapter
 * 
 * Mock printer adapter for development and testing.
 * Simulates printing operations without actual hardware.
 * Useful for development on non-Windows systems.
 */
export class MockAdapter extends IPrinterAdapter {
  constructor() {
    super();
    this.printJobs = [];
    this.jobCounter = 0;
  }

  async initialize() {
    logger.info('MockAdapter initialized (Development Mode)');
  }

  async print(options) {
    const { template, data, printer, copies = 1 } = options;

    logger.info('Mock Print Job', {
      template,
      printer: printer || 'Default Mock Printer',
      copies,
      dataFields: Object.keys(data),
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const jobId = ++this.jobCounter;
    const job = {
      jobId,
      template,
      data,
      printer: printer || 'Default Mock Printer',
      copies,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    this.printJobs.push(job);

    logger.info(`Mock print job ${jobId} completed successfully`);

    return {
      success: true,
      message: `Mock print job completed (${copies} ${copies === 1 ? 'copy' : 'copies'})`,
      jobId,
      data: {
        template,
        fieldsPopulated: Object.keys(data).length,
        printer: job.printer,
      },
    };
  }

  async preview(options) {
    const { template, data, width = 400, height = 300 } = options;

    logger.info('Mock Preview', { template, width, height });

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 300));

    // Generate mock base64 image (1x1 transparent PNG)
    const mockImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    return {
      success: true,
      imageBase64: mockImage,
      message: `Mock preview generated for ${template}`,
      dimensions: { width, height },
    };
  }

  async export(options) {
    const { template, data, format, outputPath } = options;

    logger.info('Mock Export', { template, format, outputPath });

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 400));

    const mockFilePath = outputPath || `/mock/exports/${template}.${format.toLowerCase()}`;

    return {
      success: true,
      filePath: mockFilePath,
      message: `Mock export completed to ${format}`,
      format,
    };
  }

  async getPrinters() {
    logger.debug('Mock getPrinters called');

    return [
      {
        name: 'Default Mock Printer',
        online: true,
        supported: true,
        model: 'Mock P-touch P950NW',
        port: 'USB001',
        supportedMedia: ['62mm x 29mm', '62mm x 100mm', '36mm x 100mm'],
      },
      {
        name: 'Secondary Mock Printer',
        online: false,
        supported: true,
        model: 'Mock P-touch P700',
        port: 'USB002',
        supportedMedia: ['24mm x 100mm', '36mm x 100mm'],
      },
    ];
  }

  async isPrinterOnline(printerName) {
    logger.debug('Mock isPrinterOnline called', { printerName });

    // Default printer is always online in mock
    return printerName === 'Default Mock Printer' || !printerName;
  }

  async getTemplates() {
    try {
      const files = await readdir(config.templateDir);
      const templates = files.filter(file => file.endsWith('.lbx') || file.endsWith('.lbl'));
      
      logger.debug('Mock getTemplates found', { count: templates.length });
      
      return templates;
    } catch (error) {
      logger.warn('Template directory not found, returning mock templates', { 
        dir: config.templateDir 
      });
      
      // Return mock templates if directory doesn't exist
      return [
        'ChemicalLabel.lbx',
        'LocationLabel.lbx',
        'AssetTag.lbx',
      ];
    }
  }

  async validateData(template, data) {
    logger.debug('Mock validateData called', { template, fieldCount: Object.keys(data).length });

    // Mock validation - always passes
    const errors = [];
    
    // Add some basic validation
    if (!data || Object.keys(data).length === 0) {
      errors.push('No data provided');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      template,
      fieldsValidated: Object.keys(data).length,
    };
  }

  async cleanup() {
    logger.info('MockAdapter cleanup', { 
      totalJobs: this.printJobs.length 
    });
    this.printJobs = [];
    this.jobCounter = 0;
  }

  /**
   * Get all mock print jobs (useful for debugging)
   */
  getPrintHistory() {
    return this.printJobs;
  }

  /**
   * Clear print history
   */
  clearHistory() {
    this.printJobs = [];
    logger.debug('Mock print history cleared');
  }

  // Expose initialized state
  get isInitialized() {
    return true; // MockAdapter is always ready
  }
}
