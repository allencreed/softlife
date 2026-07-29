import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { breadcrumbSchema } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Love Soft Life",
  description: "Premium products for a comfortable life.",
  openGraph: {
    title: "Love Soft Life",
    description: "Premium products for a comfortable life.",
    type: "website",
    siteName: "Love Soft Life",
    url: "https://lovesoftlife.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Love Soft Life",
    description: "Premium products for a comfortable life.",
  },
};

export default async function HomePage() {
  const featured = await db.product.findMany({
    where: { featured: true },
    include: { category: true },
    take: 8,
  });

  const homeBreadcrumb = breadcrumbSchema([{ name: "Home", url: "/" }]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeBreadcrumb) }}
      />
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-surface-black">
        <img
          src="/images/hero.png"
          alt="Love Soft Life"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative z-10 mx-auto px-6 text-center" style={{ maxWidth: 980 }}>
          <h1 className="text-[32px] sm:text-[44px] lg:text-[56px] font-light leading-[1.07] tracking-[-0.28px] text-white">
            Love Soft Life
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[20px] sm:text-[24px] lg:text-[28px] font-light leading-[1.14] tracking-[0.196px] text-white/90">
            Premium products for a comfortable life.
          </p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-primary px-[28px] py-[14px] text-[18px] font-light text-white hover:brightness-110 active:scale-[0.96] transition-all"
            >
              Shop All
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="bg-canvas-parchment py-20">
          <div className="mx-auto px-6" style={{ maxWidth: 1440 }}>
            <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-normal leading-[1.1] text-ink text-center mb-10">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((p) => (
                <ProductCard key={p.id} product={{ ...p, images: p.images ?? null }} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
