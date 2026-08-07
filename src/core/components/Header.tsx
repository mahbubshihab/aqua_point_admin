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
    <header className="sticky top-0 z-30 h-16 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-8 flex items-center justify-between shadow-xl shadow-cyan-950/10">
      <div className="flex items-center gap-6">
        {/* Dynamic Page Title in Header */}
        <h1 className="text-lg md:text-xl font-bold text-white tracking-tight shrink-0">
          {pageTitle}
        </h1>

        {/* Search Input */}
        <div className="relative w-72 md:w-80">
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
