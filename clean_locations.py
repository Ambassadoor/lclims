import json

# Read the database
with open('src/lib/db/Chemical Inventory 1bc901c26690803f8f1fc7b684d10980.json', 'r') as f:
    data = json.load(f)

print(f"Original locations count: {len(data['locations'])}")

# Track seen IDs and clean locations
seen_ids = {}
cleaned_locations = []

for location in data['locations']:
    loc_id = location['id']
    
    # Skip duplicates (keep the one WITHOUT children/full_path/depth)
    if loc_id in seen_ids:
        # Prefer the version without computed fields
        existing = seen_ids[loc_id]
        has_computed = 'children' in location or 'full_path' in location or 'depth' in location
        existing_has_computed = 'children' in existing or 'full_path' in existing or 'depth' in existing
        
        if not has_computed and existing_has_computed:
            # Current is cleaner, replace
            print(f"  Replacing with cleaner version: {loc_id} - {location['name']}")
            cleaned_locations.remove(existing)
            seen_ids[loc_id] = location
        else:
            print(f"  Skipping duplicate: {loc_id} - {location['name']}")
            continue
    else:
        seen_ids[loc_id] = location
    
    # Remove computed properties that shouldn't be persisted
    if 'children' in location:
        del location['children']
    if 'full_path' in location:
        del location['full_path']
    if 'depth' in location:
        del location['depth']
    
    cleaned_locations.append(location)

# Sort by ID for consistency
cleaned_locations.sort(key=lambda x: x['id'])

original_count = len(data['locations'])
data['locations'] = cleaned_locations

print(f"Cleaned locations count: {len(cleaned_locations)}")
print(f"Removed {original_count - len(cleaned_locations)} duplicates")

# Save the cleaned data
with open('src/lib/db/Chemical Inventory 1bc901c26690803f8f1fc7b684d10980.json', 'w') as f:
    json.dump(data, f, indent=2)

print("✅ Database cleaned successfully!")
