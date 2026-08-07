'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Droplets, 
  Layers,
  Building2,
  Wrench, 
  ShoppingBag,
  MessageSquare,
  MessageSquareQuote,
  Users, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  subscribeToServiceRequests, 
  subscribeToOrders, 
  subscribeToInquiries 
} from '@/lib/firebase';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Droplets },
  { name: 'Categories', href: '/categories', icon: Layers },
  { name: 'Clients', href: '/clients', icon: Building2 },
  { name: 'Service Requests', href: '/requests', icon: Wrench },
  { name: 'Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Inquiries', href: '/inquiries', icon: MessageSquare },
  { name: 'Reviews', href: '/reviews', icon: MessageSquareQuote },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [servicesCount, setServicesCount] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [inquiriesCount, setInquiriesCount] = useState<number>(0);

  useEffect(() => {
    const unsubServices = subscribeToServiceRequests((data) => {
      setServicesCount(data.length);
    });
    const unsubOrders = subscribeToOrders((data) => {
      setOrdersCount(data.length);
    });
    const unsubInquiries = subscribeToInquiries((data) => {
      setInquiriesCount(data.length);
    });

    return () => {
      unsubServices();
      unsubOrders();
      unsubInquiries();
    };
  }, []);

  const getBadgeCount = (href: string): number => {
    if (href === '/requests') return servicesCount;
    if (href === '/orders') return ordersCount;
    if (href === '/inquiries') return inquiriesCount;
    return 0;
  };

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
            const badgeCount = getBadgeCount(item.href);

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
                {badgeCount > 0 ? (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/30">
                    {badgeCount}
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
