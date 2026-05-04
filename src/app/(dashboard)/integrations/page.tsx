import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Zap, AlertCircle, CheckCircle2, RefreshCcw } from "lucide-react";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const resolvedParams = await searchParams;

  const dbUser = await db.user.findUnique({
    where: { clerkId: userId },
    include: { integrations: true },
  });

  const instagramIntegration = dbUser?.integrations.find((i) => i.name === "INSTAGRAM");
  const isInstagramConnected = !!instagramIntegration;
  const isTokenExpired = instagramIntegration?.expiresAt ? instagramIntegration.expiresAt < new Date() : false;

  const success = typeof resolvedParams.success === 'string' ? resolvedParams.success : undefined;
  const error = typeof resolvedParams.error === 'string' ? resolvedParams.error : undefined;
  const warning = typeof resolvedParams.warning === 'string' ? resolvedParams.warning : undefined;
  const errorDescription = typeof resolvedParams.description === 'string' ? resolvedParams.description : undefined;

  return (
    <div className="flex flex-col gap-[32px] pb-[64px] max-w-4xl">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center gap-[12px]">
            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Cloud Engine</span>
            <div className="flex items-center gap-[8px] px-[12px] py-[6px] bg-ink-black/5 border border-ink-black/10 rounded-lg">
                <div className="w-[6px] h-[6px] rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-ink-black">Sync Active</span>
            </div>
        </div>
        <h1 className="text-[32px] font-semibold text-ink-black tracking-tight">Integrations</h1>
        <p className="text-[14px] text-slate font-medium max-w-md leading-relaxed">
            Connect your social media accounts to enable autonomous messaging and AI interaction.
        </p>
      </div>

      {/* ─── Status Messages ─── */}
      <div className="flex flex-col gap-[12px]">
        {success && (
          <div className="p-[16px] rounded-xl bg-white border border-ink-black/5 flex items-center gap-[12px] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-[13px] font-medium text-ink-black">Instagram connected successfully!</span>
          </div>
        )}
        {warning && (
          <div className="p-[16px] rounded-xl bg-white border border-ink-black/5 flex items-center gap-[12px] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <AlertCircle size={16} className="text-amber-500" />
            <span className="text-[13px] font-medium text-slate">Connected but Instagram ID could not be auto-detected.</span>
          </div>
        )}
        {error && !success && (
          <div className="p-[16px] rounded-xl bg-white border border-red-500/10 flex flex-col gap-[6px] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-[12px]">
                <AlertCircle size={16} className="text-red-500" />
                <span className="text-[13px] font-medium text-red-500">Failed: {decodeURIComponent(error)}</span>
            </div>
            {errorDescription && (
                <p className="ml-[28px] text-[11px] text-slate/60 leading-relaxed font-medium">{decodeURIComponent(errorDescription)}</p>
            )}
          </div>
        )}
      </div>

      {/* ─── Integration Card ─── */}
      <div className="group relative p-[32px] bg-white border border-ink-black/5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:border-ink-black/10 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)]">
        <div className="absolute -right-16 -top-16 w-64 h-64 spectrum-glow opacity-5 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-[24px]">
          <div className="flex items-center gap-[20px]">
            <div className="w-[64px] h-[64px] rounded-2xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
              <svg className="w-[32px] h-[32px] text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </div>

            <div className="flex flex-col gap-[4px]">
              <h3 className="text-[20px] font-semibold text-ink-black tracking-tight">Instagram</h3>
              <p className="text-[13px] font-medium text-slate leading-relaxed">
                {isInstagramConnected
                  ? isTokenExpired ? "Token expired — please reconnect." : "Connected and actively monitoring."
                  : "Connect your professional account to start."}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-[16px]">
            {isInstagramConnected && (
              <div className="flex items-center gap-[8px] px-[12px] py-[6px] bg-canvas border border-ink-black/5 rounded-lg">
                <div className={`w-[6px] h-[6px] rounded-full ${isTokenExpired ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} />
                <span className="text-[10px] font-medium text-ink-black uppercase tracking-wider">
                  {isTokenExpired ? "Expired" : "Live"}
                </span>
              </div>
            )}

            <a
              href="/api/instagram/auth"
              className="flex items-center gap-[8px] px-[24px] py-[12px] bg-ink-black text-white rounded-xl font-semibold text-[13px] hover:bg-ink-black/90 transition-all transform active:scale-95 shadow-sm whitespace-nowrap"
            >
              <RefreshCcw size={16} />
              {isInstagramConnected ? "Reconnect" : "Connect Instagram"}
            </a>
          </div>
        </div>

        {isInstagramConnected && (
          <div className="mt-[32px] pt-[24px] border-t border-ink-black/5 grid grid-cols-1 sm:grid-cols-2 gap-[24px] relative z-10">
            <div>
              <p className="text-[11px] font-medium text-slate uppercase tracking-wider mb-[4px]">Connected ID</p>
              <p className="text-[15px] text-ink-black font-semibold tracking-tight">{instagramIntegration?.instagramId || "N/A"}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate uppercase tracking-wider mb-[4px]">Sync Status</p>
              <p className="text-[15px] text-ink-black font-semibold tracking-tight">
                {isTokenExpired ? "Action Required" : "Synced recently"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Info ─── */}
      <div className="p-[24px] bg-canvas border border-ink-black/5 rounded-2xl relative overflow-hidden">
        <div className="absolute -left-8 -top-8 w-24 h-24 spectrum-glow opacity-5 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-[12px]">
            <h4 className="text-[14px] font-semibold text-ink-black tracking-tight">Professional Setup Required</h4>
            <p className="text-[13px] font-medium text-slate leading-relaxed max-w-xl">
                You need an Instagram Professional account connected to a Facebook Page. 
                Ensure your redirect URI matches in the Meta App Dashboard.
            </p>
            <code className="w-fit text-[11px] bg-white border border-ink-black/10 px-[12px] py-[6px] shadow-sm rounded-lg font-medium text-ink-black">
                {process.env.NEXT_PUBLIC_HOST_URL}/api/instagram/callback
            </code>
        </div>
      </div>
    </div>
  );
}
