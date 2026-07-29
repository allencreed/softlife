import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story — Love Soft Life",
};

export default function AboutPage() {
  return (
    <div className="mx-auto px-6 py-16" style={{ maxWidth: 720 }}>
      <h1 className="text-[24px] sm:text-[28px] lg:text-[34px] font-normal tracking-[-0.374px] text-ink">
        Our Story
      </h1>
      <div className="mt-6 text-[17px] text-ink leading-relaxed space-y-4">
        <p>
          Love Soft Life is a premium lifestyle brand dedicated to offering
          thoughtfully curated products that bring comfort, warmth, and
          elegance to everyday living. From plush home essentials to refined
          self-care accessories, every item is chosen with intention — because
          you deserve to love the life you live.
        </p>
        <p>
          Founded on the belief that small luxuries make a big difference, we
          partner with artisans and makers who share our commitment to quality,
          sustainability, and timeless design.
        </p>
      </div>
    </div>
  );
}
