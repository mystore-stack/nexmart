<<<<<<< HEAD
# store1
=======
# NexMart — Production-Grade E-Commerce Platform

A fully-featured, production-ready Amazon-scale e-commerce platform built with Next.js 14, TypeScript, PostgreSQL, Redis, and Stripe.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 App Router, React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **State** | Zustand + Immer |
| **Database** | PostgreSQL via Prisma ORM (supports Neon or local Docker) |
| **Cache** | Redis (ioredis) |
| **Payments** | Stripe (PaymentIntents + Webhooks) |
| **Media** | Cloudinary |
| **Queues** | BullMQ |
| **Email** | Nodemailer |
| **Auth** | JWT (jose) + HttpOnly cookies |
| **Queries** | TanStack Query v5 |
| **Charts** | Recharts |
| **Infra** | Docker, Docker Compose |

---

## 📁 Project Structure

```
nexmart/
├── prisma/
│   ├── schema.prisma          # Full DB schema
│   └── seed.ts                # Realistic seed data
├── src/
│   ├── app/
│   │   ├── api/               # All API routes
│   │   │   ├── auth/          # login, register, logout, me
│   │   │   ├── products/      # CRUD + filtering
│   │   │   ├── orders/        # Order management
│   │   │   ├── cart/          # Server-side cart
│   │   │   ├── payments/      # Stripe intents + webhooks
│   │   │   ├── reviews/       # Product reviews
│   │   │   ├── wishlist/      # Wishlist toggle
│   │   │   ├── search/        # Full-text + autocomplete
│   │   │   ├── coupons/       # Coupon validation
│   │   │   └── admin/         # Admin-only endpoints
│   │   ├── (public pages)
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── products/      # Listing + Detail pages
│   │   │   ├── checkout/      # Multi-step checkout
│   │   │   ├── orders/        # Order history + tracking
│   │   │   ├── cart/          # Full cart page
│   │   │   ├── wishlist/      # Saved items
│   │   │   ├── search/        # Search results
│   │   │   ├── login/         # Auth pages
│   │   │   └── register/
│   │   └── admin/             # Admin dashboard
│   │       ├── page.tsx       # Analytics overview
│   │       ├── products/      # Product CRUD
│   │       ├── orders/        # Order management
│   │       ├── users/         # User management
│   │       ├── analytics/     # Revenue charts
│   │       ├── coupons/       # Coupon CRUD
│   │       └── categories/    # Category management
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, SearchModal
│   │   ├── home/              # HeroSection, FlashSale, etc.
│   │   ├── product/           # ProductCard, Gallery, Reviews
│   │   ├── cart/              # CartDrawer
│   │   ├── checkout/          # Stripe elements
│   │   ├── admin/             # Admin UI components
│   │   ├── ui/                # Skeleton, etc.
│   │   └── providers/         # Theme, Query providers
│   ├── lib/
│   │   ├── prisma.ts          # DB client singleton
│   │   ├── redis.ts           # Redis client + cache helpers
│   │   ├── auth.ts            # JWT + cookie management
│   │   ├── stripe.ts          # Stripe helpers
│   │   ├── cloudinary.ts      # Image upload
│   │   ├── email.ts           # Email templates
│   │   ├── queues.ts          # BullMQ job definitions
│   │   └── api.ts             # Response helpers + rate limiting
│   ├── store/
│   │   ├── cart.ts            # Zustand cart (persisted)
│   │   └── index.ts           # Wishlist + UI + Auth stores
│   ├── types/
│   │   └── index.ts           # All TypeScript types
│   ├── utils/
│   │   ├── format.ts          # Price, date formatters
│   │   └── cn.ts              # Class merge utility
│   └── middleware.ts          # Edge auth + rate limiting
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 20+
- Docker + Docker Compose
- A Stripe account (for payments)
- A Cloudinary account (for images)

### 1. Clone & Install

```bash
git clone <repo>
cd nexmart
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
# Fill in all required values
```

### 3. Start Infrastructure

If you are using a Neon PostgreSQL database, set `DATABASE_URL` in `.env.local` and skip local Postgres.

```bash
# Start Redis only for local development
docker-compose up -d redis

# If you prefer local PostgreSQL instead of Neon:
# docker-compose up -d db redis
# docker-compose --profile dev up -d
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:push

