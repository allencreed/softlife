"use client";

import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 5000;

export function ShippingBar({ total }: { total: number }) {
  const remaining = FREE_SHIPPING_THRESHOLD - total;
  const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);

  if (remaining <= 0) {
    return (
      <div className="rounded-full bg-green-50 px-5 py-3 text-center text-sm text-green-800">
        You've earned free shipping!
      </div>
    );
  }

  return (
    <div className="rounded-full bg-canvas-parchment px-5 py-3">
      <p className="text-xs text-ink-muted-48 text-center">
        You're <span className="text-ink font-normal">{formatPrice(remaining)}</span> away from free shipping
      </p>
      <div className="mt-1.5 h-1 w-full rounded-full bg-hairline">
        <div
          className="h-1 rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
