

# RIPMS — RiceCycle Integrated Production Monitoring System Prototype

## Overview
A multi-page dashboard prototype for Papaya Company's zero-waste rice bran oil factory, built with React + Tailwind CSS. Uses localStorage as the simulated data store (replacing the Express/JSON file backend). Bilingual Thai/English UI.

## Architecture
- **Data Store**: Global React context + localStorage to persist Batch IDs, Inventory Levels, Orders, and Production Logs across sessions
- **Language Toggle**: Thai/English switcher in the header using a simple i18n context

## Pages & Modules

### 1. Sidebar Navigation + Layout
- Industrial-themed sidebar (dark steel/slate palette) with icons for each module
- Header with language toggle (TH/EN), "Sync" button with toast notification, and factory branding
- Collapsible sidebar for mobile responsiveness

### 2. Sourcing & Quality Module (`/sourcing`)
- **Form**: Supplier ID, Total Weight (kg), Moisture %, Acidity Level
- **Quality Gate Logic**: "Approve" button → auto-generates a Verified Batch ID (format: `BATCH-YYYYMMDD-XXXX`), assigns to silo
- **Reject Logic**: If moisture > 14% or acidity > 5%, show warning and set status to "Rejected"
- **Table**: History of all deliveries with Batch ID, status (Approved/Rejected), supplier, weight
- All numbers formatted to 2 decimal places

### 3. Production Monitoring Module (`/production`)
- **Dashboard Cards**: Machine ID, current Temperature, Pressure readings (simulated live data)
- **Form**: Log extraction — Machine ID, Start/End Time, Batch ID reference
- **Calculations**:
  - Volume of Crude Oil (Liters) = Raw Weight × 0.18 (18% extraction rate)
  - Residual Biomass (kg) = Raw Weight × 0.82
  - Production Efficiency = Liters Produced / Hours Taken
- **Table**: Production log history with all calculated outputs

### 4. Order & Logistics Module (`/logistics`)
- **Order Table**: Order ID, Customer Type (B2B/B2C), Packaging Specs, Delivery Status (Pending → Shipped → Delivered)
- **Create Order Form**: Customer type selector, product selection, quantity
- **B2B Feature**: "Generate Quality Certificate" button that creates a styled certificate preview
- **Inventory Dashboard**: Real-time levels for Rice Bran Oil, Bio-fuel, and Organic Fertilizer
- **Status Update**: Dropdown to change delivery tracking status

### 5. Functional Features
- **Sync Button**: Shows "Data Synchronized ✓" toast notification (simulated network sync)
- **Error Handling**: Visual warnings for rejected deliveries, insufficient inventory alerts
- **Data Persistence**: All data saved to localStorage, survives page refresh

### Design
- Industrial color palette: dark sidebar (#1e293b), steel gray accents, green for approvals, red for rejections
- Clean card-based layouts with proper spacing
- Responsive for desktop and tablet use

