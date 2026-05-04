import React from "react";
import { Search, Filter, ArrowUpRight, ChevronRight, Users, Zap, TrendingUp, Clock, Sparkles, Bot, User, Hash, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getContacts } from "@/actions/analytics";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center gap-[12px]">
          <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Audience Intelligence</span>
          <div className="flex items-center gap-[8px] px-[12px] py-[6px] bg-ink-black/5 border border-ink-black/10 rounded-lg">
            <div className="w-[6px] h-[6px] rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-ink-black">Real-time Sync</span>
          </div>
        </div>
        <h1 className="text-[32px] font-semibold text-ink-black tracking-tight">Contacts</h1>
        <p className="text-[14px] text-slate font-medium max-w-lg leading-relaxed">
          Manage your leads and monitor their autonomous interaction history.
        </p>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        <div className="p-[24px] bg-white border border-ink-black/5 rounded-2xl flex items-center gap-[20px] group hover:border-ink-black/10 hover:shadow-sm transition-all">
          <div className="w-[48px] h-[48px] rounded-2xl bg-canvas border border-ink-black/5 flex items-center justify-center shrink-0">
            <Users size={24} className="text-slate" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Total Audience</span>
            <span className="text-[28px] font-semibold text-ink-black tracking-tight leading-none">{contacts.length || 12842}</span>
          </div>
        </div>

        <div className="p-[24px] bg-white border border-ink-black/5 rounded-2xl flex items-center gap-[20px] group hover:border-ink-black/10 hover:shadow-sm transition-all relative overflow-hidden">
          <div className="w-[48px] h-[48px] rounded-2xl bg-ink-black flex items-center justify-center relative z-10 shrink-0 shadow-sm">
            <Zap size={24} className="text-white" />
          </div>
          <div className="flex flex-col gap-[4px] relative z-10">
            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Active Leads</span>
            <span className="text-[28px] font-semibold text-ink-black tracking-tight leading-none">4,291</span>
          </div>
        </div>

        <div className="p-[24px] bg-white border border-ink-black/5 rounded-2xl flex items-center gap-[20px] group hover:border-ink-black/10 hover:shadow-sm transition-all">
          <div className="w-[48px] h-[48px] rounded-2xl bg-canvas border border-ink-black/5 flex items-center justify-center shrink-0">
            <TrendingUp size={24} className="text-slate" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Growth Rate</span>
            <span className="text-[28px] font-semibold text-ink-black tracking-tight leading-none">+24.8%</span>
          </div>
        </div>
      </div>

      {/* ─── CRM Table ─── */}
      <div className="bg-white border border-ink-black/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative">
        <div className="px-[24px] py-[16px] border-b border-ink-black/5 flex items-center justify-between bg-white relative z-10">
          <div className="flex items-center gap-[12px]">
            <div className="relative group w-[288px]">
              <Search size={16} className="absolute left-[16px] top-1/2 -translate-y-1/2 text-slate group-focus-within:text-ink-black transition-colors" />
              <input
                type="text" placeholder="Search audience..."
                className="w-full bg-canvas border border-ink-black/5 rounded-xl py-[10px] pl-[40px] pr-[16px] text-[14px] text-ink-black placeholder:text-slate/50 focus:outline-none focus:border-ink-black/20 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,0,0,0.02)] transition-all"
              />
            </div>
            <button className="px-[16px] py-[10px] rounded-xl bg-white border border-ink-black/5 shadow-sm text-slate hover:text-ink-black hover:border-ink-black/10 transition-all flex items-center gap-[8px] text-[13px] font-medium">
              <Filter size={14} />
              Segment
            </button>
          </div>
          <button className="w-[40px] h-[40px] rounded-xl bg-white border border-ink-black/5 shadow-sm flex items-center justify-center text-slate hover:border-ink-black/10 hover:text-ink-black transition-all">
            <ArrowUpRight size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas/50">
                <th className="px-[24px] py-[16px] text-[11px] font-medium text-slate uppercase tracking-wider">Subscriber</th>
                <th className="px-[24px] py-[16px] text-[11px] font-medium text-slate uppercase tracking-wider">Sentiment</th>
                <th className="px-[24px] py-[16px] text-[11px] font-medium text-slate uppercase tracking-wider">Last Contact</th>
                <th className="px-[24px] py-[16px] text-[11px] font-medium text-slate uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-black/5">
              {contacts.length > 0 ? contacts.map((contact) => (
                <tr key={contact.id} className="group hover:bg-canvas/50 transition-colors cursor-pointer">
                  <td className="px-[24px] py-[20px]">
                    <div className="flex items-center gap-[16px]">
                      <Avatar className="w-[40px] h-[40px] rounded-xl border border-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <AvatarFallback className="bg-ink-black text-white font-semibold text-[12px] uppercase">{contact.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-[2px]">
                        <p className="text-[15px] font-semibold text-ink-black tracking-tight">@{contact.name}</p>
                        <p className="text-[11px] text-slate font-medium uppercase tracking-wider">Direct Messenger</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-[24px] py-[20px]">
                    <div className="flex items-center gap-[8px]">
                      <div className="px-[10px] py-[4px] rounded-lg bg-white border border-ink-black/5 shadow-sm flex items-center gap-[8px]">
                        <div className={`w-[6px] h-[6px] rounded-full ${contact.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate/30'}`} />
                        <span className="text-[10px] font-medium text-ink-black uppercase tracking-wider">{contact.status === 'ACTIVE' ? 'High Intent' : 'Monitoring'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-[24px] py-[20px]">
                    <div className="flex items-center gap-[6px] text-slate text-[11px] font-medium uppercase tracking-wider">
                      <Clock size={14} />
                      {contact.lastContacted || '2h ago'}
                    </div>
                  </td>
                  <td className="px-[24px] py-[20px] text-right">
                    <button className="w-[36px] h-[36px] rounded-xl bg-white border border-ink-black/5 shadow-sm flex items-center justify-center text-slate hover:border-ink-black/10 hover:text-ink-black transition-all ml-auto">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="opacity-40">
                    <td className="px-[24px] py-[20px] text-slate font-medium text-[13px]">Awaiting Data...</td>
                    <td className="px-[24px] py-[20px]"></td>
                    <td className="px-[24px] py-[20px]"></td>
                    <td className="px-[24px] py-[20px]"></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-[24px] py-[16px] border-t border-ink-black/5 bg-canvas/50 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Page 1 of {Math.ceil(contacts.length / 10) || 128}</span>
          <div className="flex items-center gap-[8px]">
            <button className="px-[16px] py-[8px] rounded-xl bg-white border border-ink-black/5 shadow-sm text-[12px] font-medium text-slate hover:text-ink-black hover:border-ink-black/10 transition-all">Previous</button>
            <button className="px-[16px] py-[8px] rounded-xl bg-ink-black text-white text-[12px] font-medium hover:bg-ink-black/90 shadow-sm transition-all">Next</button>
          </div>
        </div>
      </div>

      {/* ─── AI Insights ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
        <div className="p-[24px] bg-white border border-ink-black/5 rounded-2xl flex flex-col justify-between gap-[20px] relative overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-[12px]">
            <div className="w-[40px] h-[40px] bg-canvas rounded-xl flex items-center justify-center border border-ink-black/5">
              <Sparkles size={20} className="text-ink-black" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-ink-black tracking-tight">Sentiment Analysis</h3>
              <p className="text-[11px] font-medium text-slate uppercase tracking-wider">Predictive Lead Scoring</p>
            </div>
          </div>
          <p className="text-[14px] text-slate font-medium leading-relaxed italic">"Identified 24 high-intent leads from recent comment activity. Recommendation: Trigger direct DM nurturing flow."</p>
          <button className="px-[24px] py-[12px] bg-ink-black text-white rounded-xl font-semibold text-[13px] self-start transform active:scale-95 transition-all shadow-sm hover:bg-ink-black/90">Execute Nurturing</button>
        </div>

        <div className="p-[24px] bg-white border border-ink-black/5 rounded-2xl flex flex-col justify-between gap-[20px] relative overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-[12px]">
            <div className="w-[40px] h-[40px] bg-canvas rounded-xl flex items-center justify-center border border-ink-black/5">
              <TrendingUp size={20} className="text-ink-black" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-ink-black tracking-tight">Growth Velocity</h3>
              <p className="text-[11px] font-medium text-slate uppercase tracking-wider">Audience Expansion Rate</p>
            </div>
          </div>
          <div className="flex items-end gap-[12px]">
            <span className="text-[36px] font-semibold text-ink-black tracking-tight leading-none">+24.8%</span>
            <div className="flex items-center gap-[6px] text-ink-black bg-ink-black/5 px-[12px] py-[6px] rounded-full mb-1 border border-ink-black/10">
              <ArrowUpRight size={14} />
              <span className="text-[11px] font-medium">Accelerating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
