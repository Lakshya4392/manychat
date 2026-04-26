"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  Zap, 
  Settings, 
  User, 
  HelpCircle, 
  MessageCircle
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Users, label: "Contacts", href: "/contacts", count: 4 },
  { icon: Zap, label: "Automations", href: "/automations" },
  { icon: MessageCircle, label: "Integrations", href: "/integrations" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const secondaryNavItems = [
  { icon: User, label: "Profile", href: "/profile" },
  { icon: HelpCircle, label: "Help", href: "/help" },
];

export default function Sidebar() {
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#09090b] border-r border-white/5 flex flex-col p-6 fixed left-0 top-0 z-40">
      <div className="mb-10 flex items-center gap-2 px-2">
        <span className="text-3xl font-extrabold font-heading italic tracking-tighter text-white">
          Slide
        </span>
      </div>

      <nav className="flex-grow space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? "bg-[#1c1c21] text-white" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-zinc-500 group-hover:text-white"}`} />
                <span className="font-semibold text-sm tracking-tight">{item.label}</span>
              </div>
              {item.count && !isActive && (
                <span className="text-[10px] text-zinc-600 font-bold">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-8 pb-4">
          <hr className="border-white/5" />
        </div>

        {secondaryNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? "bg-[#1c1c21] text-white" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-zinc-500 group-hover:text-white"}`} />
              <span className="font-semibold text-sm tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="p-5 rounded-3xl bg-zinc-900 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-all" />
            <h4 className="text-xs font-semibold text-white mb-1">Upgrade to <span className="text-primary italic font-heading">Smart AI</span></h4>
            <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed">Unlock all features including AI and more.</p>
            <button className="w-full py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-primary/20 transform active:scale-95">
              Upgrade
            </button>
        </div>

         <div className="flex items-center gap-3 p-2 group transition-all">
             <UserButton 
                 appearance={{
                     elements: {
                         avatarBox: "w-9 h-9 border border-white/10 shadow-lg"
                     }
                 }}
             />
            <div className="flex-grow overflow-hidden">
                <p className="text-[11px] font-bold text-white truncate">
                    {user?.fullName || "Web Prodigies"}
                </p>
                <p className="text-[9px] text-zinc-500 truncate font-medium">
                    {user?.primaryEmailAddress?.emailAddress || "john@example.com"}
                </p>
            </div>
        </div>
      </div>
    </aside>
  );
}

