"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type User = { name?: string; email?: string } | null;

export function SiteNav({
  cartCount,
  user,
}: {
  cartCount: number;
  user: User;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        className="hidden sm:flex items-center gap-5 text-xs"
        style={{ letterSpacing: "-0.12px", fontSize: 12 }}
      >
        <Link
          href="/products"
          className="text-white/80 hover:text-white transition-colors"
        >
          Products
        </Link>
        <form action="/products" method="GET">
          <input
            type="text"
            name="search"
            placeholder="Search..."
            className="w-32 rounded-full bg-white/10 px-3 py-1 text-xs text-white placeholder:text-white/50 outline-none focus:bg-white/20 transition-colors"
          />
        </form>
        <Link
          href="/cart"
          className="relative text-white/80 hover:text-white transition-colors"
        >
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-white">
              {cartCount}
            </span>
          )}
        </Link>
        {!user ? (
          <Link
            href="/auth/login"
            className="rounded bg-[#1d1d1f] px-3 py-1.5 text-white/80 hover:text-white transition-colors"
            style={{ fontSize: 12, letterSpacing: "-0.12px" }}
          >
            Sign In
          </Link>
        ) : (
          <div
            className="flex items-center gap-4"
            style={{ fontSize: 12, letterSpacing: "-0.12px" }}
          >
            <Link
              href="/account/orders"
              className="text-white/80 hover:text-white transition-colors"
            >
              Orders
            </Link>
            <span className="text-white/50">{user.name || user.email}</span>
            <Link
              href="/auth/logout"
              className="text-white/50 hover:text-white/80 transition-colors"
            >
              Sign Out
            </Link>
          </div>
        )}
      </nav>

      <button
        onClick={() => setOpen(!open)}
        className="sm:hidden flex items-center justify-center text-white/80 hover:text-white transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div className="fixed inset-0 top-[44px] z-50 bg-[#000000] px-5 py-8">
          <nav className="flex flex-col items-center gap-6 text-sm">
            <Link
              href="/products"
              className="text-white/80 hover:text-white transition-colors"
              onClick={() => setOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/cart"
              className="relative text-white/80 hover:text-white transition-colors"
              onClick={() => setOpen(false)}
            >
              Cart
              {cartCount > 0 && (
                <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link
                  href="/account/orders"
                  className="text-white/80 hover:text-white transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Orders
                </Link>
                <span className="text-white/50">{user.name || user.email}</span>
                <Link
                  href="/auth/logout"
                  className="text-white/50 hover:text-white/80 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="rounded bg-[#1d1d1f] px-4 py-2 text-white/80 hover:text-white transition-colors"
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
