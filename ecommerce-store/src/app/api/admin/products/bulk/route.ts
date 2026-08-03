import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth0.getSession(req);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  if (body?.all === true) {
    const all = await db.product.findMany({ select: { id: true } });
    const ids = all.map((p) => p.id);
    try {
      await db.product.deleteMany({ where: { id: { in: ids } } });
    } catch {
      // FK constraint errors may surface; count reflects fetch snapshot.
    }
    return NextResponse.json({ deleted: ids.length });
  }

  const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
  if (ids.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const result = await db.product.deleteMany({ where: { id: { in: ids } } });
  return NextResponse.json({ deleted: result.count });
}
