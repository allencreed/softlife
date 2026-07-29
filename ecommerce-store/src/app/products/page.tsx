import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { breadcrumbSchema } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products - Love Soft Life",
  description: "Browse our collection of premium products",
  openGraph: {
    title: "Products - Love Soft Life",
    description: "Browse our collection of premium products",
    type: "website",
    siteName: "Love Soft Life",
  },
  twitter: {
    card: "summary_large_image",
    title: "Products - Love Soft Life",
    description: "Browse our collection of premium products",
  },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const where: Record<string, unknown> = {};
  if (params.category) {
    where.category = { slug: params.category };
  }
  if (params.search) {
    where.name = { contains: params.search };
  }

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany(),
  ]);

  const productsBreadcrumb = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
  ]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsBreadcrumb) }}
      />
      <section className="bg-canvas-parchment py-16 text-center">
        <div className="mx-auto px-6" style={{ maxWidth: 980 }}>
          <h1 className="text-[28px] sm:text-[34px] lg:text-[40px] font-normal leading-[1.1] text-ink">Products</h1>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <a
              href="/products"
              className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm transition-all ${
                !params.category
                  ? "border-2 border-primary bg-white text-ink"
                  : "border border-hairline bg-white text-ink-muted-80 hover:border-ink-muted-48"
              }`}
            >
              All
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm transition-all ${
                  params.category === cat.slug
                    ? "border-2 border-primary bg-white text-ink"
                    : "border border-hairline bg-white text-ink-muted-80 hover:border-ink-muted-48"
                }`}
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-canvas py-16">
        <div className="mx-auto px-6" style={{ maxWidth: 1440 }}>
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground">No products found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={{ ...p, images: p.images ?? null }} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
