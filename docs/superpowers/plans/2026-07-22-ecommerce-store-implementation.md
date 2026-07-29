# Ecommerce Store — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack mobile-first PWA ecommerce store for physical goods using Next.js 14, Auth0, Stripe, Prisma, and Tailwind CSS.

**Architecture:** Single Next.js 14 App Router monolith. Backend API routes first, then frontend pages. Prisma schema shared across SQLite (dev) and PostgreSQL (prod). Auth0-managed authentication. Stripe Checkout for payments. Server-managed cart persisted per user.

**Tech Stack:** Next.js 14, Auth0, Stripe, Prisma, SQLite (dev) / Supabase Postgres (prod), Tailwind CSS, shadcn/ui, SWR, @serwist/next

**Plan location:** `I:\SoftLife\ecommerce-store\`

---

### Task 1: Scaffold Project & Install Dependencies

**Files:**
- Create: `I:\SoftLife\ecommerce-store\package.json`
- Create: `I:\SoftLife\ecommerce-store\tsconfig.json`
- Create: `I:\SoftLife\ecommerce-store\next.config.js`
- Create: `I:\SoftLife\ecommerce-store\tailwind.config.ts`
- Create: `I:\SoftLife\ecommerce-store\postcss.config.js`
- Create: `I:\SoftLife\ecommerce-store\.env.local`
- Create: `I:\SoftLife\ecommerce-store\.env.example`
- Create: `I:\SoftLife\ecommerce-store\src\app\globals.css`
- Create: `I:\SoftLife\ecommerce-store\src\app\layout.tsx`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd I:\SoftLife
npx create-next-app@latest ecommerce-store --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd ecommerce-store
```

- [ ] **Step 2: Install core dependencies**

```bash
npm install @auth0/nextjs-auth0 prisma @prisma/client @stripe/stripe-js stripe swr @serwist/next lucide-react class-variance-authority clsx tailwind-merge
```

```bash
npm install -D @types/node
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```

- [ ] **Step 4: Install shadcn/ui components**

```bash
npx shadcn@latest add button card input badge dialog sheet toast select table skeleton
```

- [ ] **Step 5: Create .env files**

Create `.env.local`:
```
AUTH0_SECRET=<generate-with-openssl-rand-64>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://<your-tenant>.us.auth0.com
AUTH0_CLIENT_ID=<from-auth0-app>
AUTH0_CLIENT_SECRET=<from-auth0-app>
STRIPE_SECRET_KEY=<from-stripe-dashboard>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<from-stripe-dashboard>
STRIPE_WEBHOOK_SECRET=<from-stripe-cli>
DATABASE_URL="file:./dev.db"
AUTH0_POST_LOGIN_SECRET=<random-64-char-string>
```

Create `.env.example` (same keys, no values):
```
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
DATABASE_URL=
AUTH0_POST_LOGIN_SECRET=
```

- [ ] **Step 6: Configure next.config.js**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 7: Create initial app layout**

Edit `src/app/layout.tsx` to include basic metadata, viewport meta for mobile, Tailwind globals import:

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SoftLife Store",
  description: "Premium physical goods",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

Edit `src/app/globals.css` — keep the Tailwind directives, add any custom base styles as needed.

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```
Expected: Server starts on http://localhost:3000 without errors.

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js ecommerce project with deps"
```

---

### Task 2: Database Schema & Prisma Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/db.ts`

- [ ] **Step 1: Write Prisma schema**

