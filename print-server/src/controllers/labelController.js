import { printerService } from '../services/PrinterService.js';
import { logger } from '../utils/logger.js';

/**
 * Label Controller
 *
 * Handles HTTP requests for label operations.
 */

export const printLabel = async (req, res) => {
  try {
    // Ensure service is initialized
    if (!printerService.initialized) {
      return res.status(503).json({
        success: false,
        message: 'Print server not ready. Please try again.',
      });
    }

    const { template, data, printer, copies = 1 } = req.body;

    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'Template is required',
      });
    }

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data is required',
      });
    }

    logger.info('Print request received', {
      template,
      printer,
      copies,
      fieldCount: Object.keys(data).length,
    });

    const result = await printerService.print({
      template,
      data,
      printer,
      copies,
    });

    const statusCode = result.success ? 200 : 500;
    res.status(statusCode).json(result);
  } catch (error) {
    logger.error('Print request error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const previewLabel = async (req, res) => {
  try {
    const { template, data, width = 400, height = 300 } = req.body;

    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'Template is required',
      });
    }

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data is required',
      });
    }

    logger.info('Preview request received', { template, width, height });

    const result = await printerService.preview({
      template,
      data,
      width,
      height,
    });

    const statusCode = result.success ? 200 : 500;
    res.status(statusCode).json(result);
  } catch (error) {
    logger.error('Preview request error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const exportLabel = async (req, res) => {
  try {
    const { template, data, format = 'PDF', outputPath } = req.body;

    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'Template is required',
      });
    }

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data is required',
      });
    }

    logger.info('Export request received', { template, format });

    const result = await printerService.export({
      template,
      data,
      format,
      outputPath,
    });

    const statusCode = result.success ? 200 : 500;
    res.status(statusCode).json(result);
  } catch (error) {
    logger.error('Export request error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getPrinters = async (req, res) => {
  try {
    logger.debug('Get printers request received');

    const printers = await printerService.getPrinters();

    res.json({
      success: true,
      printers,
      count: printers.length,
    });
  } catch (error) {
    logger.error('Get printers error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getTemplates = async (req, res) => {
  try {
    logger.debug('Get templates request received');

    const templates = await printerService.getTemplates();

    res.json({
      success: true,
      templates,
      count: templates.length,
    });
  } catch (error) {
    logger.error('Get templates error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const checkPrinterStatus = async (req, res) => {
  try {
    const { printer } = req.params;

    if (!printer) {
      return res.status(400).json({
        success: false,
        message: 'Printer name is required',
      });
    }

    logger.debug('Check printer status', { printer });

    const online = await printerService.isPrinterOnline(printer);

    res.json({
      success: true,
      printer,
      online,
    });
  } catch (error) {
    logger.error('Check printer status error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
