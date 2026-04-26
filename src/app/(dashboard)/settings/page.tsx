import React from "react";
import { Settings, Bell, Palette, ChevronRight } from "lucide-react";
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
      title: "General",
      icon: Settings,
      color: "text-primary",
      items: [
        { type: "select", label: "Language", value: "English (US)" },
        { type: "select", label: "Timezone", value: "(GMT+05:30) Mumbai, Kolkata" },
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      color: "text-amber-500",
      items: [
        { type: "switch", label: "Email Notifications", defaultChecked: true },
        { type: "switch", label: "Desktop Notifications", defaultChecked: false },
        { type: "switch", label: "Browser Audio", defaultChecked: true },
      ]
    },
    {
      title: "Appearance",
      icon: Palette,
      color: "text-indigo-500",
      items: [
        { type: "switch", label: "Dark Mode", defaultChecked: true },
        { type: "switch", label: "Reduced Motion", defaultChecked: false },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
        {sections.map((section) => (
          <div key={section.title} className="bg-[#121215] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 group hover:border-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-xl">
                 <section.icon className={`w-5 h-5 ${section.color}`} />
               </div>
               <h3 className="text-lg font-bold text-white">{section.title}</h3>
            </div>

            <div className="flex flex-col gap-1">
               {section.items.map((item) => (
                 <div key={item.label} className="flex items-center justify-between py-4 border-b border-white/[0.03] last:border-0 group/item">
                   <span className="text-sm text-zinc-400 group-hover/item:text-zinc-200 transition-colors font-medium">
                     {item.label}
                   </span>
                   
                   {item.type === "switch" ? (
                     <Switch defaultChecked={item.defaultChecked} className="data-[state=checked]:bg-primary" />
                   ) : (
                     <div className="flex items-center gap-2 cursor-pointer group/val">
                        <span className="text-xs text-zinc-600 group-hover/val:text-zinc-400 transition-colors font-bold uppercase tracking-widest">
                          {item.value}
                        </span>
                        <ChevronRight className="w-4 h-4 text-zinc-800" />
                     </div>
                   )}
                 </div>
               ))}
            </div>
          </div>
        ))}

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-[2.5rem] p-8 flex flex-col gap-6 relative overflow-hidden group col-span-1 md:col-span-2">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl opacity-50 group-hover:opacity-100 transition-all" />
            
            <div className="flex flex-col gap-2 relative z-10">
                <h3 className="text-xl font-bold text-white tracking-tight">Security & Privacy</h3>
                <p className="text-xs text-zinc-500 max-w-md font-medium leading-relaxed">
                  Manage your account security, two-factor authentication, and privacy settings to ensure your data is always safe.
                </p>
            </div>

            <button className="w-fit px-8 py-3.5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all transform active:scale-95 relative z-10 group-hover:scale-105">
                Manage Security
            </button>
        </div>
      </div>
    </div>
  );
}
