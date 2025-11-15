# LCLIMS Print Server

Label printing server for Lipscomb Chemistry LIMS using Brother b-PAC SDK.

## Prerequisites

### For Development (Mock Adapter)

- Node.js 18+ (any OS)

### For Production (b-PAC Adapter)

- Windows OS (10/11 or Server)
- Node.js 18+
- Brother b-PAC 3.4 SDK installed
- Brother P-touch printer (P950NW)
- Label templates (.lbx files)

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
# Use 'mock' for development, 'bpac' for production
PRINTER_ADAPTER=mock

# For b-PAC adapter (Windows only)
DEFAULT_PRINTER=Brother PT-P950NW
TEMPLATE_DIR=C:\\LabelTemplates
```

## Running

### Development (Mock Adapter)

```bash
npm run dev
```

### Production (b-PAC Adapter on Windows)

```bash
# Set adapter to 'bpac' in .env
PRINTER_ADAPTER=bpac npm start
```

## API Endpoints

### Print Label

```http
POST /api/labels/print
Content-Type: application/json

{
  "template": "ChemicalLabel.lbx",
  "printer": "Brother PT-P950NW",  // optional
  "copies": 1,
  "data": {
    "ChemicalName": "Sodium Chloride",
    "CASNumber": "7647-14-5",
    "LotNumber": "LOT-2024-001",
    "Barcode1": "CHEM-12345"
  }
}
```

### Get Label Preview

```http
POST /api/labels/preview
Content-Type: application/json

{
  "template": "ChemicalLabel.lbx",
  "width": 400,
  "height": 300,
  "data": { ... }
}
```

### List Printers

```http
GET /api/printers
```

### List Templates

```http
GET /api/templates
```

### Health Check

```http
GET /health
```

## Architecture

The server uses the **Adapter Pattern** to support multiple printer backends:

```
┌─────────────────┐
│  Express API    │
└────────┬────────┘
         │
    ┌────▼────────────┐
    │ PrinterService  │
    └────────┬────────┘
             │
    ┌────────▼──────────┐
    │ IPrinterAdapter   │ (Interface)
    └────────┬──────────┘
             │
    ┌────────┴──────────┐
    │                   │
┌───▼────────┐  ┌──────▼─────┐
│ MockAdapter│  │ BPacAdapter│
└────────────┘  └────────────┘
```

### Adding New Printer Support

To add support for a different printer (Zebra, Dymo, etc.):

1. Create new adapter in `src/adapters/`
2. Implement `IPrinterAdapter` interface
3. Update config to use new adapter

## Project Structure

```
print-server/
├── package.json
├── .env
├── src/
│   ├── index.js                    # Server entry point
│   ├── config/
│   │   └── config.js               # Configuration
│   ├── interfaces/
│   │   └── IPrinterAdapter.js      # Adapter interface
│   ├── adapters/
│   │   ├── MockAdapter.js          # Mock for testing
│   │   └── BPacAdapter.js          # Brother b-PAC implementation
│   ├── services/
│   │   └── PrinterService.js       # Business logic
│   ├── controllers/
│   │   └── labelController.js      # Request handlers
│   ├── routes/
│   │   └── labelRoutes.js          # API routes
│   └── utils/
│       └── logger.js               # Logging utility
└── templates/
    └── *.lbx                       # Label templates
```

## Development Workflow

1. **WSL2 Development:**
   - Use MockAdapter for API development
   - Test integration with Next.js app
   - No Windows required

2. **Windows Testing:**
   - Switch to BPacAdapter in .env
   - Run on Windows host
   - Test with actual printer

3. **Production:**
   - Deploy to dedicated Windows server
   - Use BPacAdapter
   - Connect to production printer

## Troubleshooting

### "Cannot find module 'edge-js'"

- Normal when running MockAdapter (not needed for mock)
- Only required for BPacAdapter on Windows

### "Template not found"

- Check TEMPLATE_DIR path in .env
- Ensure .lbx files exist in templates directory

### "Printer not responding"

- Verify printer is on and connected
- Check DEFAULT_PRINTER name matches installed printer
- Ensure b-PAC SDK is installed (Windows)

## License

ISC
