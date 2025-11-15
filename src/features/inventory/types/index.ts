// Inventory feature - Type definitions
export interface Chemical {
  id: string;
  Name: string;
  CAS: string;
  'Unit of Measurement': string;
  'Storage Location': string;
  Status: string;
  Company: string;
  'Product #': string;
  'Max Volume': {
    Mass: number;
  };
  'Percent Remaining': string;
  'Group #'?: string;
  Labeled?: string;
  'Fill %'?: string;
  'Safety Data Sheet'?: string;
  'SDS in Date'?: string;
  'Container Type'?: string;
  'Date Received'?: string;
  Formula?: string;
  'QR Code'?: string;
  UUID?: string;
  'Initial Weight (g)'?: number;
  'Container Weight'?: number;
  'Current Weight'?: number;
  'Date Opened'?: string;
  Density?: {
    'Specific Gravity (g'?: {
      'mL)'?: number | null;
    };
  };
  'Mass of Contents (g)'?: number;
  Synonyms?: string;
  [key: string]: unknown;
}

export type ChemicalFormData = Omit<Chemical, 'id'>;