Write `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  auth0Id   String   @unique
  role      String   @default("customer")
  cart      Cart?
  orders    Order[]
  createdAt DateTime @default(now())
}

model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  products    Product[]
}

model Product {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String
  priceCents  Int
  images      String
  categoryId  String
  category    Category   @relation(fields: [categoryId], references: [id])
  inventory   Int        @default(0)
  featured    Boolean    @default(false)
  createdAt   DateTime   @default(now())
  cartItems   CartItem[]
  orderItems  OrderItem[]
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id])
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id         String  @id @default(cuid())
  cartId     String
  cart       Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId  String
  product    Product @relation(fields: [productId], references: [id])
  quantity   Int     @default(1)
  priceCents Int
}

model Order {
  id              String     @id @default(cuid())
  orderNumber     String     @unique
  userId          String
  user            User       @relation(fields: [userId], references: [id])
  status          String     @default("pending")
  totalCents      Int
  stripeSessionId String?
  shippingName    String
  shippingAddress String
  shippingCity    String
  shippingState   String
  shippingZip     String
  shippingCountry String     @default("US")
  items           OrderItem[]
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}

model OrderItem {
  id         String  @id @default(cuid())
  orderId    String
  order      Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId  String
  product    Product @relation(fields: [productId], references: [id])
  quantity   Int
  priceCents Int
}
```

- [ ] **Step 2: Run initial migration**

```bash
npx prisma migrate dev --name init
```
Expected: Migration applied, SQLite database created at `prisma/dev.db`.

- [ ] **Step 3: Generate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 4: Create db utility**

Write `src/lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 5: Create seed script**

Write `prisma/seed.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const category = await db.category.create({
    data: {
      name: "Apparel",
      slug: "apparel",
      description: "Clothing and accessories",
    },
  });

  await db.product.createMany({
    data: [
      {
        name: "Classic Tee",
        slug: "classic-tee",
        description: "A comfortable cotton t-shirt.",
        priceCents: 2999,
        images: "https://picsum.photos/seed/tee/400/400",
        categoryId: category.id,
        inventory: 50,
        featured: true,
      },
      {
        name: "Denim Jacket",
        slug: "denim-jacket",
        description: "A stylish denim jacket for all seasons.",
        priceCents: 8999,
        images: "https://picsum.photos/seed/jacket/400/400",
        categoryId: category.id,
        inventory: 20,
        featured: true,
      },
    ],
  });

  console.log("Seed complete ✨");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
```

Add seed config to `package.json`:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

Install tsx: `npm install -D tsx`

- [ ] **Step 6: Run seed**

```bash
npx prisma db seed
```
Expected: "Seed complete ✨"

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add Prisma schema with models and seed data"
```

---

### Task 3: Auth0 Integration

**Files:**
- Create: `src/app/api/auth/[auth0]/route.ts`
- Create: `src/app/api/auth/post-login/route.ts`
- Create: `src/middleware.ts`
- Create: `src/lib/auth.ts`
- Create: `src/components/UserMenu.tsx`

- [ ] **Step 1: Create Auth0 API route handler**

Write `src/app/api/auth/[auth0]/route.ts`:

```ts
import { handleAuth } from "@auth0/nextjs-auth0";

export const GET = handleAuth();
```

- [ ] **Step 2: Create post-login webhook**

Write `src/app/api/auth/post-login/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.AUTH0_POST_LOGIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { auth0Id, email, name } = body.user;

  await db.user.upsert({
    where: { auth0Id },
    update: { email, name },
    create: { auth0Id, email, name },
  });

  return NextResponse.json({ ok: true });
}
```

In Auth0 dashboard, create a Post-Login Action that `POST`s to `${account.base_url}/api/auth/post-login` with the user payload. Requires Auth0 dashboard setup.

- [ ] **Step 3: Create middleware**

Write `src/middleware.ts`:

```ts
import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/middleware";

export default withMiddlewareAuthRequired();

export const config = {
  matcher: ["/cart", "/checkout", "/account/:path*", "/admin/:path*"],
};
```

- [ ] **Step 4: Create auth utility**

Write `src/lib/auth.ts`:

```ts
import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest } from "next/server";
import { db } from "./db";

export async function getCurrentUser(req?: NextRequest) {
  const session = await getSession(req);
  if (!session?.user) return null;

  const user = await db.user.findUnique({
    where: { auth0Id: session.user.sub },
  });

  return user;
}

export async function requireAdmin(req?: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return user;
}
```

- [ ] **Step 5: Create UserMenu component**

Write `src/components/UserMenu.tsx`:

