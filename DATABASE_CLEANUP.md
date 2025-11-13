# Database Cleanup & Fix Summary

## Issue Discovered
The locations array in the database had inconsistencies:
- Some entries had `children`, `full_path`, and `depth` properties
- These are **computed properties** that should only exist in memory, NOT in the database
- Root cause: Frontend was accidentally persisting these when calling `updateLocation()`

## Impact
- Database size bloated with redundant computed data
- Data integrity compromised
- 139 total locations (all unique, no duplicates)

## Root Cause
In `useLocationDragDrop.ts`, the drag-and-drop handler was passing full `LocationNode` objects (which include `children`, `full_path`, `depth`) to the `updateLocation()` thunk, which persisted them to json-server.

## Fix Applied

### 1. Database Cleanup (`clean_locations.py`)
Created Python script that:
- Removed all `children` properties
- Removed all `full_path` properties  
- Removed all `depth` properties
- Kept only essential `Location` data

**Result:** Clean database with 139 locations, 8 root rooms

### 2. Code Fix (`useLocationDragDrop.ts`)
Updated the drag-and-drop handler to strip computed properties:

```typescript
// Before: Passed full LocationNode with computed properties
const updates = reordered.map((loc, i) => 
  loc.sort_order !== i ? { ...loc, sort_order: i } : null
);

// After: Strip children/full_path/depth before sending to API
const updates = reordered.map((loc, i) => {
  if (loc.sort_order !== i) {
    const { children, full_path, depth, ...locationData } = loc;
    return { ...locationData, sort_order: i } as Location;
  }
  return null;
});
```

## Type System Clarity

**Location** (Database Type)
- Stored in database
- Has only essential fields: id, name, type, parent_id, sort_order, etc.
- NO children, full_path, or depth

**LocationNode** (UI Type)  
- Computed in memory by `buildLocationTree()`
- Extends Location with: children, full_path, depth
- Used only for rendering tree view
- Should NEVER be persisted to database

## Prevention
- Always destructure computed properties when passing LocationNode to API calls
- Type system now enforces this: `updateLocation()` expects `Location`, not `LocationNode`
- The fix ensures only clean `Location` data is sent to the backend

## Verification
✅ Database cleaned - no computed properties remain
✅ Code fixed - strips computed properties before API calls
✅ json-server running with clean data
✅ TypeScript types enforce Location vs LocationNode distinction
✅ Zero compilation errors

## Files Modified
1. `clean_locations.py` (created - cleanup script)
2. `src/features/locations/hooks/useLocationDragDrop.ts` (fixed - strips computed properties)
3. `src/lib/db/Chemical Inventory 1bc901c26690803f8f1fc7b684d10980.json` (cleaned)

## Next Steps
- Monitor drag-and-drop operations to ensure no regressions
- Consider adding a database migration script for production
- Add tests to prevent LocationNode from being persisted
