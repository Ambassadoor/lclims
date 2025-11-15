/**
 * Label Printer Utilities
 *
 * Helper functions for formatting chemical data for label printing.
 */

import { HARDWARE_CONFIG } from '../config';

interface Chemical {
  id: string;
  Name?: string;
  CAS?: string;
  Formula?: string;
  UUID?: string;
  [key: string]: unknown;
}

/**
 * Format chemical data for basic inventory label
 * Template: Barcode1 (QR code) and Text1
 */
export function formatChemicalLabelData(chemical: Chemical) {
  // Parse Formula if it's a JSON string
  let formulaData;
  if (chemical.Formula) {
    try {
      formulaData =
        typeof chemical.Formula === 'string' ? JSON.parse(chemical.Formula) : chemical.Formula;
    } catch {
      // If parsing fails, create object from available data
      formulaData = {
        id: chemical.id,
        uuid: chemical.UUID || '',
      };
    }
  } else {
    // No Formula field, create from id and UUID
    formulaData = {
      id: chemical.id,
      uuid: chemical.UUID || '',
    };
  }

  return {
    Barcode1: JSON.stringify(formulaData), // QR code data
    Text1: chemical.id, // Display ID
  };
}

/**
 * Get default template name for chemical labels
 */
export function getDefaultChemicalTemplate(): string {
  return HARDWARE_CONFIG.defaultTemplate;
}

/**
 * Generate label data for batch printing
 */
export function formatBatchLabelData(chemicals: Chemical[]) {
  return chemicals.map(formatChemicalLabelData);
}
