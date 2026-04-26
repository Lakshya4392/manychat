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
    <div className={`card-glow p-6 flex flex-col justify-between min-h-[220px] group cursor-pointer hover:border-primary/20 transition-all ${className}`}>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
      </div>
      
      <div className="flex items-center justify-between mt-6">
        {footerText && <p className="text-xs text-zinc-500 font-medium">{footerText}</p>}
        <div className="p-2 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-primary/10">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
