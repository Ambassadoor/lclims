# LIMS Project Structure

This project uses a **feature-based architecture** to organize code by domain functionality rather than technical layers.

## Directory Overview

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   ├── (dashboard)/              # Dashboard route group
│   ├── api/                      # API routes
│   ├── layout.tsx
│   └── page.tsx
│
├── features/                     # Feature modules (domain-driven)
│   ├── auth/                     # Authentication & authorization
│   │   ├── components/           # Login, logout, role guards
│   │   ├── hooks/                # useAuth, usePermissions
│   │   └── types/                # User, Role types
│   │
│   ├── inventory/                # Chemical inventory management
│   │   ├── components/           # InventoryTable, ChemicalForm
│   │   ├── hooks/                # useInventory, useChemicals
│   │   └── types/                # Chemical, InventoryItem types
│   │
│   ├── transactions/             # Check-in/out & usage logs
│   │   ├── components/           # TransactionLog, CheckInForm
│   │   ├── hooks/                # useTransactions
│   │   └── types/                # Transaction types
│   │
│   ├── locations/                # Storage location management
│   │   ├── components/           # LocationManager, LocationCard
│   │   ├── hooks/                # useLocations
│   │   └── types/                # Location types
│   │
│   ├── hardware/                 # Hardware integrations
│   │   ├── components/           # BarcodeScanner, ScaleReader
│   │   ├── hooks/                # useBarcode, useScale
│   │   └── services/             # labelPrinter, scaleService
│   │
│   └── dashboard/                # Dashboard & analytics
│       ├── components/           # DashboardStats, RecentActivity
│       └── hooks/                # useDashboard
│
├── shared/                       # Shared/common code
│   ├── components/
│   │   ├── ui/                   # Reusable UI components (Button, Input, etc.)
│   │   └── layout/               # Layout components (Navbar, Sidebar, etc.)
│   ├── hooks/                    # Common hooks (useDebounce, useLocalStorage)
│   ├── utils/                    # Utility functions (formatters, validators)
│   └── types/                    # Common type definitions
│
├── lib/                          # External integrations & core setup
│   ├── api/                      # API client configuration
│   ├── auth/                     # Auth provider setup (NextAuth/Firebase)
│   └── db/                       # Database client & schema
│
├── components/                   # Legacy (to be migrated to features/shared)
└── services/                     # Legacy (to be migrated to features)
```

## Design Principles

### 1. **Feature-Based Organization**

- Each feature is self-contained with its own components, hooks, types, and services
- Easy to locate and modify related code
- Scales well as the application grows

### 2. **Clear Separation of Concerns**

- `features/`: Domain-specific functionality
- `shared/`: Reusable across multiple features
- `lib/`: Third-party integrations and core setup
- `app/`: Next.js routing and page structure

### 3. **Colocation**

- Related code lives together (components, hooks, types for a feature)
- Reduces cognitive load when working on a feature

### 4. **Import Guidelines**

```typescript
// Feature imports (within same feature)
import { ChemicalForm } from './components/ChemicalForm';

// Shared imports
import { Button } from '@/shared/components/ui/Button';
import { useDebounce } from '@/shared/hooks/useDebounce';

// Lib imports
import { apiClient } from '@/lib/api/client';

// Cross-feature imports (use sparingly)
import { User } from '@/features/auth/types';
```

## Feature Module Structure

Each feature follows a consistent internal structure:

```
feature-name/
├── components/       # Feature-specific React components
├── hooks/           # Feature-specific custom hooks
├── services/        # API calls and business logic
├── types/           # TypeScript type definitions
├── utils/           # Feature-specific utilities
└── index.ts         # Public API (what to export)
```

## Migration Path

The existing `components/` and `services/` directories are legacy. As you develop:

1. Place new code in appropriate feature directories
2. Gradually migrate existing code as you touch it
3. Delete old directories once empty

## Key Features Map

| Feature          | Purpose                             | Key Components                               |
| ---------------- | ----------------------------------- | -------------------------------------------- |
| **auth**         | User authentication & authorization | LoginButton, RoleGuard, useAuth              |
| **inventory**    | Chemical inventory CRUD             | InventoryTable, ChemicalForm, useInventory   |
| **transactions** | Usage tracking & logs               | TransactionLog, CheckInForm, useTransactions |
| **locations**    | Storage area management             | LocationManager, useLocations                |
| **hardware**     | Barcode, scale, printer integration | BarcodeScanner, ScaleReader, labelPrinter    |
| **dashboard**    | Overview & analytics                | DashboardStats, RecentActivity               |

## Next Steps

1. Set up API routes in `src/app/api/`
2. Implement authentication with NextAuth in `src/lib/auth/`
3. Build out feature components starting with `inventory`
4. Add MUI components as needed
5. Integrate hardware services in `hardware` feature
