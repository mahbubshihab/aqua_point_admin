'use client';

import { Search, Bell, Activity, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const getPageTitle = (path: string): string => {
  if (path === '/') return 'Dashboard';
  if (path.startsWith('/products')) return 'Products';
  if (path.startsWith('/categories')) return 'Categories';
  if (path.startsWith('/banners')) return 'Banners';
  if (path.startsWith('/clients')) return 'Clients';
  if (path.startsWith('/requests')) return 'Service Requests';
  if (path.startsWith('/orders')) return 'Orders';
  if (path.startsWith('/inquiries')) return 'Inquiries';
  if (path.startsWith('/reviews')) return 'Reviews';
  if (path.startsWith('/customers')) return 'Customers';
  if (path.startsWith('/settings')) return 'Settings';
  return 'Dashboard';
};

export default function Header() {
  const pathname = usePathname();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pageTitle = getPageTitle(pathname);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="sticky top-0 z-30 h-16 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-6 lg:px-8 flex items-center justify-between shadow-xl shadow-cyan-950/10">
      {/* Left: Dynamic Breadcrumb */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-semibold text-slate-400">Aqua Point</span>
        <span className="text-slate-600 text-xs font-mono">/</span>
        <span className="text-sm md:text-base font-extrabold text-white tracking-tight">
          {pageTitle}
        </span>
      </div>

      {/* Center: Global Search Trigger */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search system... ⌘K"
            className="w-full pl-10 pr-12 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-[#00BCE1] focus:ring-1 focus:ring-[#00BCE1]/50 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/60 rounded pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: System Status, Controls & User Avatar */}
      <div className="flex items-center gap-3 lg:gap-4 shrink-0">
        {/* System Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/90 text-xs shadow-inner">
          <Activity className="w-3.5 h-3.5 text-[#00BCE1] animate-pulse" />
          <span className="text-slate-300 font-medium text-[11px]">System:</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Cloud Node Active
          </span>
        </div>

        {/* Refresh Button */}
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

        {/* User Avatar (Mahbub Shihab) */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00BCE1] to-blue-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-[0_0_10px_rgba(0,188,225,0.3)]">
              MS
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white leading-none">Mahbub Shihab</p>
            <p className="text-[10px] text-[#00BCE1] font-medium leading-tight mt-0.5">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
