"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Search } from "lucide-react";

type User = { name?: string; email?: string } | null;

const CATEGORIES = [
  { name: "Apparel", slug: "apparel" },
  { name: "Home", slug: "home" },
  { name: "Self Care", slug: "self-care" },
  { name: "Accessories", slug: "accessories" },
  { name: "Travel", slug: "travel" },
  { name: "Gifts", slug: "gifts" },
];

export function SiteNav({
  cartCount,
  user,
}: {
  cartCount: number;
  user: User;
}) {
  const [open, setOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);

  const linkClass =
    "text-white/80 hover:text-white transition-colors";
  const ctaClass =
    "rounded bg-[#1d1d1f] px-3 py-1.5 text-white/90 hover:text-white transition-colors";

  return (
    <>
      {/* Desktop nav */}
      <nav
        className="hidden sm:flex items-center gap-5 text-xs"
        style={{ letterSpacing: "-0.12px", fontSize: 12 }}
      >
        <Link href="/products" className={linkClass}>
          Products
        </Link>

        {/* Categories dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setCatsOpen(true)}
          onMouseLeave={() => setCatsOpen(false)}
        >
          <button
            type="button"
            className={`flex items-center gap-1 ${linkClass}`}
            aria-haspopup="true"
            aria-expanded={catsOpen}
            onClick={() => setCatsOpen((v) => !v)}
          >
            Categories
            <ChevronDown className="h-3 w-3" />
          </button>
          {catsOpen && (
            <div className="absolute left-0 top-full pt-2 w-44">
              <div className="rounded-xl border border-white/10 bg-[#111] py-1 shadow-lg">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/products?category=${c.slug}`}
                    className="block px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Utility cluster (right) */}
        <div className="ml-auto flex items-center gap-5">
          <form action="/products" method="GET" className="flex items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                name="search"
                placeholder="Search..."
                className="w-36 rounded-full bg-white/10 py-1 pl-7 pr-3 text-xs text-white placeholder:text-white/50 outline-none focus:bg-white/20 transition-colors"
              />
            </div>
          </form>

          <Link href="/cart" className={`relative ${linkClass}`}>
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {!user ? (
            <Link href="/auth/login" className={ctaClass}>
              Sign In
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/account/orders" className={linkClass}>
                Orders
              </Link>
              <span className="text-white/50">{user.name || user.email}</span>
              <Link href="/auth/logout" className="text-white/50 hover:text-white/80 transition-colors">
                Sign Out
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="sm:hidden flex items-center justify-center text-white/80 hover:text-white transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 top-[44px] z-50 bg-[#000000] px-5 py-8">
          <nav className="flex flex-col items-center gap-6 text-sm">
            {/* Search restored at top for mobile */}
            <form action="/products" method="GET" className="w-full max-w-xs">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search..."
                  className="w-full rounded-full bg-white/10 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/50 outline-none focus:bg-white/20 transition-colors"
                  onClick={() => setOpen(false)}
                />
              </div>
            </form>

            <Link href="/products" className={linkClass} onClick={() => setOpen(false)}>
              Products
            </Link>

            <div className="flex flex-col items-center gap-3">
              <span className="text-white/50 text-xs uppercase tracking-wider">Categories</span>
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/products?category=${c.slug}`}
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  {c.name}
                </Link>
              ))}
            </div>

            <Link href="/cart" className={`relative ${linkClass}`} onClick={() => setOpen(false)}>
              Cart
              {cartCount > 0 && (
                <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link href="/account/orders" className={linkClass} onClick={() => setOpen(false)}>
                  Orders
                </Link>
                <span className="text-white/50">{user.name || user.email}</span>
                <Link href="/auth/logout" className="text-white/50 hover:text-white/80 transition-colors" onClick={() => setOpen(false)}>
                  Sign Out
                </Link>
              </>
            ) : (
              <Link href="/auth/login" className={ctaClass} onClick={() => setOpen(false)}>
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
