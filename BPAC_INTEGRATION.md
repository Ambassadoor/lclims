# Brother b-PAC 3.4 SDK Integration Guide

## Overview

The Brother P-touch Applicable Component (b-PAC) is a Windows COM/ActiveX component for programmatically controlling Brother P-touch label printers using template files (.lbx, .lbl).

**Key Limitation:** b-PAC is Windows-only and requires COM/ActiveX, which means direct browser integration is not possible. A bridge service is required.

## Documentation Location

Extracted CHM documentation: `/home/ambassadoor/playground/lclims/public/templates/bPAC_docs/`

Main pages:

- `opening.html` - Documentation home
- `reference.html` - Full API reference
- `samplecode.html` - Code examples
- `start.html` - Getting started guide

## Core Concepts

### Template-Based Workflow

1. Create label templates in P-touch Editor (save as .lbx or .lbl)
2. Define named objects in template (text fields, barcodes, images)
3. Programmatically populate template data
4. Print to connected Brother P-touch printer

### Four Main Interfaces

1. **IDocument** - Document operations (open, print, export)
2. **IObject** - Individual object manipulation (text, barcode, image)
3. **IObjects** - Collection interface for multiple objects
4. **IPrinter** - Printer status, capabilities, and configuration

## Basic Printing Workflow

```javascript
// Example: JScript/ActiveX (Windows only)
var doc = new ActiveXObject('bpac.Document');

// 1. Open template
doc.Open('C:\\Templates\\label.lbx');

// 2. Populate data (two methods)
// Method A: By index
doc.SetText(0, 'Chemical Name');
doc.SetText(1, 'Lot Number');
doc.SetBarcodeData(0, '123456789');

// Method B: By object name (more reliable)
var nameField = doc.GetObject('ChemicalName');
nameField.Text = 'Sodium Chloride';

var barcodeObj = doc.GetObject('Barcode1');
barcodeObj.SetData('LOT-2024-001');

// 3. Execute print job
doc.StartPrint('', 0); // Initialize (empty string = default printer)
doc.PrintOut(1, 0); // Queue 1 copy
doc.EndPrint(); // Execute all queued jobs

// 4. Cleanup
doc.Close();
```

## Key IDocument Methods

### File Operations

- `Open(filePath)` - Opens template file
  - Supports local paths: `C:\Templates\label.lbx`
  - Supports UNC paths: `\\server\share\label.lbx`
  - Supports URLs: `http://server/label.lbx`
- `Close()` - Close current document
- `Save()` - Save changes to template
- `SaveAs(type, filePath)` - Save as different format

### Data Manipulation

- `SetText(index, text)` - Set text by line index (0-based)
- `GetText(index, ref text)` - Get text by line index
- `GetTextCount()` - Get total text line count
- `GetTextIndex(fieldName)` - Get index by field name
- `SetBarcodeData(index, data)` - Set barcode content
- `GetBarcodeIndex(objectName)` - Get barcode index by name
- `GetObject(name)` - Get object reference by name (preferred method)

### Printing

- `StartPrint(printerName, options)` - Initialize print job
  - `printerName`: Empty string "" for default printer
  - `options`: Use `0` or `bpoDefault`
- `PrintOut(copyCount, options)` - Add copies to queue
  - Can be called multiple times before EndPrint()
- `EndPrint()` - Execute all queued print jobs
- `DoPrint(option, szOption)` - Direct print without queue

### Export/Preview

- `Export(type, filePath, dpi)` - Export to file
  - Types: PDF, BMP, PNG
- `GetImageData(type, width, height)` - Get preview as byte array

### Printer Management

- `SetPrinter(printerName)` - Set target printer
- `GetPrinterName()` - Get current printer name
- `.Printer` property - Access IPrinter interface

### Properties

- `ErrorCode` - Last error code
- `Objects` - IObjects collection of all objects
- `Width`, `Length` - Document dimensions
- `MarginTop`, `MarginBottom`, `MarginLeft`, `MarginRight` - Margins
- `Orientation` - Page orientation
- `CurrentSheet` - Active sheet in multi-sheet templates
- `SheetNames` - Array of sheet names

## Key IObject Methods & Properties

### Properties

- `Text` - Get/set text content
- `Name` - Object name from template
- `Type` - Object type (text, barcode, image, etc.)
- `Width`, `Height` - Object dimensions
- `X`, `Y` - Position coordinates
- `HorizontalAlign`, `VerticalAlign` - Alignment

### Methods

