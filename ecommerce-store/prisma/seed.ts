import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  }),
});

async function upsertCategory(slug: string, name: string, description: string) {
  return db.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug, description },
  });
}

async function upsertProduct(
  slug: string,
  data: {
    name: string;
    description: string;
    priceCents: number;
    images: string[];
    categorySlug: string;
    inventory: number;
    featured: boolean;
  }
) {
  const category = await db.category.findUnique({ where: { slug: data.categorySlug } });
  if (!category) throw new Error(`Category ${data.categorySlug} not found`);

  return db.product.upsert({
    where: { slug },
    update: {
      name: data.name,
      description: data.description,
      priceCents: data.priceCents,
      images: JSON.stringify(data.images),
      categoryId: category.id,
      inventory: data.inventory,
      featured: data.featured,
    },
    create: {
      slug,
      name: data.name,
      description: data.description,
      priceCents: data.priceCents,
      images: JSON.stringify(data.images),
      categoryId: category.id,
      inventory: data.inventory,
      featured: data.featured,
    },
  });
}

async function main() {
  await upsertCategory("apparel", "Apparel", "Clothing and accessories");
  await upsertCategory("home", "Home", "Luxury home essentials");
  await upsertCategory("self-care", "Self Care", "Wellness and relaxation");
  await upsertCategory("accessories", "Accessories", "Everyday premium accessories");
  await upsertCategory("travel", "Travel", "Travel essentials");
  await upsertCategory("gifts", "Gifts", "Curated gift collection");

  await upsertProduct("classic-tee", {
    name: "Classic Tee",
    description: "A comfortable cotton t-shirt. Perfect for everyday wear with a relaxed fit and soft feel.",
    priceCents: 2999,
    images: [
      "/images/products/tee-1.jpg",
      "/images/products/tee-2.svg",
      "/images/products/tee-3.svg",
    ],
    categorySlug: "apparel",
    inventory: 50,
    featured: true,
  });

  await upsertProduct("denim-jacket", {
    name: "Denim Jacket",
    description: "A stylish denim jacket for all seasons. Classic construction with modern detailing.",
    priceCents: 8999,
    images: [
      "/images/products/jacket-1.svg",
      "/images/products/jacket-2.svg",
      "/images/products/jacket-3.svg",
    ],
    categorySlug: "apparel",
    inventory: 20,
    featured: true,
  });

  await upsertProduct("bamboo-throw-blanket", {
    name: "Ultra-Soft Bamboo Throw",
    description:
      "Woven from premium bamboo fibers, this throw blanket is incredibly soft, breathable, and gentle on sensitive skin. Lightweight yet warm — perfect for cozy evenings on the couch or an extra layer on chilly nights.",
    priceCents: 7999,
    images: [
      "/images/products/bamboo-1.svg",
      "/images/products/bamboo-2.svg",
      "/images/products/bamboo-3.svg",
      "/images/products/bamboo-4.svg",
    ],
    categorySlug: "home",
    inventory: 35,
    featured: true,
  });

  await upsertProduct("aromatherapy-diffuser", {
    name: "Aromatherapy Ultrasonic Diffuser",
    description:
      "Transform any room into a calming sanctuary. This ultrasonic diffuser disperses fine micro-mist with your favorite essential oils, running silently for up to 10 hours. Features ambient LED lighting and automatic shut-off.",
    priceCents: 4499,
    images: [
      "/images/products/diffuser-1.svg",
      "/images/products/diffuser-2.svg",
      "/images/products/diffuser-3.svg",
    ],
    categorySlug: "self-care",
    inventory: 25,
    featured: true,
  });

  await upsertProduct("leather-journal", {
    name: "Italian Leather Journal",
    description:
      "Hand-bound in Florence with genuine Italian leather. Features 200 pages of archival-quality, acid-free paper that takes fountain pen ink beautifully. Lies flat when open. Available in A5 size with a ribbon bookmark and elastic closure.",
    priceCents: 3499,
    images: [
      "/images/products/journal-1.svg",
      "/images/products/journal-2.svg",
      "/images/products/journal-3.svg",
    ],
    categorySlug: "accessories",
    inventory: 40,
    featured: false,
  });

  await upsertProduct("packing-cube-set", {
    name: "Premium Packing Cube Set",
    description:
      "Three-piece packing cube set in lightweight, water-resistant nylon. Keeps your luggage organized and maximizes suitcase space. Set includes small, medium, and large cubes with mesh tops for easy visibility.",
    priceCents: 4999,
    images: [
      "/images/products/cube-1.svg",
      "/images/products/cube-2.svg",
      "/images/products/cube-3.svg",
      "/images/products/cube-4.svg",
    ],
    categorySlug: "travel",
    inventory: 60,
    featured: false,
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
