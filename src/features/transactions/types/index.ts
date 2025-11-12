// Transactions feature - Type definitions
export type TransactionType = 'check-in' | 'check-out' | 'move' | 'disposal';

export interface Transaction {
  id: string;
  chemicalId: string;
  userId: string;
  actionType: TransactionType;
  amount: number;
  unit: string;
  timestamp: Date;
  notes?: string;
}
