"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";

export function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  async function handleAdd() {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        router.push(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not add to cart");
      return;
    }

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    toast.success("Added to cart");
    router.refresh();
  }

  if (disabled) {
    return (
      <span className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-muted px-[22px] py-[11px] text-[17px] text-muted-foreground cursor-not-allowed">
        Out of Stock
      </span>
    );
  }

  return (
    <div className="inline-flex w-full sm:w-auto items-center gap-2">
      <div className="inline-flex items-center rounded-full border border-hairline">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-9 w-9 items-center justify-center text-ink hover:bg-muted rounded-full transition-colors"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-8 text-center text-[15px] font-normal text-ink tabular-nums select-none">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(99, q + 1))}
          className="flex h-9 w-9 items-center justify-center text-ink hover:bg-muted rounded-full transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <button
        onClick={handleAdd}
        className={`inline-flex items-center justify-center rounded-full px-[22px] py-[11px] text-[17px] text-white transition-all hover:brightness-110 active:scale-[0.96] ${
          justAdded ? "bg-green-600" : "bg-primary"
        }`}
      >
        {justAdded ? "Added!" : "Add to Cart"}
      </button>
    </div>
  );
}
