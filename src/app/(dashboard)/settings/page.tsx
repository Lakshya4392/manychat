"use client";

import React from "react";
import { Settings, Bell, Palette, ChevronRight, Globe, Lock, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type SettingsItem =
  | { type: "select"; label: string; value: string; }
  | { type: "switch"; label: string; defaultChecked: boolean; };

interface Section {
  title: string;
  icon: React.ElementType;
  color: string;
  items: SettingsItem[];
}

export default function SettingsPage() {
  const sections: Section[] = [
    {
      title: "System Config", icon: Globe, color: "text-ink-black",
      items: [
        { type: "select", label: "Regional Language", value: "English (US)" },
        { type: "select", label: "Engine Timezone", value: "(GMT+05:30) Mumbai" },
      ]
    },
    {
      title: "Engine Notifications", icon: Bell, color: "text-ink-black",
      items: [
        { type: "switch", label: "Lead Capture Alerts", defaultChecked: true },
        { type: "switch", label: "Daily Summary Report", defaultChecked: false },
        { type: "switch", label: "Critical System Alerts", defaultChecked: true },
      ]
    },
    {
      title: "Interface", icon: Palette, color: "text-ink-black",
      items: [
        { type: "switch", label: "High Contrast Mode", defaultChecked: false },
        { type: "switch", label: "Reduced Motion", defaultChecked: false },
      ]
    },
    {
      title: "Access Control", icon: Lock, color: "text-ink-black",
      items: [
        { type: "switch", label: "Multi-Factor Authentication", defaultChecked: true },
        { type: "switch", label: "Public API Access", defaultChecked: false },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-[8px]">
        <div className="flex items-center gap-[12px] mb-[4px]">
          <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Control Center</span>
          <div className="flex items-center gap-[6px] px-[10px] py-[2px] bg-ink-black text-white rounded-full">
            <ShieldCheck size={12} className="text-white" />
            <span className="text-[9px] font-medium uppercase tracking-tight">Verified Session</span>
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-ink-black tracking-tight">Settings</h1>
        <p className="text-[13px] text-slate max-w-md leading-relaxed">
          Configure your workspace, notifications, and security protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] max-w-4xl">
        {sections.map((section) => (
          <div key={section.title} className="bg-white border border-ink-black/5 rounded-2xl p-[24px] flex flex-col gap-[24px] group hover:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-[12px]">
              <div className="w-[40px] h-[40px] bg-canvas rounded-xl flex items-center justify-center border border-ink-black/5 group-hover:scale-105 transition-all">
                <section.icon size={20} className="text-slate" />
              </div>
              <h3 className="text-[16px] font-semibold text-ink-black tracking-tight">{section.title}</h3>
            </div>

            <div className="flex flex-col">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-[14px] border-b border-ink-black/[0.03] last:border-0 group/item">
                  <span className="text-[13px] text-slate group-hover/item:text-ink-black transition-colors font-medium">
                    {item.label}
                  </span>

                  {item.type === "switch" ? (
                    <Switch defaultChecked={item.defaultChecked} className="data-[state=checked]:bg-ink-black" />
                  ) : (
                    <div className="flex items-center gap-[6px] cursor-pointer group/val px-[12px] py-[6px] bg-canvas rounded-lg border border-ink-black/5 hover:border-ink-black/10 transition-all">
                      <span className="text-[10px] text-slate group-hover/val:text-ink-black transition-colors font-medium uppercase tracking-tight">
                        {item.value}
                      </span>
                      <ChevronRight size={14} className="text-slate" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Security Banner */}
        <div className="bg-ink-black text-white rounded-2xl p-[32px] flex flex-col md:flex-row items-center justify-between gap-[24px] relative overflow-hidden group col-span-1 md:col-span-2 shadow-sm">
          <div className="absolute top-0 right-0 w-[288px] h-[288px] spectrum-glow opacity-20 pointer-events-none -mr-[64px] -mt-[64px] group-hover:opacity-30 transition-all duration-700" />

          <div className="flex flex-col gap-[8px] relative z-10">
            <h3 className="text-xl font-semibold text-white tracking-tight">Security & Encryption</h3>
            <p className="text-[12px] text-white/60 max-w-md leading-relaxed">
              Manage encryption keys, authentication methods, and session history.
            </p>
          </div>

          <button className="px-[24px] py-[12px] bg-white text-ink-black rounded-xl font-medium text-[13px] transition-all transform active:scale-95 shadow-sm relative z-10 whitespace-nowrap">
            Manage Infrastructure
          </button>
        </div>
      </div>
    </div>
  );
}
