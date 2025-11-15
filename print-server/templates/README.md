# Label Templates

Place your Brother P-touch Editor template files (.lbx, .lbl) in this directory.

## Template Naming Convention

Use descriptive names that match your use cases:

- `ChemicalLabel.lbx` - Chemical inventory labels
- `LocationLabel.lbx` - Storage location labels
- `AssetTag.lbx` - Equipment/asset tags
- `HazardLabel.lbx` - Hazard warning labels

## Creating Templates

1. Open P-touch Editor (Windows)
2. Design your label layout
3. **Important:** Name all objects you'll populate programmatically
   - Right-click object → Properties → Name
   - Use descriptive names: `ChemicalName`, `LotNumber`, `Barcode1`
4. Save as `.lbx` format
5. Copy to this directory

## Object Naming Best Practices

- Use camelCase or underscores (no spaces)
- Be descriptive: `ExpiryDate` not `Date1`
- For barcodes: Name them like `SerialBarcode`, `LotBarcode`
- For text fields: Match your database column names when possible

## Example Template Structure

```
ChemicalLabel.lbx
├─ ChemicalName (text object)
├─ CASNumber (text object)
├─ Concentration (text object)
├─ LotNumber (text object)
├─ ExpiryDate (text object)
├─ HazardSymbol (image object)
└─ Barcode1 (barcode object)
```

## Testing Templates

Test your templates manually in P-touch Editor before using them programmatically:

1. Open template
2. Manually enter data in all fields
3. Print a test label
4. Verify barcode scans correctly
5. Check label dimensions fit printer media
