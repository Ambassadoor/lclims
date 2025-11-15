// Hardware feature - Configuration

export const HARDWARE_CONFIG = {
  printServerUrl: process.env.NEXT_PUBLIC_PRINT_SERVER_URL || 'http://localhost:3001',
  defaultTemplate: 'ChemicalQRCodes.lbx',
  defaultCopies: 1,
} as const;
