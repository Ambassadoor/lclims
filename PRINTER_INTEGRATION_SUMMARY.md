# Printer Integration - Implementation Summary

## What Was Built

### 1. Print Server (Windows)

- **Location:** `/print-server/`
- **Technology:** Node.js + Express with C# child process bridge
- **Adapter Pattern:** Supports MockAdapter (development) and BPacAdapter (production)
- **APIs:**
  - `POST /api/labels/print` - Print labels
  - `POST /api/labels/preview` - Generate preview images
  - `GET /api/labels/printers` - List available printers
  - `GET /api/labels/templates` - List available templates
  - `GET /health` - Health check

**Configuration:**

- Edit `.env` to set `PRINTER_ADAPTER=bpac` for real printing
- Listens on `0.0.0.0:3001` for WSL2 connectivity
- Templates stored in `print-server/templates/`

### 2. Frontend Integration (Next.js)

#### Files Created:

```
src/features/hardware/
├── services/
│   └── printerService.ts      # API client for print server
├── hooks/
│   └── usePrintLabel.ts       # React hook for printing
└── utils/
    └── labelFormatter.ts      # Data formatting utilities
```

#### Configuration:

- **Environment Variable:** `NEXT_PUBLIC_PRINT_SERVER_URL=http://172.24.224.1:3001`
- Located in `.env.local`

#### Components Updated:

1. **ChemicalFormDialog** - Added "Print label after saving" checkbox (default: checked)
2. **MultiEditForm (View Mode)** - Added "Print Label" button

## Current Label Format

**Template:** `ChemicalLabel.lbx`

- **Barcode1** (QR Code): JSON object `{"id":"CHEM-1101","uuid":"notion-uuid"}`
- **Text1**: Chemical ID (e.g., "CHEM-1101")
- **Label Size:** 0.47" width

## How It Works

### Printing from View Page:

1. User views a chemical (inventory/view page)
2. Clicks "Print Label" button
3. System formats data: `{ Barcode1: JSON.stringify(formula), Text1: chemicalID }`
4. Sends to print server via HTTP
5. Print server uses b-PAC to print to Brother P950NW
6. User sees success/error notification

### Auto-Print on Creation:

1. User creates new chemical in ChemicalFormDialog
2. "Print label after saving" checkbox is checked by default
3. After saving, label prints automatically (to be implemented)
4. User can uncheck to skip printing

## WSL2 → Windows Connectivity

**Setup:**

- Windows print server runs on `0.0.0.0:3001`
- WSL2 connects via Windows host IP: `172.24.224.1:3001`
- Firewall rule: "Node Print Server" allows inbound on port 3001

**To find Windows IP from WSL2:**

```bash
# Get WSL adapter IP from Windows
ipconfig | grep -A 4 "WSL"
# Look for IPv4 Address under "vEthernet (WSL)"
```

## Next Steps

### Immediate:

1. **Copy template to print server** - Place your `.lbx` file in `print-server/templates/ChemicalLabel.lbx`
2. **Test printing** - Navigate to a chemical view page and click "Print Label"

### To Implement:

1. **Auto-print after save** - Hook up the checkbox in ChemicalFormDialog to actually print
2. **Batch printing** - Add multi-select in inventory table → print multiple labels
3. **More templates** - Create location labels, hazard labels, etc.
4. **Error handling** - Better UI feedback for printer offline, out of labels, etc.
5. **Preview** - Show label preview before printing

## Data Flow

```
Chemical Record (Database)
    ↓
formatChemicalLabelData() - Extracts ID and Formula
    ↓
{
  Barcode1: '{"id":"CHEM-1101","uuid":"..."}',
  Text1: "CHEM-1101"
}
    ↓
printerService.print() - HTTP POST to print server
    ↓
Print Server (Windows) - Receives request
    ↓
BPacAdapter - Opens template, populates fields
    ↓
b-PAC COM - Calls Brother SDK
    ↓
Brother PT-P950NW - Prints label
```

## Troubleshooting

### Print Server Won't Start

- Ensure b-PAC SDK is installed on Windows
- Check that edge-js (or your C# bridge) is working
- Verify port 3001 isn't in use: `netstat -ano | findstr :3001`

### Can't Connect from WSL2

- Verify Windows IP: `ipconfig` → Look for WSL adapter
- Check firewall: `Get-NetFirewallRule -DisplayName "Node Print Server"`
- Test from Windows first: `curl http://localhost:3001/health`
- Update `.env.local` with correct IP

### Printing Fails

- Verify printer is on and connected
- Check template exists: `print-server/templates/ChemicalLabel.lbx`
- Ensure object names in template match: `Barcode1`, `Text1`
- Check print server logs for errors

### Formula Field Migration

Currently using: `{"id":"CHEM-1101","uuid":"notion-uuid"}`
Future format: `{"id":"CHEM-1101"}` or just `"CHEM-1101"`

The `labelFormatter.ts` handles both formats gracefully - will work with or without UUID.

## Testing Checklist

- [ ] Print server health check works
- [ ] Can see Brother printer in printer list
- [ ] Template shows up in templates list
- [ ] Print button appears on view page
- [ ] Clicking print button sends request
- [ ] Label prints with correct data
- [ ] QR code scans correctly
- [ ] Success message appears after printing
- [ ] Error message appears if printer offline
- [ ] Checkbox appears in create form
- [ ] Checkbox defaults to checked

## Configuration Reference

### Print Server (.env)

```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
PRINTER_ADAPTER=bpac
DEFAULT_PRINTER=Brother PT-P950NW
TEMPLATE_DIR=./templates
LOG_LEVEL=info
```

### Next.js (.env.local)

```env
NEXT_PUBLIC_PRINT_SERVER_URL=http://172.24.224.1:3001
```

## Architecture Notes

### Why Adapter Pattern?

- **Flexibility:** Easy to swap printer brands (Zebra, Dymo, etc.)
- **Testing:** Use MockAdapter in development without hardware
- **Maintenance:** Isolate printer-specific code

### Why C# Bridge Instead of edge-js?

- More stable COM marshalling
- Better error handling
- Easier to debug
- Cleaner separation of concerns

### Why Server-Side Printing?

- No client-side installation needed
- Works from any device/OS
- Centralized printer management
- Better security and logging

---

**Date:** November 15, 2025
**Branch:** feature/printer
**Status:** Ready for testing
