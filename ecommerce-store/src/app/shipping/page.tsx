import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Information — Love Soft Life",
};

export default function ShippingPage() {
  return (
    <div className="mx-auto px-6 py-16" style={{ maxWidth: 720 }}>
      <h1 className="text-[24px] sm:text-[28px] lg:text-[34px] font-normal tracking-[-0.374px] text-ink">
        Shipping Information
      </h1>
      <div className="mt-6 text-[17px] text-ink leading-relaxed space-y-4">
        <p>
          We offer free shipping on all orders over $50. Standard shipping
          takes 5–7 business days, and express shipping (2–3 business days) is
          available at checkout for an additional fee.
        </p>
        <p>
          All orders are processed within 1–2 business days. You will receive a
          shipping confirmation email with tracking information once your order
          ships.
        </p>
        <p>
          We currently ship to all 50 US states. International shipping is not
          available at this time.
        </p>
      </div>
    </div>
  );
}
