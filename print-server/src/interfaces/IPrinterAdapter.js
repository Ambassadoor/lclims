/**
 * IPrinterAdapter Interface
 * 
 * All printer adapters must implement this interface.
 * This allows the system to support multiple printer types
 * (Brother b-PAC, Zebra, Dymo, etc.) using the same API.
 */

export class IPrinterAdapter {
  /**
   * Initialize the printer adapter
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented');
  }

  /**
   * Print a label using a template and data
   * @param {Object} options - Print options
   * @param {string} options.template - Template filename (e.g., 'ChemicalLabel.lbx')
   * @param {Object} options.data - Key-value pairs for template fields
   * @param {string} [options.printer] - Printer name (optional, uses default if not provided)
   * @param {number} [options.copies=1] - Number of copies to print
   * @returns {Promise<Object>} - Print result { success, message, jobId? }
   */
  async print(options) {
    throw new Error('print() must be implemented');
  }

  /**
   * Generate preview image of a label
   * @param {Object} options - Preview options
   * @param {string} options.template - Template filename
   * @param {Object} options.data - Key-value pairs for template fields
   * @param {number} [options.width=400] - Preview width in pixels
   * @param {number} [options.height=300] - Preview height in pixels
   * @returns {Promise<Object>} - Preview result { success, imageBase64?, message? }
   */
  async preview(options) {
    throw new Error('preview() must be implemented');
  }

  /**
   * Export label to file (PDF, PNG, etc.)
   * @param {Object} options - Export options
   * @param {string} options.template - Template filename
   * @param {Object} options.data - Key-value pairs for template fields
   * @param {string} options.format - Export format ('PDF', 'PNG', 'BMP')
   * @param {string} [options.outputPath] - Output file path
   * @returns {Promise<Object>} - Export result { success, filePath?, fileBase64?, message? }
   */
  async export(options) {
    throw new Error('export() must be implemented');
  }

  /**
   * Get list of available printers
   * @returns {Promise<Array>} - Array of printer objects
   */
  async getPrinters() {
    throw new Error('getPrinters() must be implemented');
  }

  /**
   * Check if a specific printer is online
   * @param {string} printerName - Printer name
   * @returns {Promise<boolean>} - True if printer is online
   */
  async isPrinterOnline(printerName) {
    throw new Error('isPrinterOnline() must be implemented');
  }

  /**
   * Get list of available templates
   * @returns {Promise<Array>} - Array of template filenames
   */
  async getTemplates() {
    throw new Error('getTemplates() must be implemented');
  }

  /**
   * Validate template data against template
   * @param {string} template - Template filename
   * @param {Object} data - Data to validate
   * @returns {Promise<Object>} - Validation result { valid, errors? }
   */
  async validateData(template, data) {
    throw new Error('validateData() must be implemented');
  }

  /**
   * Cleanup resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    throw new Error('cleanup() must be implemented');
  }
}
