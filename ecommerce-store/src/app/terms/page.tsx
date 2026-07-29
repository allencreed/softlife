import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Love Soft Life",
};

export default function TermsPage() {
  return (
    <div className="mx-auto px-6 py-16" style={{ maxWidth: 720 }}>
      <h1 className="text-[24px] sm:text-[28px] lg:text-[34px] font-normal tracking-[-0.374px] text-ink">
        Terms of Service
      </h1>
      <div className="mt-6 text-[17px] text-ink leading-relaxed space-y-4">
        <p>
          By using the Love Soft Life website, you agree to these terms. Please
          read them carefully.
        </p>
        <p>
          All products are subject to availability. We reserve the right to
          limit quantities or refuse any order. Prices and descriptions are
          subject to change without notice.
        </p>
        <p>
          You agree not to use this site for any unlawful purpose or in
          violation of these terms. We reserve the right to terminate access
          for violations.
        </p>
        <p>
          These terms are governed by the laws of the United States. For
          questions, contact{" "}
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
