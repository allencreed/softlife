import Link from "next/link";

export function UserMenu({ user }: { user: { name?: string; email?: string } | null }) {
  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="rounded bg-[#1d1d1f] px-3 py-1.5 text-white/80 hover:text-white transition-colors"
        style={{ fontSize: 12, letterSpacing: "-0.12px" }}
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4" style={{ fontSize: 12, letterSpacing: "-0.12px" }}>
      <Link href="/account/orders" className="text-white/80 hover:text-white transition-colors">
        Orders
      </Link>
      <span className="text-white/50">{user.name || user.email}</span>
      <Link href="/auth/logout" className="text-white/50 hover:text-white/80 transition-colors">
        Sign Out
      </Link>
    </div>
  );
}
