# Novadrop — High-Performance D2C E-Commerce Storefront & Admin Hub

Novadrop is a data-driven, state-of-the-art Direct-to-Consumer (D2C) e-commerce platform designed for rapid product validation, high-conversion direct checkout, smart automation, and full-funnel optimization.

Equipped with a sleek, dark-themed, glassmorphic design system and mobile-first responsive interfaces, it features built-in A/B experimentation engines, predictive analytics, direct order generation, and an automated customer support widget.

---

## 🌟 Core Features & Architecture

### 💳 1. One-Page Direct Checkout
- **Gate-Free Buying Flow:** Allows users and guests to instantly confirm orders via Card, UPI (with responsive QR simulator scan-timing), or Cash on Delivery (COD) without external redirect friction.
- **Fulfillment Stepper:** Instantly creates order items in the PostgreSQL DB, waived handling options for orders > ₹999, and triggers cart purge.

### 📦 2. Order Tracking Timeline & Refunds
- **Interactive Tracking:** Fully responsive progress stepper (`PENDING` ➔ `PAID` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED`).
- **Return Portal:** Customer-facing refund/return dashboard allowing single-click exchange requests with timeline validation.

### 🤖 3. Global AI Support Companion (Nova Support Bot)
- **Conversational Helper:** Globally mounted conversational assistant supporting quick questions, smart fallback help, automatic unread counters, and instant responses.

### 🛡️ 4. Unified Admin Suite
- **User Suspension Hub (`/admin/users`):** Elevate customers to `ADMIN` status, suspend fraudulent actors, or delete records.
- **Product Catalog Drawer (`/admin/products`):** Edit pricing details, original compare references, live inventory stock levels, featured hero banner promotes, or toggle archive status.
- **Reviews Moderation Control (`/admin/reviews`):** Comprehensive view of reviewer verified-buyer badges, helpful counts, stars, and optimistic visibility toggles.

### 🔐 5. 2FA Security & Password Recovery
- **2-Factor Authentication:** Secure TOTP credentials matching directly embedded into standard credential logins.
- **Forgot Password Workflow:** Automated reset tokens, verification views, and password changes.

---

## 🛠️ Architecture and Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, Dynamic Server Actions)
- **UI & State:** React 19, Zustand state store, Lucide Icons, Framer Motion
- **Styling:** CSS Variables, Tailwind CSS
- **Database / ORM:** Prisma ORM with PostgreSQL database
- **Security / Session:** NextAuth.js (v5 Beta credentials, 2FA validation)
- **Marketing / Analytics:** Built-in A/B split-testing engine, server-side GA4, and Meta Pixel hooks

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (version 18.x or later)
- PostgreSQL database instance
- Redis server (optional, for session cache)

### 2. Quickstart
```bash
# 1. Clone the repository
git clone https://github.com/Jaskaran-Guru/Novadrop.git
cd Novadrop

# 2. Install dependencies
npm install

# 3. Setup environment variables (Create .env)
cp .env.example .env # Or create a custom .env file
```

### 3. Database Push & Seeding
Configure your `DATABASE_URL` in `.env`, then sync and seed tables:
```bash
# Sync prisma schemas
npx prisma db push

# Generate client
npx prisma generate

# Seed initial store catalog
npx prisma db seed
```

### 4. Running the Dev Server
```bash
npm run dev
# Server runs at http://localhost:3000
```

---

## 📊 Deployment & Production Build

Novadrop is configured to perform strict TypeScript validation and Turbopack optimizations during build-time:

```bash
# Run TypeScript compilation checks
npx tsc --noEmit

# Compile production-optimized build
npm run build

# Spin up production server
npm run start
```

---

## 📁 Key Project Structure

```
├── app/
│   ├── account/          # Customer dashboards, address book, password settings, tracking
│   ├── admin/            # Orders, products catalog, users manager, campaigns, analytics
│   ├── api/              # Secure Next.js dynamic endpoints and OAuth route modules
│   ├── checkout/         # Direct secure checkout flow
│   └── products/         # Main catalog grid and dynamic item showcases
├── components/           # Modular visual parts (SupportChat, FilterControls, Navbar)
├── lib/                  # State management store (Zustand), database (Prisma client)
└── prisma/               # Models (User, Product, Order, Review, AnalyticsEvent)
```
