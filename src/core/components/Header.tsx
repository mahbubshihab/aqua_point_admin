'use client';

import { Search, Bell, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#1f2940] border-b border-[#2c3754] px-6 flex items-center justify-between shadow-lg">
      {/* Left Corner: User Profile Badge & Compact Search Bar */}
      <div className="flex items-center gap-6">
        {/* User Profile Badge */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3e4396] to-[#4cceac] flex items-center justify-center text-white font-extrabold text-sm shadow-md border-2 border-[#4cceac]">
              MS
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#4cceac] rounded-full border-2 border-[#1f2940]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white leading-tight">
              Mahbub Shihab
            </span>
            <span className="text-[10px] font-semibold text-[#4cceac] leading-tight mt-0.5">
              Super Admin
            </span>
          </div>
        </div>

        {/* Compact Search Bar */}
        <div className="relative w-56 sm:w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-4 pr-9 py-1.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white placeholder-[#A0AEC0] focus:outline-none focus:border-[#4cceac] focus:ring-1 focus:ring-[#4cceac]/50 transition-all"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0AEC0]" />
        </div>
      </div>

      {/* Right Corner: System Status, Notifications & Settings */}
      <div className="flex items-center gap-3">
        {/* System Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141b2d] border border-[#2c3754] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#4cceac] animate-pulse" />
          <span className="text-[#4cceac] text-[11px] font-bold">Cloud Node Active</span>
        </div>

        {/* Notifications Bell 🔔 */}
        <button 
          className="relative p-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] hover:border-[#4cceac]/50 text-[#A0AEC0] hover:text-white transition-all cursor-pointer shadow-sm"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-[#A0AEC0] hover:text-white" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4cceac] shadow-[0_0_8px_#4cceac]" />
        </button>

        {/* Settings Gear ⚙️ */}
        <button 
          className="p-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] hover:border-[#4cceac]/50 text-[#A0AEC0] hover:text-white transition-all cursor-pointer shadow-sm"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-[#A0AEC0] hover:text-white" />
        </button>
      </div>
    </header>
  );
}

