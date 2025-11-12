// Locations feature - Type definitions
export interface Location {
  id: string;
  label: string;
  description?: string;
  barcode?: string;
  capacity?: number;
  createdAt: Date;
}
