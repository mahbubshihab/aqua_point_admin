'use client';

import { Search, Bell, Activity, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="sticky top-0 z-30 h-16 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-8 flex items-center justify-between shadow-xl shadow-cyan-950/10">
      <div className="flex items-center gap-6">
        {/* Brand Logo in Header */}
        <div className="flex items-center gap-2">
          <Image
            src="/app_logo.png"
            alt="Aqua Point Logo"
            width={140}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </div>

        {/* Search Input */}
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, requests, customers..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-[#00BCE1] focus:ring-1 focus:ring-[#00BCE1]/50 transition-all"
          />
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-4">
        {/* System Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs shadow-inner">
          <Activity className="w-3.5 h-3.5 text-[#00BCE1] animate-pulse" />
          <span className="text-slate-300 font-medium text-[11px]">System Status:</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Cloud Node Active
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-[#00BCE1]/40 text-slate-300 hover:text-[#00BCE1] transition-all cursor-pointer shadow-sm"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#00BCE1]' : ''}`} />
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-[#00BCE1]/40 text-slate-300 hover:text-[#00BCE1] transition-all cursor-pointer shadow-sm">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00BCE1] shadow-[0_0_8px_#00BCE1]" />
        </button>
      </div>
    </header>
  );
}
