'use client';

import { Search, Bell, Activity, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-cyan-500/20 px-8 flex items-center justify-between bg-[#0A0D16]/80 backdrop-blur-md">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search products, requests, customers..."
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/70 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
        />
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-4">
        {/* System Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-cyan-500/30 text-xs">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-300 font-medium text-[11px]">System Status:</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Cloud Node Active
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl bg-slate-900/70 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl bg-slate-900/70 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]" />
        </button>
      </div>
    </header>
  );
}
