import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DebugAdminPage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold mb-4">Not Logged In</h1>
        <p>You need to log in first. Go to the homepage and sign in.</p>
      </div>
    );
  }

  const auth0Id = session.user.sub!;
  let user = await db.user.findUnique({ where: { auth0Id } });

  if (!user) {
    user = await db.user.create({
      data: {
        auth0Id,
        email: session.user.email!,
        name: session.user.name ?? null,
        role: "admin",
      },
    });
  } else if (user.role !== "admin") {
    user = await db.user.update({ where: { auth0Id }, data: { role: "admin" } });
  }

  await db.user.deleteMany({ where: { auth0Id: "manual-admin" } });

  redirect("/admin");
}
