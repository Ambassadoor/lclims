/**
 * Printer Service
 *
 * Client for communicating with the print server.
 * Handles label printing, preview, and printer status.
 */

const PRINT_SERVER_URL = process.env.NEXT_PUBLIC_PRINT_SERVER_URL || 'http://localhost:3001';

export interface PrintOptions {
  template: string;
  data: Record<string, string>;
  printer?: string;
  copies?: number;
}

export interface PreviewOptions {
  template: string;
  data: Record<string, string>;
  width?: number;
  height?: number;
}

export interface PrintResult {
  success: boolean;
  message: string;
  jobId?: string;
  data?: any;
}

export interface PreviewResult {
  success: boolean;
  imageBase64?: string;
  message?: string;
}

export interface Printer {
  name: string;
  online: boolean;
  supported: boolean;
  model?: string;
  port?: string;
  supportedMedia?: string[];
}

class PrinterService {
  private baseUrl: string;

  constructor(baseUrl: string = PRINT_SERVER_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Print a label
   */
  async print(options: PrintOptions): Promise<PrintResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/labels/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Print error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect to print server',
      };
    }
  }

  /**
   * Generate preview of label
   */
  async preview(options: PreviewOptions): Promise<PreviewResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/labels/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Preview error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect to print server',
      };
    }
  }

  /**
   * Get list of available printers
   */
  async getPrinters(): Promise<Printer[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/labels/printers`);
      const result = await response.json();
      return result.printers || [];
    } catch (error) {
      console.error('Get printers error:', error);
      return [];
    }
  }

  /**
   * Get list of available templates
   */
  async getTemplates(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/labels/templates`);
      const result = await response.json();
      return result.templates || [];
    } catch (error) {
      console.error('Get templates error:', error);
      return [];
    }
  }

  /**
   * Check printer status
   */
  async isPrinterOnline(printerName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/labels/printers/${printerName}/status`);
      const result = await response.json();
      return result.online || false;
    } catch (error) {
      console.error('Printer status error:', error);
      return false;
    }
  }

  /**
   * Health check
   */
  async checkHealth(): Promise<{ status: string; adapter: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const printerService = new PrinterService();
