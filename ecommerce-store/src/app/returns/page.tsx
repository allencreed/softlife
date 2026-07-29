import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchanges — Love Soft Life",
};

export default function ReturnsPage() {
  return (
    <div className="mx-auto px-6 py-16" style={{ maxWidth: 720 }}>
      <h1 className="text-[24px] sm:text-[28px] lg:text-[34px] font-normal tracking-[-0.374px] text-ink">
        Returns & Exchanges
      </h1>
      <div className="mt-6 text-[17px] text-ink leading-relaxed space-y-4">
        <p>
          We accept returns within 30 days of delivery. Items must be unused
          and in their original packaging to qualify for a refund.
        </p>
        <p>
          If your item arrives defective or damaged, we offer free returns.
          Please contact us at{" "}
          <a
            href="mailto:support@lovesoftlife.com"
            className="text-primary hover:underline"
          >
            support@lovesoftlife.com
          </a>{" "}
          with your order number and a photo of the issue.
        </p>
        <p>
          Refunds are processed within 5–7 business days after we receive your
          return. The refund will be issued to your original payment method.
        </p>
      </div>
    </div>
  );
}
