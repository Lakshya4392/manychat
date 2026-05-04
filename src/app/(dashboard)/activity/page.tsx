import { getActivityLogs } from "@/actions/activity";
import { MessageSquare, Hash, Zap, Clock, Bot, ChevronRight, Search, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function ActivityPage() {
  const logs = await getActivityLogs();

  return (
    <div className="flex flex-col gap-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center gap-[12px]">
          <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Audit Logs</span>
          <div className="flex items-center gap-[8px] px-[12px] py-[6px] bg-ink-black/5 border border-ink-black/10 rounded-lg">
            <div className="w-[6px] h-[6px] rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-ink-black">Monitor Active</span>
          </div>
        </div>
        <h1 className="text-[32px] font-semibold text-ink-black tracking-tight">Activity Center</h1>
        <p className="text-[14px] text-slate font-medium max-w-lg leading-relaxed">
          Real-time monitoring of autonomous interactions handled by your AI engines.
        </p>
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="flex flex-col md:flex-row gap-[16px] items-center justify-between p-[24px] bg-white border border-ink-black/5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-[32px] px-[8px]">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Total Events</span>
            <span className="text-[28px] font-semibold text-ink-black tracking-tight leading-none">{logs?.length || 0}</span>
          </div>
          <div className="w-[1px] h-[32px] bg-ink-black/10" />
          <div className="flex flex-col gap-[4px]">
            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Success Rate</span>
            <span className="text-[28px] font-semibold text-ink-black tracking-tight leading-none">99.9%</span>
          </div>
        </div>

        <div className="relative group w-full md:w-[288px]">
          <Search size={16} className="absolute left-[16px] top-1/2 -translate-y-1/2 text-slate group-focus-within:text-ink-black transition-colors" />
          <input
            type="text" placeholder="Search interactions..."
            className="w-full bg-canvas border border-ink-black/5 rounded-xl py-[12px] pl-[40px] pr-[16px] text-[14px] text-ink-black placeholder:text-slate/50 focus:outline-none focus:border-ink-black/20 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,0,0,0.02)] transition-all"
          />
        </div>
      </div>

      {/* ─── Timeline ─── */}
      <div className="flex flex-col gap-[16px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <Filter size={14} className="text-slate" />
            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Interaction Stream</span>
          </div>
          <span className="text-[11px] font-medium text-slate uppercase tracking-wider">{logs?.length || 0} Events Logged</span>
        </div>

        {logs && logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log.id}
              className="group flex flex-col md:flex-row gap-[24px] p-[24px] bg-white border border-ink-black/5 hover:border-ink-black/10 rounded-2xl transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-ink-black opacity-0 group-hover:opacity-10 transition-opacity rounded-l-2xl" />

              {/* Icon & Meta */}
              <div className="flex items-center md:flex-col gap-[16px] min-w-[120px] md:border-r border-ink-black/5 pr-[24px]">
                <div className="w-[40px] h-[40px] rounded-xl bg-canvas border border-ink-black/5 flex items-center justify-center text-slate group-hover:scale-105 transition-all duration-300 shrink-0">
                  {log.messageType === 'COMMENT' ? <Hash size={18} /> : <MessageSquare size={18} />}
                </div>
                <div className="flex flex-col md:items-center gap-[4px]">
                  <span className="text-[10px] font-medium text-slate uppercase tracking-wider">{log.messageType}</span>
                  <div className="px-[10px] py-[4px] bg-ink-black/5 border border-ink-black/5 rounded-full">
                    <span className="text-[9px] font-medium text-ink-black uppercase tracking-wider">Verified</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow flex flex-col gap-[20px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px]">
                  <div className="flex items-center gap-[16px]">
                    <Avatar className="w-[40px] h-[40px] rounded-xl border border-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <AvatarFallback className="bg-ink-black text-white font-semibold uppercase text-[12px]">{log.senderUsername?.[0] || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-[2px]">
                      <p className="text-[15px] font-semibold text-ink-black tracking-tight">@{log.senderUsername || 'Anonymous'}</p>
                      <div className="flex items-center gap-[6px] text-[11px] text-slate font-medium uppercase tracking-wider">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(log.createdAt))} ago
                      </div>
                    </div>
                  </div>

                  <div className="px-[12px] py-[6px] rounded-lg bg-white border border-ink-black/5 shadow-sm flex items-center gap-[8px]">
                    <Zap size={14} className="text-ink-black" />
                    <span className="text-[11px] font-medium text-slate uppercase tracking-wider">
                      Engine: <span className="text-ink-black font-semibold">{log.automationName}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  <div className="bg-canvas p-[24px] rounded-2xl border border-ink-black/5 flex flex-col gap-[8px]">
                    <div className="flex items-center gap-[8px] opacity-60">
                      <Hash size={14} className="text-slate" />
                      <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Inbound Signal</span>
                    </div>
                    <p className="text-[14px] text-ink-black font-medium leading-relaxed italic">"{log.message}"</p>
                  </div>

                  <div className="bg-white p-[24px] rounded-2xl border border-ink-black/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ring-1 ring-ink-black/5 flex flex-col gap-[8px] relative overflow-hidden">
                    <div className="flex items-center gap-[8px]">
                      <Bot size={14} className="text-ink-black" />
                      <span className="text-[11px] font-medium text-ink-black uppercase tracking-wider">Autonomous Response</span>
                    </div>
                    <p className="text-[14px] text-ink-black font-semibold leading-relaxed">{log.automationResponse}</p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-center pl-[24px] border-l border-ink-black/5 md:border-l-0">
                <button className="w-[36px] h-[36px] rounded-xl bg-white shadow-sm border border-ink-black/5 flex items-center justify-center text-slate hover:border-ink-black/10 hover:text-ink-black transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-[96px] bg-white border border-dashed border-ink-black/10 rounded-2xl relative overflow-hidden">
            <div className="w-[64px] h-[64px] rounded-2xl bg-canvas border border-ink-black/5 flex items-center justify-center mb-[24px]">
              <Zap size={24} className="text-slate opacity-40" />
            </div>
            <div className="flex flex-col gap-[8px] text-center">
              <h3 className="text-[18px] font-semibold text-ink-black tracking-tight">The event stream is silent</h3>
              <p className="text-slate font-medium text-[14px] max-w-sm mx-auto leading-relaxed">Activate your autonomous flows to begin monitoring the engine activity trail.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
