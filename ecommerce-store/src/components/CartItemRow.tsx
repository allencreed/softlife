"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { parseImages } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

type CartItemRowProps = {
  item: {
    id: string;
    quantity: number;
    priceCents: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string | null;
    };
  };
};

export function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter();
  const [qty, setQty] = useState(item.quantity);

  async function updateQuantity(newQty: number) {
    if (newQty < 1 || newQty > 99) return;
    setQty(newQty);
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, quantity: newQty }),
    });
    router.refresh();
  }

  async function handleRemove() {
    await fetch(`/api/cart?itemId=${item.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 rounded-[18px] border border-hairline bg-white p-4">
      <Link href={`/products/${item.product.slug}`}>
        <div className="h-20 w-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
          {item.product.images && (
            <img
               src={parseImages(item.product.images)[0]}
              alt={item.product.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.product.slug}`} className="text-[17px] font-normal text-ink hover:underline line-clamp-1">
          {item.product.name}
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">Qty:</span>
          <div className="inline-flex items-center rounded-full border border-hairline">
            <button
              type="button"
              onClick={() => updateQuantity(qty - 1)}
              className="flex h-6 w-6 items-center justify-center text-ink hover:bg-muted rounded-full transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-[13px] font-normal text-ink tabular-nums select-none">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(qty + 1)}
              className="flex h-6 w-6 items-center justify-center text-ink hover:bg-muted rounded-full transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
        <p className="text-[17px] font-normal mt-1">{formatPrice(item.priceCents * qty)}</p>
      </div>
      <Button variant="ghost" onClick={handleRemove} className="text-sm">
        Remove
      </Button>
    </div>
  );
}
