# 🧪 LIMS MVP — Technical Design Document

## 1. Overview

**Project Name:** _LIMS (Lab Inventory Management System)_  
**Author:** Caleb Pittman  
**Status:** MVP Planning / Early Development  

### Summary
The LIMS application centralizes and standardizes critical laboratory information — including chemical inventory, equipment, personnel, and lab procedures. It provides intuitive workflows and hardware integration for efficient lab data management and record keeping.

### Problem Statement
Current lab records and inventories are spread across multiple systems (spreadsheets, Notion, paper logs), leading to inefficiencies and inconsistent data. This LIMS will unify those records in one platform, simplifying data entry and improving traceability and data insights.

### MVP Goals
1. Centralized chemical inventory management  
2. Streamlined CRUD interfaces for adding and updating data  
3. Integration with common lab hardware (barcode scanners, scales, label printers)  
4. Google-based authentication for easy sign-in and role-based access  

---

## 2. Core Features (MVP Scope)

### 2.1 Authentication & Roles
- Google OAuth-based login (leveraging Google Workspace for identity)
- Roles: Admin, Staff, Viewer  
- Role-based UI controls and permissions for sensitive data and actions  

### 2.2 Inventory Management
- Add, edit, delete, and search inventory items  
- Chemical metadata: name, CAS number, quantity, SDS link, location, expiration date  
- Import existing inventory data from Notion (CSV export → DB import)

### 2.3 Hardware Integrations
- **Barcode Scanner (USB/Phone)**  
  - Lookup and manage items quickly  
  - Add scanned items to queues for batch actions (check-in/out, move, disposal)  
- **Scale Integration (USB)**  
  - Capture current weight during check-in/out to calculate usage  
- **Label Printer Integration (Brother SDK)**  
  - Generate and print barcodes for new items and locations  

---

## 3. Future Features (Post-MVP)
- Additional databases for:
  - Courses and procedures
  - Personnel and lab roles
  - Waste tracking and disposal records  
- Reporting (usage trends, purchase history, cost forecasting)  
- Mobile-friendly interface or companion mobile app  
- Real-time updates and notifications (e.g., low stock alerts)

---

## 4. Technology Stack

| Layer | Technology | Notes |
|-------|-------------|-------|
| **Frontend** | React + TypeScript + MUI (+ optional Tailwind)** | MUI for rapid layout, Tailwind for styling flexibility |
| **Backend** | Node.js (Express or Fastify) | REST API handling auth, CRUD, and device endpoints |
| **Database** | PostgreSQL (eventual goal) | Notion as initial data source; import/export via CSV bridge |
| **Auth** | Google OAuth (via Firebase Auth or NextAuth) | Simplifies sign-in for Gmail-based accounts |
| **Hosting** | Vercel / Render / AWS | TBD based on deployment preferences |
| **Label Printing** | Brother SDK | Direct hardware control for printing barcodes |
| **Hardware Integration** | Web Serial API / Node USB APIs | Communication with scales and scanners |

---

## 5. System Architecture

### 5.1 Overview

```
[ User ]
   ↓
[ React Frontend ] ⇄ [ REST API / Node Backend ] ⇄ [ PostgreSQL Database ]
                                   ↓
                      [ USB Scale | Barcode Scanner | Brother Label Printer ]
```

### 5.2 Data Flow
1. User logs in via Google OAuth → backend issues JWT session  
2. Frontend requests data from backend via authenticated API calls  
3. User performs inventory operations (CRUD, scan, print, weigh)  
4. Backend logs transactions and updates DB  

---

## 6. Data Model (Draft)

| Table | Description | Example Fields |
|--------|--------------|----------------|
| **users** | Authenticated app users | id, google_id, name, email, role |
| **chemicals** | Inventory items | id, name, cas_number, quantity, unit, sds_url, location_id, expiration_date |
| **locations** | Physical storage areas | id, label, description |
| **transactions** | Check-in/out & usage logs | id, chemical_id, user_id, action_type, amount, timestamp |

---

## 7. UI / UX Notes
- **Dashboard:** Overview of inventory stats and recent activity  
- **Inventory Table:** Search, sort, and filter functionality (MUI DataGrid)  
- **Item Detail:** SDS link, weight history, and label reprint button  
- **Quick Scan Mode:** Optimized interface for barcode scanning workflows  
- **Form Design:** MUI components for clean, consistent input handling  

---

## 8. Development Roadmap (MVP)

| Milestone | Description |
|------------|--------------|
| **1. Project Setup** | Repo + MUI/React/TypeScript + Node backend scaffold |
| **2. Google OAuth Setup** | Implement login and user role handling |
| **3. Inventory CRUD** | Build REST API and frontend forms |
| **4. Notion → SQL Migration** | Import existing data and establish DB schema |
| **5. Hardware Integration** | Implement scanner + printer support |
| **6. Scale Integration** | Add weight capture and transaction updates |
| **7. Testing & Deployment** | Local testing → deploy MVP to Vercel or Render |

---

## 9. Open Questions / To-Do
- Decide between Firebase Auth vs. NextAuth for Google login  
- Confirm browser compatibility for Web Serial/USB APIs  
- Explore best method for handling hardware connections in hybrid setups (local service vs. browser API)  
- Plan label template structure for Brother SDK (QR + text layout)  

---

## Appendix: Google OAuth Setup (Example with NextAuth + React)

Example configuration for NextAuth:

```ts
// pages/api/auth/[...nextauth].ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
```

---
