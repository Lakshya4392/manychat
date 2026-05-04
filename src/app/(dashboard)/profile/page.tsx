import React from "react";
import { User, Shield, Zap, TrendingUp, CreditCard, Sparkles, ShieldCheck } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import BrandContextForm from "@/components/profile/BrandContextForm";

export default async function ProfilePage() {
  const { userId } = await auth();

  // Get user with subscription from DB
  const dbUser = await db.user.findUnique({
    where: { clerkId: userId || "" },
    include: {
      subscription: true,
      _count: {
        select: {
          automations: true,
          integrations: true,
        },
      },
    },
  });

  const plan = dbUser?.subscription?.plan || "FREE";
  const automationsCount = dbUser?._count?.automations || 0;
  const integrationsCount = dbUser?._count?.integrations || 0;
  const brandContext = dbUser?.brandContext || "";

  // Safe date formatting
  const joinedDate = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  const stats = [
    { label: "Active Automations", value: automationsCount.toString(), icon: Zap },
    { label: "Engine Strength", value: "88%", icon: TrendingUp },
    { label: "Connected Nodes", value: integrationsCount.toString(), icon: Shield },
  ];

  return (
    <div className="flex flex-col gap-[32px] pb-[64px]">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center gap-[12px]">
            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Identity Core</span>
            <div className="flex items-center gap-[8px] px-[12px] py-[6px] bg-ink-black/5 border border-ink-black/10 rounded-lg">
                <ShieldCheck size={14} className="text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] rounded-full bg-emerald-500/10" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-ink-black">Verified Profile</span>
            </div>
        </div>
        <h1 className="text-[32px] font-semibold text-ink-black tracking-tight">Profile Management</h1>
        <p className="text-[14px] text-slate font-medium max-w-md leading-relaxed">
            Manage your credentials, subscription status, and brand identity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        {/* Left */}
        <div className="lg:col-span-2 flex flex-col gap-[24px]">
          <div className="bg-white border border-ink-black/5 rounded-2xl p-[32px] flex flex-col md:flex-row gap-[24px] items-center md:items-start relative overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
            <div className="absolute top-0 right-0 w-64 h-64 spectrum-glow opacity-5 pointer-events-none" />

            <div className="w-[96px] h-[96px] rounded-2xl border border-ink-black/5 overflow-hidden shadow-sm shrink-0 bg-canvas">
              <img
                src={dbUser?.imageUrl || "https://github.com/shadcn.png"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-[12px] flex-grow text-center md:text-left">
              <div className="flex flex-col gap-[4px]">
                <h2 className="text-[24px] font-semibold text-ink-black tracking-tight">
                  {dbUser?.name || "User Name"}
                </h2>
                <p className="text-[14px] text-slate font-medium">
                  {dbUser?.email || "user@example.com"}
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-[8px] mt-[4px]">
                <div className={`px-[12px] py-[6px] rounded-lg font-medium text-[10px] uppercase tracking-wider ${plan === "PRO"
                       ? "bg-ink-black text-white"
                       : "bg-canvas border border-ink-black/5 text-slate"
                    }`}>
                  {plan === "PRO" ? "Intelligence Tier" : "Lite Tier"}
                </div>
                <div className="px-[12px] py-[6px] bg-canvas border border-ink-black/5 rounded-lg text-slate font-medium text-[10px] uppercase tracking-wider">
                  Joined {joinedDate}
                </div>
              </div>
            </div>

            <button className="md:ml-auto px-[24px] py-[12px] bg-canvas hover:bg-ink-black hover:text-white border border-ink-black/5 text-slate rounded-xl text-[13px] font-semibold shadow-sm transition-all transform active:scale-95 shrink-0">
              Edit Metadata
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white border border-ink-black/5 rounded-2xl p-[24px] flex flex-col gap-[16px] group hover:shadow-sm hover:border-ink-black/10 transition-all">
                <div className="w-[48px] h-[48px] bg-canvas rounded-2xl flex items-center justify-center border border-ink-black/5 group-hover:scale-105 transition-all">
                  <stat.icon size={24} className="text-slate group-hover:text-ink-black transition-colors" />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[28px] font-semibold text-ink-black tracking-tight leading-none">{stat.value}</span>
                  <span className="text-[11px] text-slate font-medium uppercase tracking-wider">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Brand Context */}
          <div className="bg-white border border-ink-black/5 rounded-2xl p-[32px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden">
             <div className="absolute -right-8 -top-8 w-32 h-32 spectrum-glow opacity-5 pointer-events-none" />
             <BrandContextForm initialValue={brandContext} />
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-[24px]">
          <div className="bg-white border border-ink-black/5 rounded-2xl p-[32px] flex flex-col gap-[24px] relative overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
            <div className="absolute top-0 right-0 w-24 h-24 spectrum-glow opacity-5 pointer-events-none" />

            <div className="flex items-center gap-[12px]">
              <div className="w-[48px] h-[48px] bg-canvas rounded-2xl flex items-center justify-center border border-ink-black/5">
                <CreditCard size={24} className="text-slate" />
              </div>
              <h3 className="text-[20px] font-semibold text-ink-black tracking-tight">Infrastructure</h3>
            </div>

            <div className="flex flex-col gap-[16px]">
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-slate font-medium">Core Plan</span>
                <span className="font-semibold text-ink-black uppercase tracking-wider text-[11px]">
                  {plan === "PRO" ? "Intelligence" : "Lite"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-slate font-medium">Cycle Status</span>
                <span className="text-ink-black font-semibold uppercase tracking-wider text-[11px]">
                  {plan === "PRO" ? "Active Sync" : "Restricted"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-slate font-medium">Flow Capacity</span>
                <span className="text-ink-black font-semibold uppercase tracking-wider text-[11px]">
                  {automationsCount} / {plan === "PRO" ? "∞" : "3"}
                </span>
              </div>
            </div>

            {plan !== "PRO" ? (
              <button className="w-full py-[12px] bg-ink-black text-white rounded-xl text-[13px] font-semibold transition-all shadow-sm transform active:scale-95 mt-[8px] hover:bg-ink-black/90">
                Unlock Intelligence
              </button>
            ) : (
              <button className="w-full py-[12px] bg-white hover:bg-ink-black hover:text-white text-slate rounded-xl text-[13px] font-semibold transition-all border border-ink-black/5 shadow-sm mt-[8px]">
                Manage Billing
              </button>
            )}
          </div>

          <div className="bg-canvas border border-ink-black/5 border-dashed rounded-2xl p-[32px] flex flex-col items-center justify-center text-center gap-[16px] group">
            <div className="w-[48px] h-[48px] bg-white rounded-2xl flex items-center justify-center border border-ink-black/5 shadow-sm group-hover:scale-105 transition-all">
                <ShieldCheck size={24} className="text-slate/40 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-[13px] text-slate font-medium leading-relaxed max-w-[200px]">
              Engine security is autonomously monitored and protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
