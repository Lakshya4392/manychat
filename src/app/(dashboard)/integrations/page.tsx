import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Resolve searchParams (Next.js 16 - searchParams is a Promise)
  const resolvedParams = await searchParams;

  // Fetch user's integrations from DB
  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
    include: {
      integrations: true,
    },
  });

  const instagramIntegration = dbUser?.integrations.find(
    (i) => i.name === "INSTAGRAM"
  );

  // Determine status
  const isInstagramConnected = !!instagramIntegration;
  const isTokenExpired = instagramIntegration?.expiresAt
    ? instagramIntegration.expiresAt < new Date()
    : false;

  const success = typeof resolvedParams.success === 'string' ? resolvedParams.success : undefined;
  const error = typeof resolvedParams.error === 'string' ? resolvedParams.error : undefined;
  const errorDescription = typeof resolvedParams.description === 'string' ? resolvedParams.description : undefined;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-10">
        <h1 className="text-3xl font-bold text-white font-heading tracking-tight">
          Integrations
        </h1>
        <p className="text-sm text-zinc-500 max-w-lg">
          Connect your social media accounts to enable automations.
        </p>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          ✅ Instagram connected successfully!
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          ❌ Connection failed: {decodeURIComponent(error)}
          {errorDescription && (
            <p className="mt-1 text-xs text-red-400/70">{decodeURIComponent(errorDescription)}</p>
          )}
        </div>
      )}

      {/* Instagram Integration Card */}
      <div className="card-glow p-8 border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Instagram Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Instagram</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {isInstagramConnected
                  ? isTokenExpired
                    ? "Token expired — please reconnect"
                    : "Connected and active"
                  : "Not connected"}
              </p>
            </div>
          </div>

          {/* Status Badge + Action */}
          <div className="flex items-center gap-4">
            {isInstagramConnected && !isTokenExpired && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">
                  Connected
                </span>
              </div>
            )}
            {isInstagramConnected && isTokenExpired && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">
                  Expired
                </span>
              </div>
            )}

            <Link
              href="/api/instagram/auth"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white hover:opacity-90 hover:shadow-lg hover:shadow-pink-500/25"
            >
              {isInstagramConnected ? (isTokenExpired ? "Reconnect" : "Reconnect") : "Connect Instagram"}
            </Link>
          </div>
        </div>

        {/* Connected Account Details */}
        {isInstagramConnected && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Instagram ID</p>
                <p className="text-sm text-zinc-300 font-mono">{instagramIntegration?.instagramId || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Token Expires</p>
                <p className="text-sm text-zinc-300">
                  {instagramIntegration?.expiresAt
                    ? instagramIntegration.expiresAt.toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <p className="text-xs text-zinc-400">
          <span className="font-semibold text-primary">Note:</span>{" "}
          You need an Instagram Professional (Business or Creator) account connected to a Facebook Page to use messaging automations.
          Make sure your Instagram app is configured with the correct OAuth redirect URI:{" "}
          <code className="text-[11px] bg-white/5 px-1.5 py-0.5 rounded font-mono text-zinc-300">
            {process.env.NEXT_PUBLIC_HOST_URL}/api/instagram/callback
          </code>
        </p>
      </div>
    </div>
  );
}
