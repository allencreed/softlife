import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Love Soft Life",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto px-6 py-16" style={{ maxWidth: 720 }}>
      <h1 className="text-[24px] sm:text-[28px] lg:text-[34px] font-normal tracking-[-0.374px] text-ink">
        Privacy Policy
      </h1>
      <div className="mt-6 text-[17px] text-ink leading-relaxed space-y-4">
        <p>
          Your privacy is important to us. We collect only the information
          necessary to process your orders — including your name, email
          address, shipping address, and payment details.
        </p>
        <p>
          We use your information solely for order processing, customer
          support, and improving our services. We do not sell, rent, or share
          your personal data with third parties for their marketing purposes.
        </p>
        <p>
          We may share your information with trusted service providers who
          assist us in operating our website and fulfilling orders (e.g.,
          payment processors, shipping carriers), under strict confidentiality
          agreements.
        </p>
        <p>
          If you have any questions about this policy, please contact us at{" "}
          <a
            href="mailto:support@lovesoftlife.com"
            className="text-primary hover:underline"
          >
            support@lovesoftlife.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
