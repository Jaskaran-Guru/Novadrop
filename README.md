# Novadrop 

## Project Overview

This repository contains a data-driven Direct-to-Consumer (D2C) e-commerce platform designed for rapid product validation, scalable growth, and full-funnel optimization. The system is built with modern web technologies and integrates seamlessly with external marketing and payment services.

## Architecture and Tech Stack

### Frontend
- Framework: Next.js (App Router)
- UI Library: React
- Styling: Tailwind CSS
- Animation: Framer Motion

### Backend
- Framework: Next.js API Routes
- ORM: Prisma
- Database: PostgreSQL
- Caching and Sessions: Redis

### Third-Party Integrations
- Payments: Stripe
- Analytics: Google Analytics 4, Server-side event tracking
- Marketing: Meta Pixel

## Prerequisites

Ensure you have the following installed on your local development environment:
- Node.js (version 18.x or later)
- PostgreSQL
- Redis
- npm or yarn

## Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root of your project and populate it with the required environment variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce?schema=public"
REDIS_URL="redis://localhost:6379"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_META_PIXEL_ID="your_pixel_id"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Running the Application

### Development Mode

To start the development server, run:

```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### Database Migrations

To apply database schema changes, run:

```bash
npx prisma db push
```

To seed the database with initial data:

```bash
npx prisma db seed
```

### Production Build

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Project Structure

- `/app`: Contains all Next.js App Router pages and API endpoints.
- `/components`: Reusable React components.
- `/lib`: Utility functions, database configuration, and external service clients.
- `/prisma`: Database schema definitions and seed scripts.
- `/public`: Static assets.

## Core Modules

1. Storefront: Optimized landing pages for rapid load times and high conversion rates.
2. Product Management: Admin controls for inventory, variants, and pricing.
3. Checkout System: Seamless payment processing via Stripe.
4. Analytics Dashboard: Centralized view of key metrics including Conversion Rate and Return on Ad Spend (ROAS).
5. Experimentation Engine: Built-in A/B testing for traffic splitting and performance comparison.

.