- `SetData(data)` - Set object data (text or barcode)
- `GetData()` - Get object data
- `SetFontName(fontName)` - Change font
- `GetFontName()` - Get current font
- `SetFontBold(bool)`, `GetFontBold()` - Bold styling
- `SetFontItalics(bool)`, `GetFontItalics()` - Italic styling
- `SetFontUnderline(bool)`, `GetFontUnderline()` - Underline
- `SetFontStrikeout(bool)`, `GetFontStrikeout()` - Strikethrough
- `SetFontMaxPoint(size)`, `GetFontMaxPoint()` - Font size
- `SetAlign(horizontal, vertical)` - Set alignment
- `SetPosition(x, y, width, height)` - Set position and size

## Key IPrinter Methods

- `GetInstalledPrinters()` - List all installed printers
- `IsPrinterOnline()` - Check if printer is online
- `IsPrinterSupported(printerName)` - Check b-PAC compatibility
- `GetSupportedMediaIds()` - Get compatible media (label) IDs
- `GetSupportedMediaNames()` - Get compatible media names
- `IsMediaIdSupported(mediaId)` - Check media compatibility
- `GetMediaId()` - Get current media ID
- `GetMediaName()` - Get current media name
- `SetMediaById(mediaId)` - Set media by ID
- `SetMediaByName(mediaName)` - Set media by name
- `GetPrintedTapeLength()` - Get printed length

### Properties

- `Name` - Printer name
- `PortName` - Port name (USB, COM, etc.)
- `ErrorCode` - Last printer error code
- `ErrorString` - Last printer error message

## Special Barcode Handling

### CODE128/EAN128 Control Codes

For CODE128/EAN128 barcodes, use escape sequences:

```javascript
// FNC1 insertion
doc.SetBarcodeData(0, '1234\\a567\\a'); // 1234 + FNC1 + 567 + FNC1
```

Control code mappings:

- `\a` - FNC1
- `\b` - FNC2
- `\c` - FNC3
- `\d` - FNC4
- `\0` - NUL
- `\1` - SOH
- (etc. - see full list in `IDocument_Method_SetBarcodeData.html`)

**Note:** In JavaScript strings, escape the backslash: `"\\a"` instead of `"\a"`

## Event Handling & Callbacks

### VB/C# Event Handling

```csharp
// C# example
doc.Printed += new bpac.IPrintEvents_PrintedEventHandler(HandlePrinted);

void HandlePrinted(int status, object value) {
    Console.WriteLine("Print completed with status: " + status);
}
```

### VBScript/JScript Callbacks

```javascript
// JScript example
function PrintedCallback(status, value) {
  if (status == 0) {
    alert('Print successful!');
  } else {
    alert('Print failed with status: ' + status);
  }
}

doc.SetPrintedCallback(PrintedCallback);
```

**Note:** JavaScript (modern browsers) does NOT support events or callbacks due to COM limitations.

## Template File Best Practices

### Object Naming

- Name all objects you plan to manipulate programmatically
- Use descriptive names: "ChemicalName", "LotNumber", "ExpiryDate"
- Avoid spaces in object names (use camelCase or underscores)

### Text Objects vs Database Fields

- Use database fields for simple text replacement
- Use text objects for formatting control (font, size, alignment)

### Barcode Objects

- Index is based on creation order (0, 1, 2...)
- Name barcodes for easier reference: `doc.GetBarcodeIndex("SerialBarcode")`
- Test barcode scanning after template creation

### Media/Label Size

- Set correct media size in template
- Verify printer has compatible media loaded
- Use `IPrinter.GetSupportedMediaNames()` to check compatibility

## Integration Architecture for Web Apps

Since b-PAC is Windows COM-only, web integration requires a bridge:

### Architecture Options

#### Option 1: Windows Service + REST API (Recommended)

```
React/Next.js App → HTTP Request → Windows Service (Node.js/Python/C#)
                                          ↓
                                    b-PAC COM API
                                          ↓
                                  Brother P-touch Printer
```

**Pros:**

- Clean separation of concerns
- Multiple clients can use same service
- Easy to scale and maintain
- Works with any frontend framework

**Components:**

1. Windows service/app running on print server
2. REST API endpoints (Express.js, FastAPI, ASP.NET, etc.)
3. b-PAC COM wrapper in service
4. Template files stored on server

#### Option 2: Browser Extension + Native Messaging

```
React/Next.js App → Browser Extension → Native Messaging Host
                                              ↓
                                        b-PAC COM API
```

**Pros:**

- Client-side printing (no server needed)
- Works from any web browser with extension

**Cons:**

- Requires extension installation on each client
- More complex deployment
- Security considerations

#### Option 3: Electron Desktop App

```
Electron App (React/Next.js) → Node.js backend → edge-js → b-PAC COM
```

**Pros:**

- Full desktop app experience
- Direct COM access via edge-js or ffi-napi

**Cons:**

- Not a web app anymore
- Separate deployment/installation required

## Environment Setup

### Required Software (Windows)

