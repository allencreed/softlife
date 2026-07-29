import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { parseImages } from "@/lib/images";

type Product = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  images: string | null;
  inventory: number;
  featured: boolean;
  category: { name: string };
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <Link href={`/products/${product.slug}`} className="relative block">
        <div className="aspect-square bg-muted">
          {product.images && (
            <img
              src={parseImages(product.images)[0]}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
          {product.featured && product.inventory > 0 && (
            <span className="absolute top-2 left-2 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-white">
              Featured
            </span>
          )}
        </div>
      </Link>
      <CardContent className="pt-4 pb-3 px-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.category.name}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-0.5 text-[17px] font-normal leading-tight text-ink">{product.name}</h3>
        </Link>
        <p className="mt-1 text-[17px] text-ink">{formatPrice(product.priceCents)}</p>
      </CardContent>
      <div className="px-5 pb-4">
        {product.inventory > 0 ? (
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-[22px] py-[11px] text-sm text-primary-foreground hover:brightness-110 active:scale-[0.96] transition-all"
          >
            View Details
          </Link>
        ) : (
          <span className="inline-flex w-full items-center justify-center rounded-full bg-muted px-[22px] py-[11px] text-sm text-muted-foreground cursor-not-allowed">
            Out of Stock
          </span>
        )}
      </div>
    </Card>
  );
}
