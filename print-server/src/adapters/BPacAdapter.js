import { IPrinterAdapter } from '../interfaces/IPrinterAdapter.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';
import { join } from 'path';
import { readdir } from 'fs/promises';

/**
 * BPacAdapter
 *
 * Brother b-PAC SDK adapter for Windows.
 * Requires edge-js to bridge Node.js to .NET/COM.
 *
 * NOTE: This adapter only works on Windows with b-PAC SDK installed.
 */
export class BPacAdapter extends IPrinterAdapter {
  constructor() {
    super();
    this.edge = null;
    this.bpacFunctions = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) {
      logger.debug('BPacAdapter already initialized');
      return;
    }

    try {
      // Dynamically import edge-js (only available on Windows)
      const edgeModule = await import('edge-js');
      this.edge = edgeModule.default || edgeModule;

      logger.info('edge-js loaded successfully');

      // Initialize b-PAC COM wrapper functions
      this.bpacFunctions = {
        print: this.edge.func(this._getPrintFunction()),
        getPrinters: this.edge.func(this._getGetPrintersFunction()),
        preview: this.edge.func(this._getPreviewFunction()),
        export: this.edge.func(this._getExportFunction()),
      };

      this.initialized = true;
      logger.info('BPacAdapter initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize BPacAdapter', {
        error: error.message,
        hint: 'Ensure edge-js is installed and running on Windows',
      });
      throw new Error(`BPacAdapter initialization failed: ${error.message}`);
    }
  }

  async print(options) {
    this._ensureInitialized();

    const { template, data, printer, copies = 1 } = options;
    const templatePath = join(config.templateDir, template);

    logger.info('BPac Print Job', {
      template,
      printer: printer || config.bpac.defaultPrinter,
      copies,
    });

    try {
      const result = await this.bpacFunctions.print({
        templatePath,
        data,
        printer: printer || config.bpac.defaultPrinter,
        copies,
      });

      if (result.success) {
        logger.info('Print job completed successfully', { template });
      } else {
        logger.error('Print job failed', { template, error: result.message });
      }

      return result;
    } catch (error) {
      logger.error('Print operation error', { error: error.message, template });
      return {
        success: false,
        message: `Print failed: ${error.message}`,
      };
    }
  }

  async preview(options) {
    this._ensureInitialized();

    const { template, data, width = 400, height = 300 } = options;
    const templatePath = join(config.templateDir, template);

    logger.info('BPac Preview', { template, width, height });

    try {
      const result = await this.bpacFunctions.preview({
        templatePath,
        data,
        width,
        height,
      });

      return result;
    } catch (error) {
      logger.error('Preview operation error', { error: error.message, template });
      return {
        success: false,
        message: `Preview failed: ${error.message}`,
      };
    }
  }

  async export(options) {
    this._ensureInitialized();

    const { template, data, format, outputPath } = options;
    const templatePath = join(config.templateDir, template);

    logger.info('BPac Export', { template, format, outputPath });

    try {
      const result = await this.bpacFunctions.export({
        templatePath,
        data,
        format: format.toUpperCase(),
        outputPath,
      });

      return result;
    } catch (error) {
      logger.error('Export operation error', { error: error.message, template });
      return {
        success: false,
        message: `Export failed: ${error.message}`,
      };
    }
  }

  async getPrinters() {
    this._ensureInitialized();

    logger.debug('Getting installed printers');

    try {
      const result = await this.bpacFunctions.getPrinters({});
      return result.printers || [];
    } catch (error) {
      logger.error('Failed to get printers', { error: error.message });
      return [];
    }
  }

  async isPrinterOnline(printerName) {
    const printers = await this.getPrinters();
    const printer = printers.find((p) => p.name === printerName);
    return printer ? printer.online : false;
  }

  async getTemplates() {
    try {
      const files = await readdir(config.templateDir);
      const templates = files.filter((file) => file.endsWith('.lbx') || file.endsWith('.lbl'));
      logger.debug('Templates found', { count: templates.length });
      return templates;
    } catch (error) {
      logger.error('Failed to read template directory', { error: error.message });
      return [];
    }
  }

  async validateData(template, data) {
    // Basic validation
    if (!data || Object.keys(data).length === 0) {
      return {
        valid: false,
        errors: ['No data provided'],
      };
    }

    // Could be enhanced to check template for required fields
    return {
      valid: true,
      template,
      fieldsValidated: Object.keys(data).length,
    };
  }

  async cleanup() {
    logger.info('BPacAdapter cleanup');
    this.initialized = false;
  }

  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error('BPacAdapter not initialized. Call initialize() first.');
    }
  }

  // Expose initialized state
  get isInitialized() {
    return this.initialized;
  }

  // C# functions that will be executed via edge-js
  _getPrintFunction() {
    return `
      #r "System.Runtime.InteropServices"
      using System;
      using System.Threading.Tasks;
      using System.Dynamic;

      public class Startup
      {
        public async Task<object> Invoke(dynamic input)
        {
          try
          {
            // Load b-PAC COM object
            Type docType = Type.GetTypeFromProgID("bpac.Document");
            dynamic doc = Activator.CreateInstance(docType);

            // Open template
            if (!doc.Open((string)input.templatePath))
            {
              return new { success = false, message = "Failed to open template: " + input.templatePath };
            }

            // Set data for each field
            foreach (var kvp in (IDictionary<string, object>)input.data)
            {
              try
              {
                dynamic obj = doc.GetObject(kvp.Key);
                if (obj != null)
                {
                  obj.Text = kvp.Value.ToString();
                }
              }
              catch (Exception ex)
              {
                // Field not found or error setting, continue
                Console.WriteLine("Warning: Could not set field " + kvp.Key + ": " + ex.Message);
              }
            }

            // Set printer if specified
            if (!string.IsNullOrEmpty((string)input.printer))
            {
              doc.SetPrinter((string)input.printer, true);
            }

            // Print
            doc.StartPrint("", 0);
            doc.PrintOut((int)input.copies, 0);
            doc.EndPrint();
            doc.Close();

            return new { success = true, message = "Print completed successfully" };
          }
          catch (Exception ex)
          {
            return new { success = false, message = "Print error: " + ex.Message };
          }
        }
      }
    `;
  }

  _getGetPrintersFunction() {
    return `
      using System;
      using System.Collections.Generic;
      using System.Threading.Tasks;

      public class Startup
      {
        public async Task<object> Invoke(dynamic input)
        {
          try
          {
            Type docType = Type.GetTypeFromProgID("bpac.Document");
            dynamic doc = Activator.CreateInstance(docType);

            dynamic printer = doc.Printer;
            var printerNames = printer.GetInstalledPrinters();

            var printers = new List<object>();
            foreach (string name in printerNames)
            {
              printer.Name = name;
              bool online = printer.IsPrinterOnline();
              bool supported = printer.IsPrinterSupported(name);

              printers.Add(new {
                name = name,
                online = online,
                supported = supported,
                port = printer.PortName
              });
            }

            return new { printers = printers };
          }
          catch (Exception ex)
          {
            return new { printers = new List<object>(), error = ex.Message };
          }
        }
      }
    `;
  }

  _getPreviewFunction() {
    return `
      using System;
      using System.Threading.Tasks;

      public class Startup
      {
        public async Task<object> Invoke(dynamic input)
        {
          try
          {
            Type docType = Type.GetTypeFromProgID("bpac.Document");
            dynamic doc = Activator.CreateInstance(docType);

            if (!doc.Open((string)input.templatePath))
            {
              return new { success = false, message = "Failed to open template" };
            }

            // Set data
            foreach (var kvp in (IDictionary<string, object>)input.data)
            {
              try
              {
                dynamic obj = doc.GetObject(kvp.Key);
                if (obj != null) obj.Text = kvp.Value.ToString();
              }
              catch { }
            }

            // Export as BMP and convert to base64
            var imageData = doc.GetImageData(0, (int)input.width, (int)input.height);
            string base64 = Convert.ToBase64String((byte[])imageData);

            doc.Close();

            return new { success = true, imageBase64 = base64 };
          }
          catch (Exception ex)
          {
            return new { success = false, message = "Preview error: " + ex.Message };
          }
        }
      }
    `;
  }

  _getExportFunction() {
    return `
      using System;
      using System.Threading.Tasks;

      public class Startup
      {
        public async Task<object> Invoke(dynamic input)
        {
          try
          {
            Type docType = Type.GetTypeFromProgID("bpac.Document");
            dynamic doc = Activator.CreateInstance(docType);

            if (!doc.Open((string)input.templatePath))
            {
              return new { success = false, message = "Failed to open template" };
            }

            // Set data
            foreach (var kvp in (IDictionary<string, object>)input.data)
            {
              try
              {
                dynamic obj = doc.GetObject(kvp.Key);
                if (obj != null) obj.Text = kvp.Value.ToString();
              }
              catch { }
            }

            // Export (0=PDF, 1=BMP, 2=PNG)
            int exportType = 0; // Default PDF
            if (input.format == "BMP") exportType = 1;
            if (input.format == "PNG") exportType = 2;

            bool exported = doc.Export(exportType, (string)input.outputPath, 300);
            doc.Close();

            if (exported)
            {
              return new { success = true, filePath = (string)input.outputPath };
            }
            else
            {
              return new { success = false, message = "Export failed" };
            }
          }
          catch (Exception ex)
          {
            return new { success = false, message = "Export error: " + ex.Message };
          }
        }
      }
    `;
  }
}