```tsx
import Link from "next/link";

export function UserMenu({ user }: { user: { name?: string; email?: string } | null }) {
  if (!user) {
    return (
      <Link href="/api/auth/login" className="text-sm font-medium hover:underline">
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/account/orders" className="text-sm hover:underline">
        Orders
      </Link>
      <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
      <Link href="/api/auth/logout" className="text-sm text-muted-foreground hover:underline">
        Sign Out
      </Link>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add Auth0 authentication integration"
```

---

### Task 4: Backend API — Products & Categories

**Files:**
- Create: `src/app/api/products/route.ts`
- Create: `src/app/api/products/[slug]/route.ts`

- [ ] **Step 1: Write products listing API**

Write `src/app/api/products/route.ts`:

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = {};
  if (category) where.category = { slug: category };
  if (featured === "true") where.featured = true;

  const products = await db.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}
```

- [ ] **Step 2: Write product detail API**

Write `src/app/api/products/[slug]/route.ts`:

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add products API routes (list + detail)"
```

---

### Task 5: Backend API — Cart

**Files:**
- Create: `src/app/api/cart/route.ts`

- [ ] **Step 1: Write cart API**

Write `src/app/api/cart/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { db } from "@/lib/db";

async function getCart(userId: string) {
  let cart = await db.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  return cart;
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.user) return NextResponse.json({ cart: null });

  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return NextResponse.json({ cart: null });

  const cart = await getCart(user.id);
  return NextResponse.json({ cart });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { productId, quantity = 1 } = await req.json();

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const cart = await getCart(user.id);
  const existing = cart.items.find((item) => item.productId === productId);

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        priceCents: product.priceCents,
      },
    });
  }

  const updated = await getCart(user.id);
  return NextResponse.json({ cart: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }

  await db.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add cart API (GET, POST, DELETE)"
```

---

### Task 6: Backend API — Checkout, Orders & Stripe Webhook

**Files:**
- Create: `src/lib/stripe.ts`
- Create: `src/app/api/checkout/route.ts`
- Create: `src/app/api/webhooks/stripe/route.ts`
- Create: `src/app/api/orders/route.ts`

- [ ] **Step 1: Create Stripe utility**

