'use client';

import { Search, Bell, Settings, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#1f2940] border-b border-[#141b2d] px-6 flex items-center justify-between shadow-lg">
      {/* Left: Compact Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-4 pr-10 py-2 text-xs rounded-xl bg-[#141b2d] border border-slate-700/60 text-white placeholder-[#A0AEC0] focus:outline-none focus:border-[#4cceac] focus:ring-1 focus:ring-[#4cceac]/50 transition-all"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
        </div>
      </div>

      {/* Right: Minimal action icons */}
      <div className="flex items-center gap-3">

        {/* Notifications Bell 🔔 */}
        <button 
          className="relative p-2.5 rounded-xl bg-[#141b2d] border border-slate-700/60 hover:border-[#4cceac]/50 text-[#A0AEC0] hover:text-white transition-all cursor-pointer shadow-sm"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-[#A0AEC0] hover:text-white" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4cceac] shadow-[0_0_8px_#4cceac]" />
        </button>

        {/* Settings Gear ⚙️ */}
        <button 
          className="p-2.5 rounded-xl bg-[#141b2d] border border-slate-700/60 hover:border-[#4cceac]/50 text-[#A0AEC0] hover:text-white transition-all cursor-pointer shadow-sm"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-[#A0AEC0] hover:text-white" />
        </button>

        {/* User Icon 👤 */}
        <button 
          className="p-2.5 rounded-xl bg-[#141b2d] border border-slate-700/60 hover:border-[#4cceac]/50 text-[#A0AEC0] hover:text-white transition-all cursor-pointer shadow-sm"
          title="User Profile"
        >
          <User className="w-4 h-4 text-[#4cceac]" />
        </button>
      </div>
    </header>
  );
}
