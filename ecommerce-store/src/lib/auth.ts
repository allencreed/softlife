import { auth0 } from "./auth0";
import { NextRequest } from "next/server";
import { db } from "./db";

export async function getCurrentUser(req?: NextRequest) {
  const session = req ? await auth0.getSession(req) : await auth0.getSession();
  if (!session?.user) return null;

  const user = await db.user.findUnique({
    where: { auth0Id: session.user.sub },
  });

  return user;
}

export async function requireAdmin(req?: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return user;
}
