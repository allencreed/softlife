import Link from "next/link";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { SiteNav } from "./SiteNav";

export async function Header() {
  const session = await auth0.getSession();
  let user = null;
  let cartCount = 0;

  if (session?.user) {
    const dbUser = await db.user.findUnique({
      where: { auth0Id: session.user.sub },
    });
    user = dbUser;
    if (dbUser) {
      const cart = await db.cart.findUnique({
        where: { userId: dbUser.id },
        include: { items: true },
      });
      cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#000000] text-white" style={{ height: 44 }}>
      <div className="mx-auto flex h-full items-center justify-between px-5" style={{ maxWidth: 980 }}>
        <Link href="/" className="text-sm font-normal tracking-wide" style={{ fontSize: 14 }}>
          Love Soft Life
        </Link>
        <SiteNav cartCount={cartCount} user={user ? { name: user.name ?? undefined, email: user.email } : null} />
      </div>
    </header>
  );
}
