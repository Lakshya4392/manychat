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
import { onGetUserInfo } from "@/actions/user";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Zap, label: "Automations", href: "/automations" },
  { icon: Users, label: "Contacts", href: "/contacts" },
  { icon: MessageCircle, label: "Activity", href: "/activity" },
  { icon: Settings, label: "Integrations", href: "/integrations" },
];

const secondaryNavItems = [
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Help", href: "/help" },
];

export default function Sidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [isSidebarConnected, setIsSidebarConnected] = React.useState(false);

  React.useEffect(() => {
    const checkConnection = async () => {
      const res = await onGetUserInfo();
      if (res.status === 200 && (res.data?.integrations?.length ?? 0) > 0) {
        setIsSidebarConnected(true);
      }
    };
    checkConnection();
  }, []);

  return (
    <aside className="w-64 h-screen bg-white border-r border-ink-black/5 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-8 py-8">
        <div className="flex items-center gap-3 px-1 group cursor-pointer">
          <div className="w-[32px] h-[32px] bg-ink-black rounded-lg flex items-center justify-center transition-transform group-hover:rotate-3 duration-500">
            <Zap size={16} className="text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-ink-black">
            Inboxly.
          </span>
        </div>
      </div>

      {/* Primary Nav */}
      <div className="px-4 flex-grow">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                    ? "bg-ink-black/[0.06] text-ink-black font-semibold"
                    : "text-slate hover:text-ink-black hover:bg-ink-black/[0.02]"
                  }`}
              >
                <item.icon size={20} className={`shrink-0 ${isActive ? "text-ink-black" : "text-slate group-hover:text-ink-black"} transition-colors`} />
                <span className="text-[14px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="my-6 mx-3 h-px bg-ink-black/[0.04]" />

        <nav className="space-y-1">
          {secondaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                    ? "bg-ink-black/[0.06] text-ink-black font-semibold"
                    : "text-slate hover:text-ink-black hover:bg-ink-black/[0.02]"
                  }`}
              >
                <item.icon size={20} className={`shrink-0 ${isActive ? "text-ink-black" : "text-slate group-hover:text-ink-black"} transition-colors`} />
                <span className="text-[14px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="p-4 space-y-4">
        <div className="p-4 rounded-2xl bg-canvas border border-ink-black/5 relative overflow-hidden group/upgrade cursor-pointer hover:border-ink-black/10 transition-colors">
          <div className="absolute -right-6 -top-6 w-20 h-20 spectrum-glow opacity-10 pointer-events-none" />
          <h4 className="text-[12px] font-bold text-ink-black mb-0.5">Upgrade Pro</h4>
          <p className="text-[10px] text-slate mb-3 leading-relaxed">Advanced AI & higher limits.</p>
          <button className="w-full py-2 bg-ink-black text-white rounded-xl text-[11px] font-bold transition-all transform active:scale-95">
            View Plans
          </button>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-ink-black/5 hover:bg-canvas rounded-xl transition-all group/user cursor-pointer">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-[32px] h-[32px] border border-ink-black/5"
              }
            }}
          />
          <div className="flex-grow overflow-hidden">
            <p className="text-[12px] font-bold text-ink-black truncate leading-tight">
              {user?.fullName || "User"}
            </p>
            <p className="text-[9px] text-slate truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
