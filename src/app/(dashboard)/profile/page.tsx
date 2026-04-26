import React from "react";
import { User, Shield, Zap, TrendingUp, CreditCard } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";

export default async function ProfilePage() {
  const user = await currentUser();

  // Get user with subscription from DB
  const dbUser = await db.user.findUnique({
    where: { clerkId: user?.id || "" },
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

  // Calculate totals
  const totalDMs = 0; // Placeholder - query from Usage/DMs

  // Safe date formatting
  const joinedDate = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  const stats = [
    { label: "Automations Created", value: automationsCount.toString(), icon: Zap, color: "text-primary" },
    { label: "Total DMs Sent", value: totalDMs.toString(), icon: TrendingUp, color: "text-green-500" },
    { label: "Active Integrations", value: integrationsCount.toString(), icon: Shield, color: "text-indigo-500" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
          <User className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Details */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-[#121215] border border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl" />

            <div className="w-32 h-32 rounded-3xl border-4 border-white/10 overflow-hidden shadow-2xl">
              <img
                src={user?.imageUrl || "https://github.com/shadcn.png"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-4 flex-grow text-center md:text-left">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {user?.fullName || "User Name"}
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                <Badge
                  variant="outline"
                  className={`rounded-xl px-4 py-1.5 border-none font-bold text-[10px] uppercase tracking-widest leading-none ${
                    plan === "PRO"
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20"
                      : "bg-white/5 text-zinc-400 border-white/5"
                  }`}
                >
                  {plan === "PRO" ? "Pro Plan" : "Free Plan"}
                </Badge>
                 <Badge
                   variant="outline"
                   className="rounded-xl px-4 py-1.5 bg-white/5 border-white/5 text-zinc-400 font-bold text-[10px] uppercase tracking-widest leading-none"
                 >
                   Joined {joinedDate}
                 </Badge>
              </div>
            </div>

            <button className="md:ml-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-2xl text-xs font-bold transition-all transform active:scale-95">
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#121215] border border-white/5 rounded-[2rem] p-8 flex flex-col gap-4 group hover:border-white/10 transition-all"
              >
                <div className="p-3 bg-white/5 rounded-2xl w-fit group-hover:bg-primary/5 transition-all">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Billing/Subscription info */}
        <div className="flex flex-col gap-8">
          <div className="bg-[#121215] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-50" />

            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <CreditCard className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Subscription</h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Current Plan</span>
                <span
                  className={`font-bold ${
                    plan === "PRO" ? "text-primary" : "text-white"
                  }`}
                >
                  {plan === "PRO" ? "Pro" : "Free"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Billing Cycle</span>
                <span className="text-white font-bold">
                  {plan === "PRO" ? "Monthly" : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Automations</span>
                <span className="text-white font-bold">
                  {automationsCount} / {plan === "PRO" ? "∞" : "3"}
                </span>
              </div>
            </div>

            {plan !== "PRO" && (
              <button className="w-full py-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-[1.5rem] text-sm font-black transition-all shadow-xl shadow-primary/20 transform active:scale-95 mt-2">
                Upgrade to Pro
              </button>
            )}

            {plan === "PRO" && (
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] text-sm font-bold transition-all border border-white/5 mt-2">
                Manage Subscription
              </button>
            )}
          </div>

          <div className="bg-[#121215]/50 border border-white/5 border-dashed rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center gap-3">
            <Shield className="w-6 h-6 text-zinc-700" />
            <p className="text-xs text-zinc-600 font-bold leading-relaxed">
              Account security is monitored and protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
