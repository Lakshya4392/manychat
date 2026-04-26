import DashboardCard from "@/components/ui/DashboardCard";
import { LayoutDashboard, TrendingUp, Circle } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <div className="flex flex-col gap-1 mb-10">
        <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{getGreeting()}</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <Circle className="w-1.5 h-1.5 fill-green-500 text-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Live</span>
            </div>
        </div>
        <h1 className="text-3xl font-bold text-white font-heading tracking-tight">
          Welcome back, {user?.firstName || "User"}!
        </h1>
        <p className="text-sm text-zinc-500 max-w-lg">
            Here&apos;s a quick overview of your automations and engagement for the last 30 days.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Home</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard 
            title="Set-up Auto Replies"
            description="Deliver a product lineup through Instagram DM"
            footerText="Get products in front of your followers in as many places"
          />
          <DashboardCard 
            title="Answer Questions with AI"
            description="Identify and respond to queries with AI"
            footerText="The intention of the message will be automatically detected"
          />
          <DashboardCard 
            title="Answer Questions with AI"
            description="Identify and respond to queries with AI"
            footerText="The intention of the message will be automatically detected"
          />
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        <div className="lg:col-span-2 card-glow p-8 flex flex-col border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Automated Activity</h2>
                <p className="text-xs text-zinc-500">Automated 0 out of 1 interactions</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
              <span className="hover:text-white cursor-pointer transition-colors">Yesterday</span>
              <div className="px-3 py-1 bg-white/5 rounded-lg text-white">Last 30 Days</div>
            </div>
          </div>

          <div className="relative h-64 w-full mt-auto">
            <div className="absolute inset-0 wavy-chart opacity-30" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card-glow p-8 flex-grow border border-white/5">
            <h3 className="text-lg font-bold text-white mb-1">Comments</h3>
            <p className="text-xs text-zinc-500 mb-8">On your posts</p>
            
            <div className="mt-auto">
              <span className="text-5xl font-bold text-white tracking-tighter">50%</span>
              <p className="text-xs text-zinc-500 mt-2">3 out of 6 comments replied</p>
            </div>
          </div>
          
          <div className="card-glow p-8 flex-grow border border-white/5">
            <h3 className="text-lg font-bold text-white mb-1">Direct Message</h3>
            <p className="text-xs text-zinc-500 mb-8">On your account</p>
            
            <div className="mt-auto">
              <span className="text-5xl font-bold text-white tracking-tighter">50%</span>
              <p className="text-xs text-zinc-500 mt-2">3 out of 6 DMs replied</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
