import React from "react";
import { ArrowRight } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  footerText?: string;
  className?: string;
}

export default function DashboardCard({ title, description, footerText, className = "" }: DashboardCardProps) {
  return (
    <div className={`group relative p-[32px] flex flex-col justify-between min-h-[160px] bg-white border border-black/[0.08] rounded-xl overflow-hidden transition-all hover:shadow-sm ${className}`}>
      <div>
        <h3 className="text-[14px] font-bold text-black tracking-tight mb-1.5 leading-tight">{title}</h3>
        <p className="text-[13px] text-gray-500 leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center justify-between mt-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Engine Status</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            <span className="text-[11px] font-semibold text-black tracking-tight">Active Sync</span>
          </div>
        </div>
        <div className="w-8 h-8 bg-gray-100 text-black rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