# Seed with demo data
npm run db:seed
```

### 5. Start Development

```bash
# App server
npm run dev

# Queue worker (separate terminal)
npm run queue:worker
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Default Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nexmart.com | Admin@123456 |
| User | user@nexmart.com | User@123456 |

---

## 🎟️ Demo Coupons

| Code | Discount |
|------|----------|
| `WELCOME10` | 10% off first order |
| `NEXMART10` | 10% off sitewide |
| `SAVE20` | $20 off orders $100+ |
| `FREESHIP` | Free shipping |

---

## 🏗️ Architecture Highlights

### Caching Strategy
- **ISR** (Incremental Static Regeneration) for product and category pages — revalidates every 5 min
- **Redis** for frequently-accessed data: products, categories, search autocomplete, analytics
- **Edge Middleware** for auth checks — zero cold starts

### Queue Architecture (BullMQ)
- `emailQueue` — Welcome emails, order confirmations, shipping updates
- `orderQueue` — Inventory updates, payment processing
- `notificationQueue` — In-app notification creation

### Security
- JWT stored in HttpOnly, Secure, SameSite=Lax cookies
- Edge middleware enforces auth on all protected routes
- Rate limiting on auth endpoints (Redis-backed sliding window)
- CSP headers, CORS, XSS protection via `next.config.js`
- Zod validation on all API inputs

### Performance
- `next/image` with Cloudinary remote patterns + WebP/AVIF
- Bundle splitting via `optimizePackageImports`
- Infinite scroll with Intersection Observer
- `React.Suspense` + skeleton loaders everywhere
- Prisma connection pooling

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out (clears cookies) |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List with filters, sort, pagination |
| GET | `/api/products?search=q` | Full-text search |
| GET | `/api/products?featured=true` | Featured products |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | User's order history |
| POST | `/api/orders` | Create order |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-intent` | Stripe PaymentIntent |
| POST | `/api/payments/webhook` | Stripe webhook handler |

### Admin (requires ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/products` | Products CRUD |
| PATCH/DELETE | `/api/admin/products/[id]` | Update/delete product |
| GET | `/api/admin/orders` | All orders with filters |
| PATCH | `/api/admin/orders/[id]` | Update order status |
| GET | `/api/admin/analytics` | Revenue & metrics |

---

## 🐳 Production Deployment

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Run migrations in production
docker-compose exec app npx prisma migrate deploy
```

### Environment Variables Required for Production

```bash
DATABASE_URL=             # PostgreSQL connection string

REDIS_URL=               # Redis connection string
JWT_SECRET=              # Min 32 chars, random
JWT_REFRESH_SECRET=      # Min 32 chars, random
STRIPE_SECRET_KEY=       # sk_live_...
STRIPE_WEBHOOK_SECRET=   # whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # pk_live_...
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

---

## 🧩 Key Features Summary

- ✅ **JWT Auth** with refresh tokens, HttpOnly cookies
- ✅ **Admin Dashboard** with analytics, charts, full CRUD
- ✅ **Product System** — variants, gallery zoom, reviews, ratings
- ✅ **Cart** — Zustand + localStorage persistence, drawer UI
- ✅ **Checkout** — Multi-step, Stripe + Cash on Delivery
- ✅ **Coupons** — Percentage/fixed, per-user limits, expiry
- ✅ **Search** — Full-text + autocomplete with Redis cache
- ✅ **Wishlist** — Toggle, persist, sync with server
- ✅ **Orders** — Tracking, status updates, email notifications
- ✅ **Notifications** — In-app, BullMQ-powered
- ✅ **Flash Sales** — Countdown timer, highlighted products
- ✅ **ISR Caching** — Stale-while-revalidate for product pages
- ✅ **Dark/Light Mode** — System-aware via next-themes
- ✅ **Mobile-First** — Fully responsive, optimized touch UX
- ✅ **SEO** — JSON-LD schema, dynamic metadata, OG tags
- ✅ **Security** — Rate limiting, CSP, Zod validation, CSRF
- ✅ **Docker** — Multi-stage build, production-ready compose

---

## 📄 License

MIT © NexMart
>>>>>>> dd27bcc (first commit)
