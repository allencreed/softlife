import { auth0 } from "@/lib/auth0";

export default async function DebugPage() {
  const session = await auth0.getSession();

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Debug Info</h1>
      <pre className="bg-muted p-4 rounded text-xs">
        {JSON.stringify(
          {
            hasSession: !!session,
            user: session?.user
              ? { sub: session.user.sub, email: session.user.email }
              : null,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}
