import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Love Soft Life",
};

export default function ContactPage() {
  return (
    <div className="mx-auto px-6 py-16" style={{ maxWidth: 720 }}>
      <h1 className="text-[24px] sm:text-[28px] lg:text-[34px] font-normal tracking-[-0.374px] text-ink">
        Contact Us
      </h1>
      <div className="mt-6 text-[17px] text-ink leading-relaxed space-y-4">
        <p>
          We would love to hear from you. For questions, feedback, or support,
          email us at{" "}
          <a
            href="mailto:support@lovesoftlife.com"
            className="text-primary hover:underline"
          >
            support@lovesoftlife.com
          </a>
          .
        </p>
        <p>We aim to respond to all inquiries within 24 hours.</p>
      </div>
    </div>
  );
}
