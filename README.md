# TastePulse | Restaurant Feedback & Retention Platform (SaaS MVP)

A simple, secure, high-performance SaaS MVP that empowers restaurants to capture real-time table feedback via QR codes, protect their public reputation, and turn one-time diners into loyal regulars through automated retention vouchers.

---

## 🌟 Key Features

### 1. Diners: Mobile-First Table Feedback Form (`/r/[slug]`)
- **Fast & Zero Friction**: Instant load on mobile browsers; no app download or account required.
- **1–5 Star Rating**: Interactive star rating with dynamic sentiment guidance (Disappointing → Outstanding).
- **Positive & Constructive Feedback**: Diners specify what they loved and where service/kitchen can improve.
- **Table Detection**: Automatically detects table number from QR code query (`?table=12`) or lets diners input their table.
- **Customer Retention & Leads**: Diners can optionally provide their name and phone number to unlock exclusive VIP discounts.
- **Instant Digital Voucher**: Animated celebration confetti triggers a digital reward card (e.g. 15% off lunch or complimentary dessert) with a unique verification pass code.
- **Google Review Booster**: Diners who submit 5 stars are nudged to share their glowing experience on Google Reviews.

### 2. Restaurant Owners: Secure Intelligence Dashboard (`/dashboard`)
- **Real-Time KPI Cards**:
  - Total feedback submissions.
  - Average star rating (1.0 to 5.0) with star graphics.
  - Positive feedback sentiment percentage & count (4–5 stars).
  - Needs attention / negative feedback percentage & count (1–2 stars).
  - Retention leads captured count & conversion percentage.
- **Visual Analytics**:
  - Rating distribution breakdown (5★ to 1★ bar charts).
  - 7-Day activity timeline showing daily review volume and trend ratings.
- **Feedback Filtering & Search**:
  - Filter by sentiment (**All**, **Positive**, **Neutral**, **Needs Attention**).
  - Toggle **"Has Contact Info"** to view high-value customer retention leads.
  - Filter by resolution status (**New**, **Reviewed**, **Contacted**, **Resolved**).
  - Live search across customer name, phone number, table number, and comments.
- **One-Click Diner Retention Outreach**:
  - Direct `tel:` calling and `WhatsApp` links to follow up with unhappy customers or reward loyal guests before negative reviews hit public review sites.
- **Status Workflow Manager**:
  - Mark reviews as *New*, *Reviewed*, *Contacted*, or *Resolved* with instant optimistic updates.

### 3. QR Code Generator & Table Tent Print Studio (`/dashboard/qr`)
- **Custom Table Tent Generator**: Assign table numbers or generate generic stands.
- **High-Resolution Vector Export**: Instant SVG and PNG QR downloads.
- **Printable Table Standees**: Built-in `@media print` styling to print A6/4x6 formatted table tents ready for dining tables.

### 4. Settings & Retention Configuration (`/dashboard/settings`)
- Customize restaurant profile: Name, URL slug, description, address, and phone number.
- Configure custom diner retention offer shown on submission (e.g., *"Show this screen to your server for 10% off your next visit!"*).

---

## 🛡️ Enterprise Security & Performance

