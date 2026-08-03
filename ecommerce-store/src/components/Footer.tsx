import Link from "next/link";

const columns = [
  {
    heading: "Shop",
    links: [
      { label: "Products", href: "/products" },
      { label: "Home", href: "/products?category=home" },
      { label: "Self Care", href: "/products?category=self-care" },
      { label: "Accessories", href: "/products?category=accessories" },
      { label: "Travel", href: "/products?category=travel" },
      { label: "Gifts", href: "/products?category=gifts" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping Info", href: "/shipping" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "FAQ", href: "/faq" },
      { label: "Size Guide", href: "/size-guide" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Story", href: "/about" },
      { label: "Admin", href: "/admin", highlight: true },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

type FooterLink = { label: string; href: string; highlight?: boolean };

export function Footer() {
  return (
    <footer className="bg-black text-white/70">
      <div className="mx-auto px-6 py-8" style={{ maxWidth: 980 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-normal text-white" style={{ fontSize: 13 }}>
                {col.heading}
              </h4>
              <ul className="mt-2 space-y-0.5">
                {col.links.map((link: FooterLink) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={
                        link.highlight
                          ? "inline-flex items-center rounded-full border border-white/25 px-2.5 py-0.5 text-white transition-colors hover:bg-white/10 hover:text-white"
                          : "text-white/60 transition-colors hover:text-white"
                      }
                      style={link.highlight ? undefined : { fontSize: 14, lineHeight: "1.9" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <hr className="my-5 border-white/10" />
        <p className="text-white/40" style={{ fontSize: 12 }}>
          &copy; 2026 Love Soft Life. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
