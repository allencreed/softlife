# Ecommerce Store — Design Spec

## Overview

Mobile-first PWA ecommerce store for physical goods (under 50 SKUs). Full-stack Next.js monolith with Auth0 authentication, Stripe payments, Prisma + SQLite/Supabase persistence, and Vercel deployment.

## Architecture

```
Next.js 14 App Router (single codebase)
│
├── /app/api/*          → REST API routes (server-side)
├── /app/(shop)/*       → Public store pages (SSR/ISR)
├── /app/account/*      → Authenticated user pages
├── /app/admin/*        → Admin-only pages (role-gated)
├── /app/auth/*         → Auth0 callback & login
│
├── /prisma/schema.prisma   → Data model (SQLite dev, PostgreSQL prod)
├── /lib/*                  → Shared utilities (db, stripe, auth)
└── /components/*           → Reusable React components
```

### Stack

| Layer | Choice | Justification |
|-------|--------|---------------|
| Framework | Next.js 14 (App Router) | API routes + frontend in one deploy, Vercel-native |
| Auth | Auth0 + `@auth0/nextjs-auth0` | User requirement, free tier (7K active users) |
| Database ORM | Prisma | One schema for SQLite (dev) + PostgreSQL (prod) |
| Database (dev) | SQLite | Zero config, no server needed |
| Database (prod) | Supabase (free tier PostgreSQL) | 500MB, SSL, always-on |
| Payments | Stripe Checkout | Zero PCI scope, webhook-driven fulfillment |
| UI | Tailwind CSS + shadcn/ui | Mobile-first by default, accessible components |
| PWA | @serwist/next | Offline product pages, install prompt |
| Server state | SWR | Lightweight, revalidation built-in |
| Deployment | Vercel (free tier) | git push → deploy, auto HTTPS |

## Data Model

```
User
  id            String  @id @default(cuid())
  email         String  @unique
  name          String?
  auth0Id       String  @unique
  role          String  @default("customer")  // "customer" | "admin"
  orders        Order[]
  cart          Cart?
  createdAt     DateTime @default(now())

Category
  id            String  @id @default(cuid())
  name          String
  slug          String  @unique
  description   String?
  products      Product[]

Product
  id            String  @id @default(cuid())
  name          String
  slug          String  @unique
  description   String
  priceCents    Int                // integer cents to avoid float errors
  images        String[]           // URLs (upload to free tier or external)
  categoryId    String
  category      Category @relation(fields: [categoryId], references: [id])
  inventory     Int      @default(0)
  featured      Boolean  @default(false)
  createdAt     DateTime @default(now())
  cartItems     CartItem[]
  orderItems    OrderItem[]

Cart
  id            String  @id @default(cuid())
  userId        String  @unique
  user          User    @relation(fields: [userId], references: [id])
  items         CartItem[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

CartItem
  id            String    @id @default(cuid())
  cartId        String
  cart          Cart      @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId     String
  product       Product   @relation(fields: [productId], references: [id])
  quantity      Int       @default(1)
  priceCents    Int       // snapshot at time of add

Order
  id              String   @id @default(cuid())
  orderNumber     String   @unique  // e.g. "SO-0001"
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  status          String   @default("pending")  // pending|paid|shipped|delivered|cancelled
  totalCents      Int
  stripeSessionId String?
  shippingName    String
  shippingAddress String
  shippingCity    String
  shippingState   String
  shippingZip     String
  shippingCountry String  @default("US")
  items           OrderItem[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

OrderItem
  id              String   @id @default(cuid())
  orderId         String
  order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId       String
  product         Product  @relation(fields: [productId], references: [id])
  quantity        Int
  priceCents      Int      // snapshot at purchase
```

All monetary values stored as integers in cents.

## Auth Flow (Auth0)