| Layer | Implementation Details |
|---|---|
| **Authentication** | JWT stored in secure `HTTP-only` cookies (`SameSite: 'lax'`, `HttpOnly: true`, `secure: isProd`) preventing XSS token theft. |
| **Password Hashing** | **Argon2id** (`argon2`) with high memory and time cost factors to protect against brute-force attacks. |
| **Validation** | Strict **Zod** schema parsing on both NestJS backend (`ZodValidationPipe`) and frontend inputs. |
| **SQL Injection Prevention** | **Prisma ORM** with parameterized queries and indexed fields. |
| **Spam & DDoS Protection** | **Rate Limiting** via `@nestjs/throttler` enforcing IP and route limits (feedback submission throttled with HTTP 429 response). |
| **Security Headers** | **Helmet** integration (HSTS, CSP, X-Frame-Options, X-Content-Type-Options). |
| **CORS** | Strict whitelist origin validation with credentials support. |

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Lucide Icons + Canvas Confetti
- **Backend**: NestJS + TypeScript + Express + Helmet + Cookie-Parser + Throttler
- **Database**: PostgreSQL 16
- **ORM**: Prisma 6
- **Hosting Targets**:
  - Frontend: [Vercel](https://vercel.com)
  - Backend & Database: [Railway](https://railway.app) / [Render](https://render.com)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js >= 18 (Tested on v22)
- pnpm >= 9 (or npm)
- PostgreSQL database

### 1. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your PostgreSQL connection string
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_feedback?schema=public"

# Install dependencies
pnpm install

# Run database migration & Prisma generation
pnpm prisma db push

# Seed initial demo restaurant, owner, and reviews
pnpm seed

# Build and start the backend
pnpm build
pnpm start
# -> Running on http://localhost:4000 (API: http://localhost:4000/api)
```

### 2. Frontend Setup

```bash
cd frontend

# Copy environment template
cp .env.example .env.local

# Install dependencies
pnpm install

# Build and run Next.js
pnpm build
pnpm start
# -> Running on http://localhost:3000
```

---

## 🔑 Demo Credentials

A demo restaurant and owner account are pre-seeded for immediate testing:

- **Owner Email**: `owner@bistro.com`
- **Owner Password**: `Password123!`
- **Demo Restaurant Slug**: `trattoria-bella`
- **Demo Customer Feedback URL**: `http://localhost:3000/r/trattoria-bella?table=4`
- **Owner Dashboard URL**: `http://localhost:3000/dashboard`

*(Tip: On the `/login` page, you can click the **"Fill Demo"** button to automatically sign in).*

---

## 📡 API Reference

### Public Endpoints
- `GET /api/restaurants/public/:slug` - Public restaurant profile and retention offer.
- `POST /api/feedback/submit` - Submit diner review (Throttled, rate limited).

### Authentication Endpoints
- `POST /api/auth/register` - Create owner account & restaurant. Sets HTTP-only cookie.
- `POST /api/auth/login` - Authenticate owner. Sets HTTP-only cookie.
- `POST /api/auth/logout` - Clear authentication cookie.
- `GET /api/auth/me` - Get authenticated owner and restaurant list.

### Protected Restaurant & Feedback Endpoints
- `GET /api/restaurants/my` - List owner's restaurants.
- `GET /api/restaurants/:id` - Get restaurant details.
- `PUT /api/restaurants/:id` - Update restaurant and retention settings.
- `GET /api/restaurants/:id/qr` - Generate QR code data URL and vector SVG.
- `GET /api/feedback/restaurant/:id` - Fetch paginated feedback with filters (`sentiment`, `status`, `hasContactInfo`, `search`).
- `GET /api/feedback/restaurant/:id/stats` - Analytics, rating breakdown, sentiment rates, and 7-day timeline.
- `PATCH /api/feedback/:id/status` - Update status (`NEW`, `REVIEWED`, `CONTACTED`, `RESOLVED`).

---

## ☁️ Production Deployment Guide

### Deploying Database (Railway / Supabase)
1. Provision a PostgreSQL instance on Railway or Supabase.
2. Copy the connection string into the backend `DATABASE_URL` environment variable.
3. Run `npx prisma db push` or `npx prisma migrate deploy`.

### Deploying Backend (Railway / Render)
1. Root directory: `backend`
2. Build command: `pnpm install && pnpm build`
3. Start command: `node dist/main.js`
4. Set environment variables:
   - `PORT=4000`
   - `NODE_ENV=production`
   - `DATABASE_URL=...`
   - `JWT_SECRET=...`
   - `CORS_ORIGIN=https://your-frontend-domain.vercel.app`
   - `FRONTEND_URL=https://your-frontend-domain.vercel.app`

### Deploying Frontend (Vercel)
1. Root directory: `frontend`
2. Framework preset: **Next.js**
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api`
   - `NEXT_PUBLIC_APP_URL=https://your-frontend-domain.vercel.app`
   - `INTERNAL_API_URL=https://your-backend.railway.app`
