import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';
import { MockAdapter } from '../adapters/MockAdapter.js';
import { BPacAdapter } from '../adapters/BPacAdapter.js';

/**
 * PrinterService
 *
 * Business logic layer for printer operations.
 * Manages adapter selection and provides unified interface.
 */
export class PrinterService {
  constructor() {
    this.adapter = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) {
      logger.debug('PrinterService already initialized');
      return;
    }

    const adapterType = config.printerAdapter.toLowerCase();

    logger.info(`Initializing PrinterService with ${adapterType} adapter`);

    try {
      switch (adapterType) {
        case 'bpac':
          this.adapter = new BPacAdapter();
          break;
        case 'mock':
        default:
          this.adapter = new MockAdapter();
          break;
      }

      await this.adapter.initialize();
      this.initialized = true;

      logger.info('PrinterService initialized successfully', {
        adapter: adapterType,
      });
    } catch (error) {
      logger.error('Failed to initialize PrinterService', {
        error: error.message,
        adapter: adapterType,
      });
      throw error;
    }
  }

  async print(options) {
    this._ensureInitialized();

    const { template, data, printer, copies } = options;

    // Validate inputs
    if (!template) {
      return { success: false, message: 'Template name is required' };
    }

    if (!data || Object.keys(data).length === 0) {
      return { success: false, message: 'Data is required' };
    }

    // Validate template exists
    const templates = await this.adapter.getTemplates();
    if (!templates.includes(template)) {
      return {
        success: false,
        message: `Template '${template}' not found`,
        availableTemplates: templates,
      };
    }

    // Validate data
    const validation = await this.adapter.validateData(template, data);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Data validation failed',
        errors: validation.errors,
      };
    }

    // Execute print
    return await this.adapter.print(options);
  }

  async preview(options) {
    this._ensureInitialized();

    const { template, data } = options;

    if (!template) {
      return { success: false, message: 'Template name is required' };
    }

    if (!data) {
      return { success: false, message: 'Data is required' };
    }

    return await this.adapter.preview(options);
  }

  async export(options) {
    this._ensureInitialized();

    const { template, data, format } = options;

    if (!template) {
      return { success: false, message: 'Template name is required' };
    }

    if (!data) {
      return { success: false, message: 'Data is required' };
    }

    if (!format) {
      return { success: false, message: 'Export format is required' };
    }

    const validFormats = ['PDF', 'PNG', 'BMP'];
    if (!validFormats.includes(format.toUpperCase())) {
      return {
        success: false,
        message: `Invalid format. Must be one of: ${validFormats.join(', ')}`,
      };
    }

    return await this.adapter.export(options);
  }

  async getPrinters() {
    this._ensureInitialized();
    return await this.adapter.getPrinters();
  }

  async isPrinterOnline(printerName) {
    this._ensureInitialized();
    return await this.adapter.isPrinterOnline(printerName);
  }

  async getTemplates() {
    this._ensureInitialized();
    return await this.adapter.getTemplates();
  }

  async cleanup() {
    if (this.adapter) {
      await this.adapter.cleanup();
    }
    this.initialized = false;
  }

  getAdapterType() {
    return config.printerAdapter;
  }

  // Public getter for initialization state
  get isInitialized() {
    return this.initialized && this.adapter?.isInitialized;
  }

  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error('PrinterService not initialized. Call initialize() first.');
    }
  }
}

// Export singleton instance
export const printerService = new PrinterService();
