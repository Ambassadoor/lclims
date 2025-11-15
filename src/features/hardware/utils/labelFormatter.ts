/**
 * Label Printer Utilities
 *
 * Helper functions for formatting chemical data for label printing.
 */

interface Chemical {
  ID: string;
  Name?: string;
  CAS?: string;
  Formula?: string;
  UUID?: string;
  [key: string]: any;
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
        id: chemical.ID,
        uuid: chemical.UUID || '',
      };
    }
  } else {
    // No Formula field, create from ID and UUID
    formulaData = {
      id: chemical.ID,
      uuid: chemical.UUID || '',
    };
  }

  return {
    Barcode1: JSON.stringify(formulaData), // QR code data
    Text1: chemical.ID, // Display ID
  };
}

/**
 * Get default template name for chemical labels
 */
export function getDefaultChemicalTemplate(): string {
  return 'ChemicalQRCodes.lbx';
}

/**
 * Generate label data for batch printing
 */
export function formatBatchLabelData(chemicals: Chemical[]) {
  return chemicals.map(formatChemicalLabelData);
}
