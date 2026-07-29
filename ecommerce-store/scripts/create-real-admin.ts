import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: "file:./dev.db" }),
});

async function main() {
  // Delete old manual admin (same email)
  await db.user.deleteMany({ where: { auth0Id: "manual-admin" } });

  // Create real user with Auth0 sub
  await db.user.upsert({
    where: { auth0Id: "auth0|6a621bd1889ef47342d36836" },
    update: { role: "admin" },
    create: {
      auth0Id: "auth0|6a621bd1889ef47342d36836",
      email: "allencreed@gmail.com",
      name: "Allen",
      role: "admin",
    },
  });

  const users = await db.user.findMany({ select: { id: true, auth0Id: true, email: true, role: true } });
  console.log(JSON.stringify(users, null, 2));
  await db.$disconnect();
}

main().catch(console.error);
