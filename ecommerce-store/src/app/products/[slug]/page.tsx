import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice, breadcrumbSchema } from "@/lib/utils";
import { parseImages } from "@/lib/images";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ImageGallery } from "@/components/ImageGallery";
import { ProductCard } from "@/components/ProductCard";
import { StickyAddToCart } from "@/components/StickyAddToCart";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return {};

  return {
    title: `${product.name} - Love Soft Life`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website",
      images: product.images ? [{ url: parseImages(product.images)[0] }] : [],
      siteName: "Love Soft Life",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.images ? [parseImages(product.images)[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) notFound();

  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    include: { category: true },
    take: 4,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images ? parseImages(product.images) : [],
    sku: product.slug,
    offers: {
      "@type": "Offer",
      price: product.priceCents / 100,
      priceCurrency: "USD",
      availability: product.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: product.name, url: `/products/${product.slug}` },
  ]);

  return (
    <div className="mx-auto px-6 py-16" style={{ maxWidth: 980 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          {product.images && (
            <ImageGallery images={product.images} alt={product.name} />
          )}
        </div>

        <div className="pt-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.category.name}</p>
          <h1 className="text-[24px] sm:text-[28px] lg:text-[34px] font-normal leading-[1.47] tracking-[-0.374px] text-ink mt-1">
            {product.name}
          </h1>
          <p className="mt-4 text-[17px] text-ink font-normal">{formatPrice(product.priceCents)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Free shipping on orders over $50</p>
          <p className="mt-4 text-[17px] text-ink leading-relaxed">
            {product.description}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {product.inventory > 0
              ? `${product.inventory} in stock`
              : "Out of stock"}
          </p>
          {product.inventory > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Estimated delivery: 5–7 business days
            </p>
          )}
          <div className="mt-6">
            <AddToCartButton productId={product.id} disabled={product.inventory <= 0} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-normal leading-[1.1] text-ink mb-6">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={{ ...p, images: p.images ?? null }} />
            ))}
          </div>
        </section>
      )}

      <StickyAddToCart
        productId={product.id}
        disabled={product.inventory <= 0}
        name={product.name}
        price={product.priceCents}
      />
    </div>
  );
}
