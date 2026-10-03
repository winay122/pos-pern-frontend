# ViRa POS — Frontend Client Application

A modern, high-speed, offline-first Point of Sale (POS) frontend web application built for retail shops, general stores, apparel outlets, and multi-tenant store setups.

Built using **React 18**, **TypeScript**, **Vite**, **TailwindCSS**, **Dexie.js (IndexedDB)**, **Zustand**, and **TanStack Query**.

---

## ⚡ Core Highlights & Capabilities

- 📶 **Offline-First Architecture**: Continuous checkout operation even during network drops. Local transactions are stored in IndexedDB via **Dexie.js** and automatically synced when back online.
- ⚡ **Lightning Fast Performance**: Next-gen dev & build pipeline powered by **Vite**.
- 🔍 **Barcode Scanning & Generation**: Integrates **HTML5 Camera Barcode Scanner** (`html5-qrcode`) and instant barcode rendering via **JsBarcode**.
- 🛒 **POS Billing Terminal**: Responsive touch-friendly checkout grid, fast item search, cart quantity adjustments, multi-payment support (Cash, UPI, Credit), and receipt printing.
- 🎨 **Modern Design System**: Styled with **TailwindCSS**, **Lucide Icons**, and utility classes using `clsx` & `tailwind-merge`.
- 📊 **Real-time Stock & Sales Management**: Dedicated pages for Inventory, Low Stock Alerts, Products Catalog, and Sales Invoices.
- 📱 **Progressive Web App (PWA)**: Desktop & mobile installable web app configured via `vite-plugin-pwa`.

---

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets, logos, and PWA icons
├── src/
│   ├── api/                # Axios HTTP client instance & API endpoints
│   ├── components/         # Reusable UI component library
│   │   ├── layout/         # Header, Sidebar, Navigation Layouts
│   │   └── ui/             # Modals, Buttons, Inputs, Tables, Badges
│   ├── hooks/              # Custom React hooks (Barcode scanner, Sync status)
│   ├── offline/            # Offline-first local database engine
│   │   ├── db.ts           # Dexie.js (IndexedDB) schema & store setup
│   │   ├── offlineQueue.ts # Queueing offline sales transactions
│   │   └── syncManager.ts # Background synchronization with backend API
│   ├── pages/              # Application View Screens
│   │   ├── BillingPage.tsx     # Active POS Checkout Terminal
│   │   ├── ProductsPage.tsx    # Product catalog & barcode generator
│   │   ├── StockPage.tsx       # Stock levels & low stock alerts
│   │   ├── SalesHistoryPage.tsx# Invoices & sales transactions history
│   │   ├── LoginPage.tsx       # Shop owner sign-in
│   │   ├── RegisterPage.tsx    # Store registration & setup
│   │   └── admin/              # Super Admin management dashboards
│   ├── routes/             # React Router routing setup & protected routes
│   ├── store/              # Zustand global state management
│   │   ├── authStore.ts    # User session state
│   │   ├── cartStore.ts    # Active checkout cart state
│   │   └── productStore.ts # Cached product catalog state
│   ├── types/              # TypeScript interface & type definitions
│   ├── utils/              # Currency formatters, invoice printer helpers
│   ├── App.tsx             # Root application component
│   └── main.tsx            # Application entrypoint
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: `v18.x` or `v20.x`+
- **npm**: `v9.x`+

### 1. Installation

Navigate into the `frontend` directory and install dependencies:

```bash
cd frontend
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
# Backend REST API Endpoint URL
VITE_API_BASE_URL="http://localhost:5500/api/v1"
```

### 3. Launch Development Server

Start Vite dev server with hot-module replacement (HMR):

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 📜 Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite local dev server with HMR |
| `npm run build` | Compiles TypeScript types and builds production static bundle |
| `npm run preview` | Serves production build locally for testing |

---

## 💻 Key Application Views

### 1. POS Terminal Billing (`/billing`)
- Instant product search & barcode camera scan
- Single-tap quantity update & discount calculations
- Checkout modal supporting **Cash**, **UPI**, and **Credit**
- Automatic receipt trigger for thermal printer output

### 2. Product Catalog (`/products`)
- Add/Edit product catalog items with unit types (Piece, Kg, Liter, Dozen, etc.)
- Automatic barcode generation (`JsBarcode`)
- Category-based product filtering

### 3. Stock Management (`/stock`)
- Real-time stock level monitoring
- Customizable low stock threshold alerts
- Stock count adjustments

### 4. Sales History & Invoices (`/sales`)
- Complete historical breakdown of completed transactions
- Filter sales by date range and payment mode
- Sync status indicator (**Synced** vs **Pending Offline**)

---

## 📄 License

MIT License — Built for ViRa POS Workspace.
