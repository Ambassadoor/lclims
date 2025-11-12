// Inventory feature - Type definitions
export interface Chemical {
  id: string;
  name: string;
  casNumber: string;
  quantity: number;
  unit: string;
  sdsUrl?: string;
  locationId: string;
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ChemicalFormData = Omit<Chemical, 'id' | 'createdAt' | 'updatedAt'>;
