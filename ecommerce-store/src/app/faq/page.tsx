import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Love Soft Life",
};

const faqs = [
  {
    q: "How do I place an order?",
    a: "Browse our products, add items to your cart, and proceed to checkout. You can pay securely with a credit card or PayPal.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Visa, Mastercard, American Express, and PayPal. All transactions are processed securely.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 5–7 business days. Express shipping (2–3 business days) is available at checkout. Free shipping on orders over $50.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 30 days of delivery. Items must be unused and in original packaging. See our Returns & Exchanges page for details.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto px-6 py-16" style={{ maxWidth: 720 }}>
      <h1 className="text-[24px] sm:text-[28px] lg:text-[34px] font-normal tracking-[-0.374px] text-ink">
        Frequently Asked Questions
      </h1>
      <dl className="mt-6 space-y-8">
        {faqs.map((faq) => (
          <div key={faq.q}>
            <dt className="text-[17px] font-semibold text-ink">{faq.q}</dt>
            <dd className="mt-2 text-[17px] text-ink-muted-48 leading-relaxed">
              {faq.a}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
