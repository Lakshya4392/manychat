import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DebugPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
    include: {
      integrations: true,
      subscription: true,
      automations: true,
    },
  }) as any;

  const automationCount = dbUser?.automations?.length || 0;
  const dmCount = dbUser?.automations?.length 
    ? await db.dms.count({ where: { automationId: { in: dbUser.automations.map((a: any) => a.id) } } })
    : 0;

  const envVars = [
    { key: "INSTAGRAM_CLIENT_ID", value: process.env.INSTAGRAM_CLIENT_ID ? "SET" : "MISSING", ok: !!process.env.INSTAGRAM_CLIENT_ID },
    { key: "INSTAGRAM_CLIENT_SECRET", value: process.env.INSTAGRAM_CLIENT_SECRET ? "SET" : "MISSING", ok: !!process.env.INSTAGRAM_CLIENT_SECRET },
    { key: "INSTAGRAM_VERIFY_TOKEN", value: process.env.INSTAGRAM_VERIFY_TOKEN || "NOT SET", ok: !!process.env.INSTAGRAM_VERIFY_TOKEN },
    { key: "NEXT_PUBLIC_HOST_URL", value: process.env.NEXT_PUBLIC_HOST_URL || "NOT SET", ok: !!process.env.NEXT_PUBLIC_HOST_URL },
    { key: "OPENAI_API_KEY", value: process.env.OPENAI_API_KEY ? "SET" : "MISSING (optional)", ok: true },
  ];

  const redirectUri = `${process.env.NEXT_PUBLIC_HOST_URL}/api/instagram/callback`;

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8 font-mono">
      <h1 className="text-2xl font-bold mb-6 text-primary">Debug Configuration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Env Vars */}
        <div className="bg-[#121215] border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-bold mb-4 text-zinc-300">Environment Variables</h2>
          <div className="space-y-2">
            {envVars.map((env) => (
              <div key={env.key} className="flex justify-between text-sm">
                <span className="text-zinc-500">{env.key}</span>
                <span className={env.ok ? "text-green-500" : "text-red-500"}>{env.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Data */}
        <div className="bg-[#121215] border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-bold mb-4 text-zinc-300">User Data</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Clerk ID</span>
              <span>{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Email</span>
              <span>{user.emailAddresses[0]?.emailAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">DB User ID</span>
              <span>{dbUser?.id || "NOT FOUND"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Plan</span>
              <span className={dbUser?.subscription?.plan === "PRO" ? "text-primary" : "text-zinc-400"}>
                {dbUser?.subscription?.plan || "FREE"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Automations</span>
              <span>{automationCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">DMs logged</span>
              <span>{dmCount}</span>
            </div>
          </div>
        </div>

        {/* Instagram Integration */}
        <div className="bg-[#121215] border border-white/10 rounded-xl p-5 md:col-span-2">
          <h2 className="text-lg font-bold mb-4 text-zinc-300">Instagram Integration</h2>
          {dbUser?.integrations?.length === 0 ? (
            <p className="text-amber-500">No Instagram integration connected</p>
          ) : (
            <div className="space-y-3">
              {dbUser?.integrations?.map((integration: any) => (
                <div key={integration.id} className="border-t border-white/10 pt-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-zinc-500 block">Type</span>
                      <span>{integration.name}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Instagram ID</span>
                      <span>{integration.instagramId || "NOT SET"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Token</span>
                      <span>{integration.token ? `SET (expires: ${integration.expiresAt?.toLocaleDateString()})` : "MISSING"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Created</span>
                      <span>{integration.createdAt?.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OAuth Redirect URI */}
        <div className="bg-[#121215] border border-green-500/30 rounded-xl p-5 md:col-span-2">
          <h2 className="text-lg font-bold mb-4 text-green-400">OAuth Redirect URI</h2>
          <div className="font-mono text-sm bg-black/30 p-3 rounded border border-white/10 break-all">
            <span className="text-zinc-500">Copy this exact URI to Meta Developer Console (Instagram Basic Display → OAuth Settings):</span>
            <div className="text-yellow-400 mt-1">{redirectUri}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#121215] border border-primary/30 rounded-xl p-5 md:col-span-2">
          <h2 className="text-lg font-bold mb-4 text-primary">Fix "Invalid Platform App" Error</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300">
            <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meta for Developers</a></li>
            <li>Create a new app (Business or Consumer type)</li>
            <li>Add products: <strong>Instagram Basic Display</strong> and <strong>Webhooks</strong></li>
            <li>In Instagram Basic Display settings, add the redirect URI above exactly</li>
            <li><strong className="text-red-400">CRITICAL:</strong> Switch app from "Development" to <strong>"Live"</strong> mode in App Dashboard</li>
            <li>Your Instagram account must be <strong>Professional/Creator</strong> and linked to a Facebook Page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
