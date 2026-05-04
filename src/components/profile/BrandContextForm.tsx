"use client";

import { useState } from "react";
import { onUpdateBrandContext } from "@/actions/user";
import { toast } from "sonner";
import { Brain, Sparkles, Loader2, Save } from "lucide-react";

export default function BrandContextForm({ initialValue }: { initialValue?: string }) {
  const [context, setContext] = useState(initialValue || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await onUpdateBrandContext(context);
    if (res.status === 200) {
      toast.success("Brand Knowledge Updated!");
    } else {
      toast.error("Failed to update brand context");
    }
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-[24px] relative z-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-[16px]">
        <div className="flex items-center gap-[16px]">
            <div className="w-[48px] h-[48px] bg-canvas rounded-2xl border border-ink-black/5 flex items-center justify-center shrink-0">
                <Brain size={24} className="text-slate" />
            </div>
            <div className="flex flex-col gap-[4px]">
                <h3 className="text-[20px] font-semibold text-ink-black tracking-tight">Creator Knowledge Base</h3>
                <p className="text-[13px] font-medium text-slate">Train your Personal AI on your brand voice</p>
            </div>
        </div>

        <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-[8px] px-[24px] py-[12px] bg-ink-black text-white hover:bg-ink-black/90 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-50 shadow-sm active:scale-95 whitespace-nowrap"
        >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Brain
        </button>
      </div>

      <div className="flex flex-col gap-[16px]">
        <div className="flex items-center gap-[8px] px-[12px] py-[6px] bg-ink-black/5 border border-ink-black/10 rounded-lg w-fit">
            <Sparkles size={14} className="text-ink-black" />
            <span className="text-[10px] font-medium text-ink-black uppercase tracking-wider">AI Persona Active</span>
        </div>
        
        <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Tell your AI about yourself, your business, your tone of voice, common FAQs, and anything else it should know to represent you perfectly..."
            className="w-full bg-canvas border border-ink-black/5 rounded-2xl p-[24px] text-[14px] text-ink-black focus:outline-none focus:border-ink-black/20 focus:ring-4 focus:ring-ink-black/5 min-h-[250px] resize-none placeholder:text-slate transition-all leading-relaxed shadow-inner"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            <div className="p-[20px] rounded-2xl bg-canvas border border-ink-black/5">
                <p className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-[8px]">Pro Tip: Tone of Voice</p>
                <p className="text-[13px] text-slate font-medium leading-relaxed">Mention if you use emojis, if you are sarcastic, or if you prefer short, punchy sentences.</p>
            </div>
            <div className="p-[20px] rounded-2xl bg-canvas border border-ink-black/5">
                <p className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-[8px]">Pro Tip: Knowledge</p>
                <p className="text-[13px] text-slate font-medium leading-relaxed">Add your website URL, product names, and pricing so the AI can answer accurately.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
