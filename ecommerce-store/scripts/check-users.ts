import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: "file:./dev.db" }),
});

async function main() {
  const users = await db.user.findMany({ select: { id: true, auth0Id: true, email: true, role: true } });
  console.log(JSON.stringify(users, null, 2));
  await db.$disconnect();
}
main().catch(console.error);
