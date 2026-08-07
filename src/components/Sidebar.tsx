'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Droplets, 
  Layers,
  Wrench, 
  ShoppingBag,
  MessageSquare,
  Users, 
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
  { name: 'Categories', href: '/categories', icon: Layers },
  { name: 'Service Requests', href: '/requests', icon: Wrench, badge: '12' },
  { name: 'Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Inquiries', href: '/inquiries', icon: MessageSquare },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 fixed left-0 top-0 bottom-0 z-40 backdrop-blur-xl bg-slate-950/85 border-r border-slate-800/80 flex flex-col justify-between p-4 shadow-2xl shadow-cyan-950/20">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/80">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00BCE1] to-blue-600 shadow-[0_0_20px_rgba(0,188,225,0.4)]">
            <Droplets className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-300 rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5">
              AQUA <span className="text-[#00BCE1] cyan-glow-text">POINT</span>
            </h1>
            <p className="text-[11px] text-[#00BCE1]/80 font-medium tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00BCE1]" /> ADMIN SYSTEM
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
                    ? 'bg-[#00BCE1]/15 text-[#00BCE1] border border-[#00BCE1]/30 shadow-[0_0_15px_rgba(0,188,225,0.15)] font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#00BCE1]' : 'text-slate-400 group-hover:text-[#00BCE1]'
                  }`} />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/30">
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-4 h-4 text-[#00BCE1]" />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Badge */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex items-center gap-3 shadow-lg">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00BCE1] to-blue-600 flex items-center justify-center text-slate-950 font-extrabold text-xs shadow-[0_0_12px_rgba(0,188,225,0.4)]">
              MS
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate flex items-center gap-1">
              Mahbub Shihab <ShieldCheck className="w-3.5 h-3.5 text-[#00BCE1] inline" />
            </p>
            <p className="text-[11px] text-[#00BCE1]/80 truncate font-medium">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
