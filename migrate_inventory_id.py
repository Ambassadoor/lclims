#!/usr/bin/env python3
"""
Migrate inventory items from uppercase ID to lowercase id
"""

import json
import sys

# Read the database file
with open('src/lib/db/Chemical Inventory 1bc901c26690803f8f1fc7b684d10980.json', 'r') as f:
    data = json.load(f)

# Update inventory items: ID -> id
if 'inventory' in data:
    for item in data['inventory']:
        if 'ID' in item:
            item['id'] = item.pop('ID')
    print(f"✓ Migrated {len(data['inventory'])} inventory items from 'ID' to 'id'")

# Write back to file with proper formatting
with open('src/lib/db/Chemical Inventory 1bc901c26690803f8f1fc7b684d10980.json', 'w') as f:
    json.dump(data, f, indent=2)

print("✓ Migration complete!")
print("\nNext steps:")
print("1. Update TypeScript types: ID -> id")
print("2. Restart json-server without --id flag")
