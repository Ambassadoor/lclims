/**
 * Printer Service
 *
 * Client for communicating with the print server.
 * Handles label printing, preview, and printer status.
 */

import { ApiClient } from '@/lib/api/client';
import { HARDWARE_CONFIG } from '../config';
import type {
  PrintOptions,
  PreviewOptions,
  PrintResult,
  PreviewResult,
  Printer,
  PrintersResponse,
  PrinterStatusResponse,
  PrintServerHealth,
} from '../types';

// Re-export types for convenience
export type {
  PrintOptions,
  PreviewOptions,
  PrintResult,
  PreviewResult,
  Printer,
  PrintersResponse,
  PrinterStatusResponse,
  PrintServerHealth,
};

class PrinterService {
  private apiClient: ApiClient;

  constructor(baseUrl: string = HARDWARE_CONFIG.printServerUrl) {
    this.apiClient = new ApiClient(baseUrl);
  }

  /**
   * Print a label
   */
  async print(options: PrintOptions): Promise<PrintResult> {
    try {
      return await this.apiClient.post<PrintResult>('api/labels/print', options);
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
      return await this.apiClient.post<PreviewResult>('api/labels/preview', options);
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
      const result = await this.apiClient.get<PrintersResponse>('api/labels/printers');
      return result.success ? result.printers : [];
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
      const result = await this.apiClient.get<{ templates: string[] }>('api/labels/templates');
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
      const result = await this.apiClient.get<PrinterStatusResponse>(
        `api/labels/printers/${encodeURIComponent(printerName)}/status`
      );
      return result.success ? result.online : false;
    } catch (error) {
      console.error('Printer status error:', error);
      return false;
    }
  }

  /**
   * Get detailed printer status
   */
  async getPrinterStatus(printerName: string): Promise<Printer | null> {
    try {
      const result = await this.apiClient.get<PrinterStatusResponse>(
        `api/labels/printers/${encodeURIComponent(printerName)}/status`
      );
      if (result.success) {
        return {
          name: result.name,
          online: result.online,
          supported: result.supported,
          mediaName: result.mediaName,
        };
      }
      return null;
    } catch (error) {
      console.error('Get printer status error:', error);
      return null;
    }
  }

  /**
   * Health check
   */
  async checkHealth(): Promise<PrintServerHealth | null> {
    try {
      return await this.apiClient.get<PrintServerHealth>('health');
    } catch (error) {
      console.error('Health check error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const printerService = new PrinterService();
