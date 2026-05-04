import React from "react";
import { Search, Bell, Plus } from "lucide-react";

export default function SearchBar() {
  return (
    <header className="flex items-center justify-between w-full px-8 h-16 sticky top-0 bg-white border-b border-black/[0.06] z-30">
      {/* Search */}
      <div className="w-72 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search automations, contacts..."
          className="w-full bg-gray-50 border border-black/[0.08] rounded-lg py-2 pl-9 pr-3 text-[13px] text-black focus:outline-none focus:border-black/20 focus:bg-white transition-all placeholder:text-gray-400"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 bg-black hover:bg-black/80 text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-all active:scale-95">
          <Plus className="w-3.5 h-3.5" />
          <span>Create Automation</span>
        </button>

        <button className="w-9 h-9 bg-gray-50 border border-black/[0.08] rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-all flex items-center justify-center relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full border border-white" />
        </button>
      </div>
    </header>
  );
}