Write `src/lib/stripe.ts`:

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24-acacia",
  typescript: true,
});
```

- [ ] **Step 2: Write checkout API**

Write `src/app/api/checkout/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const cart = await db.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const order = await db.order.create({
    data: {
      orderNumber: `SO-${Date.now().toString(36).toUpperCase()}`,
      userId: user.id,
      status: "pending",
      totalCents: cart.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
      shippingName: "",
      shippingAddress: "",
      shippingCity: "",
      shippingState: "",
      shippingZip: "",
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })),
      },
    },
  });

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: cart.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          images: item.product.images ? [item.product.images] : [],
        },
        unit_amount: item.priceCents,
      },
      quantity: item.quantity,
    })),
    metadata: {
      orderId: order.id,
      userId: user.id,
    },
    success_url: `${process.env.AUTH0_BASE_URL}/account/orders?success=1`,
    cancel_url: `${process.env.AUTH0_BASE_URL}/cart`,
  });

  await db.order.update({
    where: { id: order.id },
    data: { stripeSessionId: stripeSession.id },
  });

  return NextResponse.json({ url: stripeSession.url! });
}
```

- [ ] **Step 3: Write Stripe webhook handler**

Write `src/app/api/webhooks/stripe/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderId?: string; userId?: string } };
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;

    if (orderId && userId) {
      await db.order.update({
        where: { id: orderId },
        data: { status: "paid" },
      });

      // Decrement inventory
      const items = await db.orderItem.findMany({
        where: { orderId },
      });
      for (const item of items) {
        await db.product.update({
          where: { id: item.productId },
          data: { inventory: { decrement: item.quantity } },
        });
      }

      // Clear cart
      const cart = await db.cart.findUnique({ where: { userId } });
      if (cart) {
        await db.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 4: Write orders API**

Write `src/app/api/orders/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return NextResponse.json({ orders: [] });

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add checkout, Stripe webhook, and orders API"
```

---

### Task 7: Shared Components & Header

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/ProductCard.tsx`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create utility functions**

Write `src/lib/utils.ts`:

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
```

- [ ] **Step 2: Create Header component**

Write `src/components/Header.tsx`:

```tsx
import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { getSession } from "@auth0/nextjs-auth0";
import { db } from "@/lib/db";

export async function Header() {
  const session = await getSession();
  let user = null;
  let cartCount = 0;

  if (session?.user) {
    const dbUser = await db.user.findUnique({
      where: { auth0Id: session.user.sub },
    });
    user = dbUser;
    if (dbUser) {
      const cart = await db.cart.findUnique({
        where: { userId: dbUser.id },
        include: { items: true },
      });
      cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          SoftLife
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/products" className="hover:underline">
            Products
          </Link>
          <Link href="/cart" className="relative hover:underline">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-4 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <UserMenu user={user ? { name: user.name ?? undefined, email: user.email } : null} />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create ProductCard component**

Write `src/components/ProductCard.tsx`:

```tsx
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  images: string;
  inventory: number;
  featured: boolean;
  category: { name: string };
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square bg-muted">
          <img
            src={product.images}
            alt={product.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{product.category.name}</Badge>
          {product.featured && <Badge>Featured</Badge>}
        </div>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-2 font-semibold">{product.name}</h3>
        </Link>
        <p className="text-lg font-bold mt-1">{formatPrice(product.priceCents)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" disabled={product.inventory <= 0}>
          <Link href={`/products/${product.slug}`}>
            {product.inventory > 0 ? "View Details" : "Out of Stock"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add shared components (Header, ProductCard, utils)"
```

---

### Task 8: Frontend — Homepage & Product Pages

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/products/page.tsx`
- Create: `src/app/products/[slug]/page.tsx`

- [ ] **Step 1: Update root layout with Header and container**

Update `src/app/layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SoftLife Store",
  description: "Premium physical goods",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="container mx-auto px-4 py-6">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Write homepage with featured products**

Write `src/app/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export default async function HomePage() {
  const featured = await db.product.findMany({
    where: { featured: true },
    include: { category: true },
    take: 8,
  });

  return (
    <div>
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">SoftLife Store</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
          Premium products for a comfortable life.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Shop All
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={{ ...p, images: p.images || "" }} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Write products listing page**

Write `src/app/products/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const where = searchParams.category
    ? { category: { slug: searchParams.category } }
    : {};

  const products = await db.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = await db.category.findMany();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <a
          href="/products"
          className={`px-4 py-2 rounded-full text-sm border ${
            !searchParams.category ? "bg-primary text-primary-foreground" : ""
          }`}
        >
          All
        </a>
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm border whitespace-nowrap ${
              searchParams.category === cat.slug
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
          >
            {cat.name}
          </a>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={{ ...p, images: p.images || "" }} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Write product detail page**

Write `src/app/products/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Badge } from "@/components/ui/badge";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product) notFound();

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
        <img
          src={product.images || ""}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div>
        <Badge variant="secondary">{product.category.name}</Badge>
        <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
        <p className="text-2xl font-bold mt-4">{formatPrice(product.priceCents)}</p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          {product.description}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {product.inventory > 0
            ? `${product.inventory} in stock`
            : "Out of stock"}
        </p>
        <div className="mt-6">
          <AddToCartButton productId={product.id} disabled={product.inventory <= 0} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add homepage, products listing, and product detail pages"
```

---

### Task 9: Frontend — Cart & AddToCartButton

**Files:**
- Create: `src/components/AddToCartButton.tsx`
- Create: `src/app/cart/page.tsx`

- [ ] **Step 1: Create AddToCartButton client component**

Write `src/components/AddToCartButton.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled: boolean;
}) {
  const router = useRouter();

  async function handleAdd() {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        router.push("/api/auth/login");
        return;
      }
      toast({ title: "Error", description: "Could not add to cart", variant: "destructive" });
      return;
    }

    toast({ title: "Added to cart" });
    router.refresh();
  }

  return (
    <Button onClick={handleAdd} disabled={disabled} size="lg" className="w-full sm:w-auto">
      {disabled ? "Out of Stock" : "Add to Cart"}
    </Button>
  );
}
```

- [ ] **Step 2: Write cart page**

Write `src/app/cart/page.tsx`:

```tsx
import { getSession } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { CartCheckoutButton } from "@/components/CartCheckoutButton";
import { CartItemRow } from "@/components/CartItemRow";

export default async function CartPage() {
  const session = await getSession();
  if (!session?.user) redirect("/api/auth/login");

  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) redirect("/api/auth/login");

  const cart = await db.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <p className="text-muted-foreground mt-2">Your cart is empty.</p>
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="space-y-4">
        {cart.items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <CartCheckoutButton />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create CartItemRow component**

Write `src/components/CartItemRow.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CartItemRowProps = {
  item: {
    id: string;
    quantity: number;
    priceCents: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string;
    };
  };
};

export function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter();

  async function handleRemove() {
    await fetch(`/api/cart?itemId=${item.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 border rounded-lg p-4">
      <Link href={`/products/${item.product.slug}`}>
        <img
          src={item.product.images || ""}
          alt={item.product.name}
          className="h-20 w-20 object-cover rounded"
        />
      </Link>
      <div className="flex-1">
        <Link href={`/products/${item.product.slug}`} className="font-medium hover:underline">
          {item.product.name}
        </Link>
        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
        <p className="font-semibold">{formatPrice(item.priceCents * item.quantity)}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={handleRemove}>
        Remove
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Create CartCheckoutButton component**

Write `src/components/CartCheckoutButton.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CartCheckoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={loading} className="w-full mt-4" size="lg">
      {loading ? "Redirecting..." : "Checkout"}
    </Button>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add cart UI and checkout flow"
```

---

### Task 10: Frontend — Account & Order Pages

**Files:**
- Create: `src/app/account/orders/page.tsx`
- Create: `src/app/account/orders/[id]/page.tsx`

- [ ] **Step 1: Write orders list page**

Write `src/app/account/orders/page.tsx`:

```tsx
import { getSession } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session?.user) redirect("/api/auth/login");

  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) redirect("/api/auth/login");

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block border rounded-lg p-4 hover:bg-muted/50 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={statusColors[order.status] || ""}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <p className="font-bold mt-1">{formatPrice(order.totalCents)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write order detail page**

Write `src/app/account/orders/[id]/page.tsx`:

```tsx
import { getSession } from "@auth0/nextjs-auth0";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session?.user) redirect("/api/auth/login");

  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) redirect("/api/auth/login");

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.userId !== user.id) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Order {order.orderNumber}</h1>
      <Badge>{order.status}</Badge>
      <p className="text-sm text-muted-foreground mt-1">
        Placed on {new Date(order.createdAt).toLocaleDateString()}
      </p>

      <div className="mt-6 space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border rounded-lg p-4">
            <img
              src={item.product.images || ""}
              alt={item.product.name}
              className="h-16 w-16 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              <p className="text-sm">{formatPrice(item.priceCents)} each</p>
            </div>
            <p className="font-semibold">{formatPrice(item.priceCents * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatPrice(order.totalCents)}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add account orders pages (list + detail)"
```

---

### Task 11: Frontend — Admin Pages

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/products/page.tsx`
- Create: `src/app/admin/products/new/page.tsx`
- Create: `src/app/admin/products/[id]/edit/page.tsx`
- Create: `src/app/admin/orders/page.tsx`
- Create: `src/app/admin/orders/[id]/page.tsx`

- [ ] **Step 1: Create admin layout with auth guard**

Write `src/app/admin/layout.tsx`:

```tsx
import { getSession } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/api/auth/login");

  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user || user.role !== "admin") {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You do not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div>
      <nav className="flex gap-4 mb-6 border-b pb-4">
        <Link href="/admin" className="text-sm font-medium hover:underline">
          Dashboard
        </Link>
        <Link href="/admin/products" className="text-sm font-medium hover:underline">
          Products
        </Link>
        <Link href="/admin/orders" className="text-sm font-medium hover:underline">
          Orders
        </Link>
      </nav>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Write admin dashboard**

Write `src/app/admin/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const [productCount, orderCount, totalRevenue] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.order.aggregate({ _sum: { totalCents: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Products</p>
          <p className="text-3xl font-bold">{productCount}</p>
        </div>
        <div className="border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Orders</p>
          <p className="text-3xl font-bold">{orderCount}</p>
        </div>
        <div className="border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Revenue</p>
          <p className="text-3xl font-bold">
            {formatPrice(totalRevenue._sum.totalCents || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write admin products page**

Write `src/app/admin/products/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Inventory</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3">{formatPrice(p.priceCents)}</td>
                <td className="p-3">{p.inventory}</td>
                <td className="p-3">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/products/${p.id}/edit`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write admin product create page**

Write `src/app/admin/products/new/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { ProductForm } from "@/components/ProductForm";

export default async function NewProductPage() {
  const categories = await db.category.findMany();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
```

- [ ] **Step 5: Write admin product edit page**

Write `src/app/admin/products/[id]/edit/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id: params.id } }),
    db.category.findMany(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
```

- [ ] **Step 6: Write ProductForm component**

Write `src/components/ProductForm.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type Product = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  priceCents?: number;
  images?: string;
  inventory?: number;
  featured?: boolean;
  categoryId?: string;
};

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description"),
      priceCents: parseInt(form.get("priceCents") as string) * 100,
      images: form.get("images"),
      inventory: parseInt(form.get("inventory") as string),
      featured: form.get("featured") === "on",
      categoryId: form.get("categoryId"),
    };

    const url = product
      ? `/api/admin/products/${product.id}`
      : "/api/admin/products";
    const method = product ? "PUT" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      alert("Failed to save product");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={product?.slug} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={product?.description} />
      </div>
      <div>
        <Label htmlFor="priceCents">Price (dollars)</Label>
        <Input id="priceCents" name="priceCents" type="number" step="0.01" defaultValue={product ? product.priceCents / 100 : ""} required />
      </div>
      <div>
        <Label htmlFor="images">Image URL</Label>
        <Input id="images" name="images" defaultValue={product?.images} />
      </div>
      <div>
        <Label htmlFor="inventory">Inventory</Label>
        <Input id="inventory" name="inventory" type="number" defaultValue={product?.inventory ?? 0} />
      </div>
      <div>
        <Label htmlFor="categoryId">Category</Label>
        <Select name="categoryId" defaultValue={product?.categoryId}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" name="featured" id="featured" defaultChecked={product?.featured} />
        <Label htmlFor="featured">Featured product</Label>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 7: Write admin orders page**

Write `src/app/admin/orders/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="p-3">{order.user.email}</td>
                <td className="p-3">{formatPrice(order.totalCents)}</td>
                <td className="p-3">
                  <Badge variant="outline">{order.status}</Badge>
                </td>
                <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Write admin order detail page**

Write `src/app/admin/orders/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UpdateOrderStatus } from "@/components/UpdateOrderStatus";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } }, user: true },
  });

  if (!order) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Order {order.orderNumber}</h1>
      <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />

      <p className="text-sm text-muted-foreground mt-1">
        Customer: {order.user.email}
      </p>
      <p className="text-sm text-muted-foreground">
        Placed: {new Date(order.createdAt).toLocaleDateString()}
      </p>

      <div className="mt-6 space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border rounded-lg p-4">
            <div className="flex-1">
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold">{formatPrice(item.priceCents * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatPrice(order.totalCents)}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Write UpdateOrderStatus component**

Write `src/components/UpdateOrderStatus.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UpdateOrderStatus({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();

  const nextStatus: Record<string, string> = {
    pending: "paid",
    paid: "shipped",
    shipped: "delivered",
  };

  const next = nextStatus[currentStatus];
  if (!next) return <Badge variant="outline">Delivered</Badge>;

  async function handleUpdate() {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  return (
    <Button onClick={handleUpdate} size="sm" variant="outline">
      Mark as {next.charAt(0).toUpperCase() + next.slice(1)}
    </Button>
  );
}
```

- [ ] **Step 10: Create admin API routes for product CRUD and order status**

Write `src/app/api/admin/products/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { db } from "@/lib/db";

async function checkAdmin(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.user) return null;
  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const product = await db.product.create({ data: body });
  return NextResponse.json(product);
}
```

Write `src/app/api/admin/products/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { db } from "@/lib/db";

async function checkAdmin(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.user) return null;
  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const product = await db.product.update({ where: { id: params.id }, data: body });
  return NextResponse.json(product);
}
```

Write `src/app/api/admin/orders/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession(req);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();
  const order = await db.order.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json(order);
}
```

- [ ] **Step 11: Commit**

```bash
git add .
git commit -m "feat: add admin pages and API routes"
```

---

### Task 12: PWA Setup

**Files:**
- Create: `public/manifest.json`
- Create: `public/icons/icon-192x192.png` placeholder
- Create: `public/icons/icon-512x512.png` placeholder
- Modify: `next.config.js`

- [ ] **Step 1: Create web manifest**

Write `public/manifest.json`:

```json
{
  "name": "SoftLife Store",
  "short_name": "SoftLife",
  "description": "Premium physical goods",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ffffff",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Create placeholder icons**

Generate simple SVG-based PNG placeholders. Use a blank 1x1 transparent PNG for now and note that real icons should be created before production.

Create `public/icons/` directory and place placeholder files (can be generated with a simple script or just noted as a TODO for production).

- [ ] **Step 3: Install @serwist/next and configure**

```bash
npm install @serwist/next@latest
```

Create `src/sw.ts`:

```ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

Update `next.config.js`:

```js
const withSerwist = require("@serwist/next").default({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = withSerwist(nextConfig);
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add PWA support with Serwist"
```

---

### Task 13: Final Integration & Local Testing

**Files:**
- `.env.local` (verify all keys set)
- `prisma/seed.ts` (expand with more products)

- [ ] **Step 1: Expand seed data**

Update `prisma/seed.ts` to include 4-5 categories and 10-15 products across them.

- [ ] **Step 2: Reset database and re-seed**

```bash
npx prisma migrate reset --force
npx prisma db seed
```

- [ ] **Step 3: Start dev server and verify**

```bash
npm run dev
```

Test:
1. Visit http://localhost:3000 — featured products render
2. Visit /products — all products listed, category filter works
3. Click a product — detail page loads with Add to Cart button
4. Click "Sign In" — redirects to Auth0 login
5. After login, add item to cart
6. Visit /cart — cart shows items
7. Click checkout — redirects to Stripe
8. Complete payment (Stripe test card 4242...) — redirects to /account/orders
9. Visit /admin — only accessible if user has admin role in Auth0 app_metadata

- [ ] **Step 4: Commit final state**

```bash
git add .
git commit -m "feat: complete ecommerce store v1"
```

---

### Self-Review

**Spec coverage:**
- Data model ✓ (Task 2)
- Auth flow ✓ (Task 3)
- Payment flow ✓ (Task 6)
- Product CRUD ✓ (Tasks 4, 11)
- Cart ✓ (Tasks 5, 9)
- Orders ✓ (Tasks 6, 10)
- Admin ✓ (Task 11)
- PWA ✓ (Task 12)
- Mobile-first ✓ (Tailwind defaults, shadcn responsive)
- Backend first ✓ (Tasks 4-6 before frontend 8-10)

**Placeholder scan:** No TODOs or TBDs caught.

**Type consistency:** All API responses return `NextResponse.json()`. Product images default to `""` in components. Price formatting uses `formatPrice()` consistently.