1. **Brother b-PAC 3.4 SDK** - Install from Brother website
2. **P-touch Editor** - For creating/editing templates
3. **Brother printer drivers** - For target printer models

### Environment Variables

- `BPACINSTALLDIR` - Points to SDK installation (e.g., `C:\Program Files\Brother bPAC3 SDK\`)

### Template Storage

- Development: Local file paths
- Production: Network share (UNC) or HTTP server
- Security: Ensure proper read permissions

## Error Handling

### Checking Errors

```javascript
doc.Open('template.lbx');
if (doc.ErrorCode != 0) {
  console.error('Failed to open template. Error: ' + doc.ErrorCode);
  // Handle error
}
```

### Common Error Scenarios

- Template file not found
- Printer offline or disconnected
- Invalid object name
- Media size mismatch
- Insufficient permissions
- COM not registered/initialized

## Sample Use Cases for LIMS

### Chemical Inventory Label

```javascript
// Print chemical storage label
doc.Open('ChemicalLabel.lbx');
doc.GetObject('ChemicalName').Text = 'Sodium Chloride';
doc.GetObject('CASNumber').Text = '7647-14-5';
doc.GetObject('Concentration').Text = '99.9%';
doc.GetObject('LotNumber').Text = 'LOT-2024-001';
doc.GetObject('ExpiryDate').Text = '2025-12-31';
doc.SetBarcodeData(0, 'CHEM-12345');
doc.StartPrint('', 0);
doc.PrintOut(1, 0);
doc.EndPrint();
doc.Close();
```

### Location Label

```javascript
// Print storage location label
doc.Open('LocationLabel.lbx');
doc.GetObject('Building').Text = 'Science Hall';
doc.GetObject('Room').Text = 'Room 201';
doc.GetObject('Cabinet').Text = 'Cabinet A';
doc.GetObject('Shelf').Text = 'Shelf 3';
doc.SetBarcodeData(0, 'LOC-SH-201-A-3');
doc.StartPrint('', 0);
doc.PrintOut(1, 0);
doc.EndPrint();
doc.Close();
```

### Batch Printing

```javascript
// Print multiple labels
doc.Open('BatchLabel.lbx');
doc.StartPrint('', 0);

for (var i = 0; i < chemicals.length; i++) {
  doc.GetObject('Name').Text = chemicals[i].name;
  doc.GetObject('ID').Text = chemicals[i].id;
  doc.PrintOut(1, 0); // Queue each label
}

doc.EndPrint(); // Print all at once
doc.Close();
```

## API Endpoint Design (for REST wrapper)

### Suggested Endpoints

```
POST /api/labels/print
Body: {
  "template": "ChemicalLabel.lbx",
  "printer": "Brother QL-800",  // optional, uses default if omitted
  "copies": 1,
  "data": {
    "ChemicalName": "Sodium Chloride",
    "CASNumber": "7647-14-5",
    "LotNumber": "LOT-2024-001",
    "Barcode1": "CHEM-12345"
  }
}

POST /api/labels/preview
Body: {
  "template": "ChemicalLabel.lbx",
  "data": { ... },
  "width": 400,
  "height": 300
}
Response: Base64 encoded image

GET /api/printers
Response: {
  "printers": [
    {
      "name": "Brother QL-800",
      "online": true,
      "supported": true,
      "media": ["62mm x 29mm", "62mm x 100mm"]
    }
  ]
}

GET /api/templates
Response: {
  "templates": [
    "ChemicalLabel.lbx",
    "LocationLabel.lbx",
    "AssetTag.lbx"
  ]
}

POST /api/labels/export
Body: {
  "template": "ChemicalLabel.lbx",
  "data": { ... },
  "format": "PDF"
}
Response: PDF file download
```

## Next Steps for Implementation

1. **Create templates in P-touch Editor**
   - Design chemical labels
   - Design location labels
   - Name all objects clearly
   - Test templates manually

2. **Set up Windows service/API**
   - Choose technology (Node.js, Python, C#)
   - Implement COM wrapper
   - Create REST endpoints
   - Add error handling and logging

3. **Integrate with Next.js frontend**
   - Create printer service module
   - Add label printing UI
   - Implement preview functionality
   - Handle printer status

4. **Testing**
   - Test with actual printer hardware
   - Verify barcode scanning
   - Test error scenarios
   - Load testing for batch printing

## Additional Resources

- Full API documentation: `/public/templates/bPAC_docs/opening.html`
- Sample code: `/public/templates/bPAC_docs/samplecode.html`
- Troubleshooting: `/public/templates/bPAC_docs/trouble.htm`
- Brother SDK download: https://www.brother.com/

## Notes

- b-PAC SDK version used: 3.4
- Documentation extracted from: `bPAC34.chm`
- Date: November 15, 2025
- Project: Lipscomb Chemistry LIMS
- Branch: feature/printer
