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

export function Footer() {
  return (
    <footer className="bg-canvas-parchment">
      <div className="mx-auto px-6 py-16" style={{ maxWidth: 980 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-normal text-ink" style={{ fontSize: 14 }}>
                {col.heading}
              </h4>
              <ul className="mt-3 space-y-1">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-ink-muted-48 transition-colors hover:text-ink"
                      style={{ fontSize: 17, lineHeight: "2.41" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <hr className="my-8 border-hairline" />
        <p className="text-ink-muted-48" style={{ fontSize: 12 }}>
          &copy; 2026 Love Soft Life. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
