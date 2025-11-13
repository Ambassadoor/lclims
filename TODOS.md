# Project TODOs

## High Priority

### Location Management
- [ ] **Block deletion of locations with chemicals** - Before allowing location deletion, check if any chemicals are stored in that location (or any descendant locations). Force user to reassign chemicals to new locations before allowing deletion. Show list of affected chemicals with count.

## Features to Implement

### Authentication
- [ ] Implement Google OAuth login
- [ ] Add user roles and permissions
- [ ] Initial Weight override authorization

### Hardware Integration
- [ ] Barcode generation utility (QR codes with LOC: prefix)
- [ ] Barcode scanning integration
- [ ] Scale reader integration
- [ ] Label printer integration

### Inventory Features
- [ ] Smart storage location suggestions based on chemical properties
- [ ] Environmental condition tracking (actual temperature monitoring)
- [ ] Compliance warnings (e.g., "Flammable in non-vented area")
- [ ] Capacity tracking for locations
- [ ] Visual location map/diagram

### API & Persistence
- [ ] Replace json-server with real backend
- [ ] Implement proper API save functionality (POST/PUT)
- [ ] Transaction logging system

### Location Management
- [ ] Add `is_movable` field to track relocatable equipment (fridges, cabinets)
- [ ] Cross-parent drag and drop (move shelf from one cabinet to another)
- [ ] Location history tracking (when equipment is moved)

## Nice to Have
- [ ] Bulk edit for multiple chemicals
- [ ] Export/import functionality
- [ ] Advanced search and filtering
- [ ] Dashboard analytics and charts
- [ ] Notification system for low stock, expiring chemicals, etc.
