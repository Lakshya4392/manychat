import DashboardCard from "@/components/ui/DashboardCard";
import { TrendingUp, Sparkles, ArrowUpRight, Hash, MessageSquare, Users, Zap, LayoutGrid } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { getDashboardStats, getChartData } from "@/actions/analytics";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";

export default async function DashboardPage() {
  const user = await currentUser();
  const stats = await getDashboardStats();
  const chartData = await getChartData();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const dashboardCards = [
    { title: "Auto-Reply Engine", description: "Deliver product lineups and automated responses via Instagram DM" },
    { title: "Intelligence Hub", description: "Identify and respond to queries with autonomous AI agents" },
    { title: "Growth Funnels", description: "Engage with your audience 24/7 and convert comments to leads" }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{getGreeting()}</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black text-white rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-tight">System Live</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-black tracking-tight">
          Welcome back, {user?.firstName || "Operator"}
        </h1>
        <p className="text-[13px] text-gray-500 max-w-lg leading-relaxed">
          Monitor your autonomous engagement metrics and flow performance.
        </p>
      </div>

      {/* ─── Metrics Row ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        <div className="p-[24px] bg-white border border-black/[0.08] rounded-xl flex items-center gap-[16px] hover:shadow-sm transition-all">
          <div className="w-[48px] h-[48px] rounded-lg bg-gray-50 border border-black/[0.06] flex items-center justify-center shrink-0">
            <Users size={24} className="text-gray-500" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Captured</span>
            <span className="text-2xl font-bold text-black tracking-tight">{stats?.comments || 0}</span>
          </div>
        </div>

        <div className="p-[24px] bg-white border border-black/[0.08] rounded-xl flex items-center gap-[16px] hover:shadow-sm transition-all">
          <div className="w-[48px] h-[48px] rounded-lg bg-black flex items-center justify-center shrink-0">
            <Zap size={24} className="text-white" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Success Rate</span>
            <span className="text-2xl font-bold text-black tracking-tight">{stats?.responseRate || 0}%</span>
          </div>
        </div>

        <div className="p-[24px] bg-white border border-black/[0.08] rounded-xl flex items-center gap-[16px] hover:shadow-sm transition-all">
          <div className="w-[48px] h-[48px] rounded-lg bg-gray-50 border border-black/[0.06] flex items-center justify-center shrink-0">
            <LayoutGrid size={24} className="text-gray-500" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">DMs Sent</span>
            <span className="text-2xl font-bold text-black tracking-tight">{stats?.dms || 0}</span>
          </div>
        </div>
      </div>

      {/* ─── Chart + Side Stats ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px]">
        <div className="lg:col-span-2 relative p-[32px] flex flex-col bg-white border border-black/[0.08] rounded-xl overflow-hidden">
          <div className="flex items-center gap-[12px] mb-[24px]">
            <div className="p-[10px] bg-gray-50 rounded-lg border border-black/[0.06]">
              <TrendingUp size={16} className="text-black" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-black tracking-tight">Autonomous Activity</h2>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                {stats?.totalInteractions || 0} Total Interactions
              </p>
            </div>
          </div>

          <div className="relative h-64 w-full">
            {chartData && chartData.length > 0 && chartData.some(d => d.count > 0) ? (
              <AnalyticsChart data={chartData} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Sparkles className="w-6 h-6 text-gray-200 mb-3" />
                <p className="text-[11px] text-gray-300 uppercase tracking-widest font-semibold">Waiting for engine activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Metrics */}
        <div className="flex flex-col gap-[16px]">
          <div className="p-[24px] flex-1 bg-white border border-black/[0.08] rounded-xl flex flex-col justify-between hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-[12px]">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Comments</h3>
              <div className="w-[40px] h-[40px] bg-gray-50 rounded-lg flex items-center justify-center border border-black/[0.06]">
                <Hash size={16} className="text-gray-400" />
              </div>
            </div>
            <div>
              <span className="text-4xl font-bold text-black tracking-tight">{stats?.comments || 0}</span>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Captured</p>
              </div>
            </div>
          </div>

          <div className="p-[24px] flex-1 bg-white border border-black/[0.08] rounded-xl flex flex-col justify-between hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-[12px]">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">DMs</h3>
              <div className="w-[40px] h-[40px] bg-gray-50 rounded-lg flex items-center justify-center border border-black/[0.06]">
                <MessageSquare size={16} className="text-gray-400" />
              </div>
            </div>
            <div>
              <span className="text-4xl font-bold text-black tracking-tight">{stats?.dms || 0}</span>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Responses Sent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Active Funnels ─── */}
      <div className="flex flex-col gap-[12px]">
        <h2 className="text-[14px] font-bold text-black tracking-tight">Active Funnels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
          {dashboardCards.map((card, index) => (
            <DashboardCard key={index} title={card.title} description={card.description} />
          ))}
        </div>
      </div>

      {/* ─── AI Tip ─── */}
      <div className="p-[32px] bg-black text-white rounded-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-[20px]">
          <div className="flex items-center gap-[16px]">
            <div className="w-[40px] h-[40px] bg-white/10 rounded-lg flex items-center justify-center border border-white/10 shrink-0">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-white tracking-tight mb-0.5">AI Optimization Recommended</h3>
              <p className="text-[12px] text-white/50 max-w-lg leading-relaxed">Flow #2 engagement is dropping. Add a semantic follow-up node to boost retention by 24%.</p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-white text-black rounded-lg font-semibold text-[13px] transition-all active:scale-95 flex items-center gap-2 shrink-0 hover:bg-gray-100">
            Apply Insight
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
