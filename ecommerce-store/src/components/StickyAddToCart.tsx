"use client";

import { AddToCartButton } from "./AddToCartButton";
import { formatPrice } from "@/lib/utils";

export function StickyAddToCart({
  productId,
  disabled,
  name,
  price,
}: {
  productId: string;
  disabled: boolean;
  name: string;
  price: number;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-hairline bg-white/95 backdrop-blur px-4 py-3 sm:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-ink">{name}</p>
          <p className="text-sm text-ink">{formatPrice(price)}</p>
        </div>
        <div className="flex-shrink-0">
          <AddToCartButton productId={productId} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}
