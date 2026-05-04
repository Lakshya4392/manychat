"use client";

import React from "react";
import {
  Zap, MessageSquare, Hash, Sparkles, ChevronRight, Bot, Clock, LayoutGrid, Filter, BarChart3,
} from "lucide-react";
import { getAutomations } from "@/actions/automations";
import AutomationToggle from "@/components/automations/AutomationToggle";
import CreateAutomationButton from "@/components/automations/CreateAutomationButton";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Automation = {
  id: string;
  name: string;
  createdAt: string;
  active: boolean;
  keywords: { id: string; word: string }[];
  listener: { id: string; listener: "SMARTAI" | "MESSAGE"; dmCount: number; commentCount: number; } | null;
  trigger: { id: string; type: string }[];
};

const TRIGGER_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string, bg: string }> = {
  MESSAGE: { icon: MessageSquare, color: "text-ink-black", bg: "bg-ink-black/5" },
  COMMENT: { icon: Hash, color: "text-ink-black", bg: "bg-ink-black/5" },
  STORY_MENTION: { icon: Zap, color: "text-ink-black", bg: "bg-ink-black/5" },
  NEW_FOLLOWER: { icon: Bot, color: "text-ink-black", bg: "bg-ink-black/5" },
};

export default function AutomationsPage() {
  const router = useRouter();
  const [automations, setAutomations] = React.useState<Automation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      const result = await getAutomations();
      setAutomations((result.data || []) as unknown as Automation[]);
      setLoading(false);
    };
    load();
  }, []);

  const activeCount = automations.filter((a) => a.active).length;
  const totalResponses = automations.reduce(
    (sum, a) => sum + (a.listener?.dmCount || 0) + (a.listener?.commentCount || 0), 0
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="h-[64px] w-[192px] bg-white border border-ink-black/5 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
            {[1,2,3].map(i => <div key={i} className="h-[112px] bg-white border border-ink-black/5 rounded-2xl animate-pulse" />)}
        </div>
        <div className="flex flex-col gap-[16px]">
             {[1,2,3].map(i => <div key={i} className="h-[96px] bg-white border border-ink-black/5 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[16px]">
        <div className="flex flex-col gap-[12px]">
          <div className="flex items-center gap-[12px]">
            <span className="text-[12px] font-semibold text-slate uppercase tracking-widest">Flow Manager</span>
            <div className="flex items-center gap-[6px] px-[12px] py-[4px] bg-ink-black text-white rounded-full">
              <span className="text-[10px] font-semibold uppercase tracking-tight">System Active</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-ink-black tracking-tight">Automations</h1>
          <p className="text-[14px] text-slate font-medium max-w-lg leading-relaxed">
            Manage your automated workflows and AI interaction logic.
          </p>
        </div>
        <CreateAutomationButton />
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        <div className="p-[24px] bg-white border border-ink-black/5 rounded-2xl flex items-center gap-[20px] group hover:border-ink-black/10 hover:shadow-sm transition-all">
          <div className="w-[48px] h-[48px] rounded-2xl bg-canvas border border-ink-black/5 flex items-center justify-center shrink-0">
            <LayoutGrid size={24} className="text-slate" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Total Flows</span>
            <span className="text-[28px] font-semibold text-ink-black tracking-tight leading-none">{automations.length}</span>
          </div>
        </div>

        <div className="p-[24px] bg-white border border-ink-black/5 rounded-2xl flex items-center gap-[20px] group hover:border-ink-black/10 hover:shadow-sm transition-all relative overflow-hidden">
          <div className="w-[48px] h-[48px] rounded-2xl bg-ink-black flex items-center justify-center relative z-10 shrink-0 shadow-sm">
            <Zap size={24} className="text-white" />
          </div>
          <div className="flex flex-col gap-[4px] relative z-10">
            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Active Engine</span>
            <span className="text-[28px] font-semibold text-ink-black tracking-tight leading-none">{activeCount}</span>
          </div>
        </div>

        <div className="p-[24px] bg-white border border-ink-black/5 rounded-2xl flex items-center gap-[20px] group hover:border-ink-black/10 hover:shadow-sm transition-all">
          <div className="w-[48px] h-[48px] rounded-2xl bg-canvas border border-ink-black/5 flex items-center justify-center shrink-0">
            <BarChart3 size={24} className="text-slate" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Total Impact</span>
            <span className="text-[28px] font-semibold text-ink-black tracking-tight leading-none">{totalResponses}</span>
          </div>
        </div>
      </div>

      {/* ─── List ─── */}
      <div className="flex flex-col gap-[16px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <Filter size={16} className="text-slate" />
            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Sorted by Activity</span>
          </div>
          <span className="text-[11px] font-medium text-slate uppercase tracking-wider">{automations.length} total</span>
        </div>

        {automations.length === 0 ? (
          <div className="bg-white border border-dashed border-ink-black/10 rounded-2xl p-[64px] flex flex-col items-center justify-center text-center gap-[24px]">
            <div className="w-[64px] h-[64px] bg-canvas rounded-2xl flex items-center justify-center border border-ink-black/5 shadow-sm">
              <Bot size={24} className="text-slate opacity-40" />
            </div>
            <div className="flex flex-col gap-[8px]">
              <h3 className="text-[18px] font-semibold text-ink-black tracking-tight">No autonomous flows detected</h3>
              <p className="text-slate font-medium text-[14px] max-w-sm mx-auto leading-relaxed">
                Initiate your first automated workflow to begin nurturing leads.
              </p>
            </div>
            <CreateAutomationButton />
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {automations.map((automation) => (
              <div
                key={automation.id}
                onClick={() => router.push(`/automations/${automation.id}`)}
                className="group relative flex flex-col md:flex-row items-center justify-between p-[24px] bg-white border border-ink-black/5 hover:border-ink-black/10 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
              >
                <div className="absolute -left-20 -top-20 w-64 h-64 spectrum-glow opacity-0 group-hover:opacity-5 transition-all duration-700 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-[20px] flex-grow relative z-10 w-full">
                  {/* Status Indicator */}
                  <div className="shrink-0">
                    <div className={`w-[40px] h-[40px] rounded-xl border ${automation.active ? 'border-ink-black/10 bg-canvas shadow-sm' : 'border-ink-black/5 bg-white'} flex items-center justify-center transition-all`}>
                      {automation.active ? <Zap size={18} className="text-ink-black animate-pulse" /> : <Bot size={18} className="text-slate/40" />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-[8px] w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-[12px]">
                      <h3 className="text-[15px] font-semibold text-ink-black tracking-tight group-hover:translate-x-0.5 transition-transform duration-300">
                        {automation.name || "Untitled Flow"}
                      </h3>
                      {automation.listener?.listener === "SMARTAI" && (
                        <div className="px-[8px] py-[4px] rounded-md bg-ink-black/5 border border-ink-black/10 flex items-center gap-[6px]">
                          <Sparkles size={12} className="text-ink-black" />
                          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-black">AI Engine</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-[16px]">
                      <div className="flex items-center -space-x-[8px]">
                        {automation.trigger.map((t, idx) => {
                          const Icon = TRIGGER_ICONS[t.type]?.icon || Zap;
                          return (
                            <div key={t.id} className="w-[32px] h-[32px] rounded-full bg-canvas border border-ink-black/5 flex items-center justify-center shadow-sm" style={{ zIndex: 10 - idx }}>
                              <Icon size={14} className="text-slate" />
                            </div>
                          );
                        })}
                      </div>

                      <div className="w-[1px] h-[16px] bg-ink-black/10 hidden md:block" />

                      <div className="flex items-center gap-[8px]">
                        {automation.keywords.slice(0, 3).map((kw) => (
                          <div key={kw.id} className="px-[10px] py-[4px] rounded-md bg-white border border-ink-black/5 shadow-sm text-[11px] font-medium text-ink-black">
                            #{kw.word}
                          </div>
                        ))}
                        {automation.keywords.length > 3 && (
                          <span className="text-[11px] font-medium text-slate">+{automation.keywords.length - 3}</span>
                        )}
                      </div>

                      <div className="w-[1px] h-[16px] bg-ink-black/10 hidden md:block" />

                      <div className="flex items-center gap-[8px] text-slate text-[11px] font-medium uppercase tracking-wider">
                        <Clock size={14} />
                        {format(new Date(automation.createdAt), "MMM dd")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="flex items-center gap-[20px] mt-[20px] md:mt-0 relative z-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 md:border-l border-ink-black/5 pt-[20px] md:pt-0 md:pl-[24px]" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col items-center md:items-end gap-[4px]">
                    <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Impact</span>
                    <span className="text-[20px] font-semibold text-ink-black tracking-tight leading-none">{automation.listener?.dmCount || 0}</span>
                  </div>

                  <div className="flex items-center gap-[16px]">
                    <AutomationToggle id={automation.id} active={automation.active} />
                    <div className="w-[36px] h-[36px] rounded-xl bg-white border border-ink-black/5 shadow-sm flex items-center justify-center text-slate group-hover:border-ink-black/10 group-hover:text-ink-black transition-all duration-300">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── CTA ─── */}
      <div className="p-[32px] bg-ink-black text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-[24px] relative overflow-hidden group shadow-md mt-[16px]">
        <div className="absolute right-0 top-0 w-[384px] h-[384px] spectrum-glow opacity-20 pointer-events-none -mr-[128px] -mt-[128px] group-hover:scale-110 transition-transform duration-[2s]" />
        <div className="flex-grow z-10 relative text-center md:text-left">
          <h2 className="text-[20px] font-semibold text-white tracking-tight mb-[8px]">Scale your autonomous architecture.</h2>
          <p className="text-[14px] text-white/70 max-w-lg leading-relaxed">Upgrade to Pro for advanced sentiment processing, infinite flow depth, and high-velocity cycles.</p>
        </div>
        <button className="px-[24px] py-[12px] bg-white text-ink-black rounded-xl font-semibold text-[13px] hover:bg-white/90 transition-all z-10 transform active:scale-95 shrink-0 shadow-sm">
          Unlock Enterprise Tier
        </button>
      </div>
    </div>
  );
}
