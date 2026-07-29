import { auth0 } from "@/lib/auth0";
import Link from "next/link";
import { db } from "@/lib/db";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();
  let isAdmin = false;

  if (session?.user) {
    const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
    isAdmin = user?.role === "admin";
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto px-6 py-20 text-center" style={{ maxWidth: 980 }}>
        <h1 className="text-[34px] font-semibold leading-[1.47] text-ink">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">You do not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 py-12 flex gap-10" style={{ maxWidth: 1200 }}>
      <nav className="w-44 shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Admin</p>
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-ink hover:bg-canvas-parchment transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