1. User clicks "Sign In" → redirected to Auth0 Universal Login
2. After authentication, Auth0 redirects to `/api/auth/callback`
3. `@auth0/nextjs-auth0` sets an HttpOnly session cookie (JWT)
4. Post-login Auth0 Action fires a webhook to `/api/auth/post-login` to upsert the local `User` record
5. Admin flag stored in Auth0 `app_metadata.role` — middleware reads it to gate `/admin/*`
6. Middleware protects `/account/*`, `/cart`, `/checkout` — redirects to Auth0 login if unauthenticated
7. Logout clears session cookie and redirects to Auth0 logout

## Payment Flow (Stripe)

1. User on `/cart` clicks "Checkout" → `POST /api/checkout`
2. API route creates Stripe Checkout Session with line items + metadata (userId, orderId)
3. User redirected to Stripe-hosted payment page
4. On success → Stripe redirects to `/account/orders?success=1`
5. On cancel → Stripe redirects back to `/cart`
6. Stripe fires `checkout.session.completed` webhook → `POST /api/webhooks/stripe`
7. Webhook handler verifies signature, updates order to `paid`, decrements inventory, clears cart

Local dev: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Routes

### Public
| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Homepage — featured products |
| `/products` | GET | Product listing by category |
| `/products/[slug]` | GET | Product detail |
| `/cart` | GET | Cart view |
| `/cart` | POST | Add/update/remove items |
| `/checkout` | GET | Stripe Checkout redirect |

### Auth (Auth0 managed)
| Route | Description |
|-------|-------------|
| `/api/auth/login` | Redirect to Auth0 |
| `/api/auth/logout` | Clear session |
| `/api/auth/callback` | Auth0 callback handler |

### Authenticated
| Route | Method | Description |
|-------|--------|-------------|
| `/account/orders` | GET | Order history |
| `/account/orders/[id]` | GET | Order detail |

### Admin (role-gated)
| Route | Method | Description |
|-------|--------|-------------|
| `/admin` | GET | Dashboard |
| `/admin/products` | GET | Product list (manage) |
| `/admin/products/new` | GET|POST | Create product |
| `/admin/products/[id]/edit` | GET|POST | Edit product |
| `/admin/orders` | GET | Order management |
| `/admin/orders/[id]` | GET | Order detail + status update |

### API Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/products` | GET | Public product listing |
| `/api/products/[slug]` | GET | Public product detail |
| `/api/cart` | GET|POST | Get/update cart |
| `/api/checkout` | POST | Create Stripe session |
| `/api/webhooks/stripe` | POST | Stripe event handling |
| `/api/orders` | GET | User's orders |
| `/api/auth/post-login` | POST | Auth0 Action webhook |

## PWA Strategy

- Service worker caches product listing and detail pages (stale-while-revalidate)
- Cart and checkout require network (can't purchase offline)
- Install prompt shown on desktop after 2 visits
- Web manifest with theme color, icons (generated via simple SVG)

## UI / UX

- Mobile-first responsive with Tailwind breakpoints (sm → lg)
- shadcn/ui components: Button, Input, Dialog, Sheet (cart drawer), Card, Badge
- Bottom navigation on mobile (Home, Products, Cart, Account)
- Cart icon with badge count in header
- Skeleton loading states for product pages
- Toast notifications for add-to-cart, order confirmation

## Local Development

```
# Terminal 1 — Next.js dev server
pnpm dev            → http://localhost:3000

# Terminal 2 — Stripe webhook forwarding (for payment testing)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Database: SQLite file via Prisma. No external DB needed for development. Supabase credentials only needed for production build.

## Production Deployment

- `vercel --prod` from CLI or `git push` to linked repo
- Environment variables: `AUTH0_*`, `STRIPE_*`, `DATABASE_URL` (Supabase PostgreSQL), `AUTH0_POST_LOGIN_SECRET`
- Prisma: `npx prisma generate` in build step, `npx prisma migrate deploy` on deploy
- Custom domain on Vercel free tier (1 custom domain allowed)

## Out of Scope (v1)

- Reviews/ratings
- Coupon/discount codes
- Abandoned cart emails
- Inventory alerts
- Multi-currency
- Analytics beyond basic page views
- Product image upload (use external URLs for v1)
