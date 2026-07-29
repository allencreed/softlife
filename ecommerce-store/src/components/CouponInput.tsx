"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";

const COUPONS: Record<string, { type: "percent" | "fixed"; value: number }> = {
  WELCOME10: { type: "percent", value: 10 },
};

export function CouponInput({
  total,
  onDiscountChange,
}: {
  total: number;
  onDiscountChange?: (discount: number) => void;
}) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handleApply() {
    const coupon = COUPONS[code.toUpperCase()];
    if (!coupon) {
      setError("Invalid coupon code");
      return;
    }
    const discount =
      coupon.type === "percent"
        ? Math.round(total * (coupon.value / 100))
        : coupon.value;
    setApplied(code.toUpperCase());
    setError("");
    onDiscountChange?.(discount);
  }

  function handleRemove() {
    setApplied(null);
    setCode("");
    setError("");
    onDiscountChange?.(0);
  }

  return (
    <div className="mt-4">
      {!applied ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Coupon code"
            className="flex-1 rounded-full border border-hairline px-4 py-2 text-sm text-ink outline-none focus:border-primary transition-colors"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
          />
          <button
            onClick={handleApply}
            disabled={!code.trim()}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm text-white hover:brightness-110 active:scale-[0.96] transition-all disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-full bg-green-50 px-5 py-2.5">
          <p className="text-sm text-green-800">
            Coupon <span className="font-normal">{applied}</span> applied &mdash;{" "}
            {formatPrice(
              COUPONS[applied].type === "percent"
                ? Math.round(total * (COUPONS[applied].value / 100))
                : COUPONS[applied].value
            )}{" "}
            off
          </p>
          <button
            onClick={handleRemove}
            className="text-sm text-green-800/60 hover:text-green-800 transition-colors"
          >
            Remove
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <p className="mt-1 text-xs text-ink-muted-48">Try code: WELCOME10</p>
    </div>
  );
}
