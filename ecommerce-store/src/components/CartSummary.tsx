"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { CartCheckoutButton } from "./CartCheckoutButton";
import { CouponInput } from "./CouponInput";
import { ShippingBar } from "./ShippingBar";
import { TrustBadges } from "./TrustBadges";

export function CartSummary({ total }: { total: number }) {
  const [discount, setDiscount] = useState(0);
  const finalTotal = Math.max(total - discount, 0);

  return (
    <div className="mt-8">
      <ShippingBar total={total} />
      <CouponInput total={total} onDiscountChange={setDiscount} />
      <div className="mt-6 border-t border-hairline pt-6">
        {discount > 0 && (
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 mb-2">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-[17px] font-normal">
          <span>Total</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
        <CartCheckoutButton />
        <TrustBadges />
      </div>
    </div>
  );
}
