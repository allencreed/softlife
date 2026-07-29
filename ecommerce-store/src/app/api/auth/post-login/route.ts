import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.AUTH0_POST_LOGIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const auth0User = body.user;
  if (!auth0User) {
    return NextResponse.json({ error: "Missing user payload" }, { status: 400 });
  }

  const { auth0Id, email, name } = auth0User;
  if (!auth0Id || !email) {
    return NextResponse.json({ error: "Missing required fields: auth0Id, email" }, { status: 400 });
  }

  await db.user.upsert({
    where: { auth0Id },
    update: { email, name: name ?? null },
    create: { auth0Id, email, name: name ?? null },
  });

  return NextResponse.json({ ok: true });
}
