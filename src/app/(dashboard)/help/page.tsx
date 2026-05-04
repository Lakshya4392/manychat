import React from "react";
import { HelpCircle, BookOpen, MessageCircle, FileText, ExternalLink, Search, ChevronRight, Sparkles } from "lucide-react";

export default function HelpPage() {
  const categories = [
    {
      title: "Getting Started", icon: BookOpen,
      links: ["Setting up your first automation", "Connecting Instagram", "Understanding Triggers", "Keywords Guide"]
    },
    {
      title: "Integrations", icon: ExternalLink,
      links: ["Meta Developer Setup", "OpenAI API integration", "Stripe Checkout guide", "Webhook verification"]
    },
    {
      title: "Automation Builder", icon: FileText,
      links: ["Smart AI Prompts", "Comment reply logic", "Keyword matching rules", "Flow builder tips"]
    }
  ];

  return (
    <div className="flex flex-col gap-[32px] pb-[64px]">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-[24px] items-center text-center max-w-2xl mx-auto">
        <div className="flex flex-col gap-[12px] items-center">
            <div className="w-[64px] h-[64px] bg-canvas rounded-2xl border border-ink-black/5 flex items-center justify-center shadow-sm">
                <HelpCircle size={32} className="text-slate" />
            </div>
            <h1 className="text-[32px] font-semibold text-ink-black tracking-tight">Intelligence Support</h1>
            <p className="text-[14px] font-medium text-slate max-w-md leading-relaxed">
                Search our knowledge base or browse documentation to optimize your engine.
            </p>
        </div>

        <div className="w-full relative group max-w-lg">
            <div className="absolute left-[16px] top-1/2 -translate-y-1/2 pointer-events-none">
                <Search size={18} className="text-slate group-focus-within:text-ink-black transition-colors" />
            </div>
            <input 
                type="text" 
                placeholder="Search for articles, guides..." 
                className="w-full bg-white border border-ink-black/5 rounded-2xl py-[12px] pl-[44px] pr-[24px] text-[14px] text-ink-black focus:outline-none focus:border-ink-black/10 focus:ring-4 focus:ring-ink-black/5 transition-all placeholder:text-slate shadow-sm"
            />
        </div>
      </div>

      {/* ─── Categories ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
        {categories.map((cat) => (
            <div key={cat.title} className="bg-white border border-ink-black/5 rounded-2xl p-[24px] flex flex-col gap-[24px] group hover:border-ink-black/10 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-[12px]">
                    <div className="w-[48px] h-[48px] bg-canvas rounded-2xl flex items-center justify-center border border-ink-black/5 group-hover:scale-105 transition-all">
                        <cat.icon size={24} className="text-slate group-hover:text-ink-black transition-colors" />
                    </div>
                    <h3 className="text-[18px] font-semibold text-ink-black tracking-tight">{cat.title}</h3>
                </div>

                <div className="flex flex-col">
                    {cat.links.map((link) => (
                        <div key={link} className="flex items-center justify-between py-[12px] group/link cursor-pointer border-b border-ink-black/[0.03] last:border-0 hover:bg-canvas/50 px-[8px] -mx-[8px] rounded-xl transition-all">
                            <span className="text-[14px] text-slate group-hover/link:text-ink-black transition-colors font-medium">
                                {link}
                            </span>
                            <ChevronRight size={16} className="text-slate group-hover/link:text-ink-black transition-all transform group-hover/link:translate-x-[4px]" />
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>

      {/* ─── Support Banner ─── */}
      <div className="bg-ink-black text-white rounded-2xl p-[32px] flex flex-col md:flex-row items-center justify-between gap-[24px] relative overflow-hidden shadow-sm group">
         <div className="absolute top-0 right-0 w-72 h-72 spectrum-glow opacity-20 pointer-events-none -mr-28 -mt-28 group-hover:opacity-30 transition-all duration-700" />
         
         <div className="flex flex-col gap-[8px] relative z-10 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-[8px] mb-[4px]">
                <Sparkles size={20} className="text-white" />
                <h2 className="text-[20px] font-semibold text-white tracking-tight">Still Need Help?</h2>
            </div>
            <p className="text-white/60 font-medium text-[13px] max-w-md leading-relaxed">
                Connect with our support team for personalized assistance. Available 24/7.
            </p>
         </div>

         <button className="px-[24px] py-[12px] bg-white text-ink-black rounded-xl text-[13px] font-semibold transition-all transform active:scale-95 shadow-sm relative z-10 flex items-center gap-[8px] hover:bg-white/90">
            <MessageCircle size={16} />
            <span>Chat with Support</span>
         </button>
      </div>
    </div>
  );
}
