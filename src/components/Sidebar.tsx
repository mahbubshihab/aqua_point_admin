'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Droplets, 
  Wrench, 
  ShoppingBag,
  MessageSquare,
  Users, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Droplets },
  { name: 'Service Requests', href: '/requests', icon: Wrench, badge: '12' },
  { name: 'Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Inquiries', href: '/inquiries', icon: MessageSquare },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 fixed left-0 top-0 bottom-0 z-40 glass-panel border-r border-cyan-500/20 flex flex-col justify-between p-4 bg-[#0A0D16]/90">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-white/10">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            <Droplets className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-300 rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider text-white flex items-center gap-1.5">
              AQUA <span className="gradient-cyan-text">POINT</span>
            </h1>
            <p className="text-[11px] text-cyan-400/80 font-medium tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> ADMIN SYSTEM
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                  }`} />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Badge */}
      <div className="pt-4 border-t border-white/10">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 glass-panel flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-[0_0_10px_rgba(0,229,255,0.3)]">
              MS
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0A0D16]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate flex items-center gap-1">
              Mahbub Shihab <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 inline" />
            </p>
            <p className="text-[11px] text-cyan-400/70 truncate">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
