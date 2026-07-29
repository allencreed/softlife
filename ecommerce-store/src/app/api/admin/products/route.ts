import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth0.getSession(req);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const product = await db.product.create({ data: body });
  return NextResponse.json(product);
}
