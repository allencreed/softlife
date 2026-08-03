"use client";

import { useState } from "react";

export function CartCheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        // In dev the Stripe webhook never fires (the checkout URL is synthesized),
        // so the cart is never cleared by api/webhooks/stripe. Clear it here to
        // match production behavior. Production relies on the webhook instead.
        // NOTE: detect dev via NODE_ENV (not the devAuth lib) to avoid pulling
        // better-sqlite3 into the client bundle.
        if (process.env.NODE_ENV !== "production") {
          try {
            const cartRes = await fetch("/api/cart");
            const { cart } = await cartRes.json();
            const items: { id: string }[] = cart?.items ?? [];
            await Promise.all(
              items.map((item) =>
                fetch(`/api/cart?itemId=${item.id}`, { method: "DELETE" })
              )
            );
          } catch {
            // Non-fatal: the redirect still proceeds even if clearing fails.
          }
        }
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Could not start checkout");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-[22px] py-[14px] text-[18px] font-light text-white hover:brightness-110 active:scale-[0.96] transition-all disabled:opacity-50"
      >
        {loading ? "Redirecting..." : "Checkout"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
