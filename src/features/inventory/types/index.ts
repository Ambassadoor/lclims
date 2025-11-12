// Inventory feature - Type definitions
export interface Chemical {
  ID: string;
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
}

export type ChemicalFormData = Omit<Chemical, 'ID'>;
