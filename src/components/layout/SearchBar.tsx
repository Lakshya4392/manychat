import React from "react";
import { Search, Bell, Plus } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="flex items-center justify-between w-full px-6 py-6 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-30">
      {/* Search Input on the Left */}
      <div className="flex-grow max-w-lg relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search className="w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search by name, email or status" 
          className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-white/10 focus:bg-white/10 transition-all placeholder:text-zinc-600 font-medium"
        />
      </div>
      
      {/* Action Buttons on the Right */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-primary/20 transform active:scale-95">
          <Plus className="w-4 h-4" />
          <span>Create an Automation</span>
        </button>
        
        <button className="p-3.5 bg-white/5 border border-white/5 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all group">
          <Bell className="w-5 h-5 fill-zinc-400 group-hover:fill-white transition-all" />
        </button>
      </div>
    </div>
  );
}

