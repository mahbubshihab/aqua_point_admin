'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Droplets, 
  Layers,
  Image as ImageIcon,
  Wrench, 
  ShoppingBag,
  Inbox,
  MessageSquareQuote,
  Users, 
  Store,
  Settings, 
  Menu,
  X,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { 
  subscribeToServiceRequests, 
  subscribeToOrders, 
  subscribeToCustomerThreads,
  logoutAdmin
} from '@/core/services/firebase';
import { useSidebar } from '@/core/context/SidebarContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupTitle: 'Dashboard',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    groupTitle: 'Data',
    items: [
      { name: 'Orders', href: '/orders', icon: ShoppingBag },
      { name: 'Service Requests', href: '/service-requests', icon: Wrench },
      { name: 'Inbox', href: '/messages', icon: Inbox },
      { name: 'Products', href: '/products', icon: Droplets },
      { name: 'Customers', href: '/customers', icon: Users },
      { name: 'Categories', href: '/categories', icon: Layers },
      { name: 'Stores', href: '/stores', icon: Store },
      { name: 'Banners', href: '/banners', icon: ImageIcon },
      { name: 'Reviews', href: '/reviews', icon: MessageSquareQuote },
    ],
  },
  {
    groupTitle: 'Settings',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileOpen, setIsMobileOpen, collapsed, setCollapsed } = useSidebar();
  const [servicesCount, setServicesCount] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  useEffect(() => {
    const unsubServices = subscribeToServiceRequests((data) => {
      setServicesCount(data.length);
    });
    const unsubOrders = subscribeToOrders((data) => {
      setOrdersCount(data.length);
    });
    const unsubThreads = subscribeToCustomerThreads((data) => {
      const totalUnread = data.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
      setUnreadMessagesCount(totalUnread);
    });

    return () => {
      unsubServices();
      unsubOrders();
      unsubThreads();
    };
  }, []);

  const getBadgeCount = (href: string): number => {
    if (href === '/requests' || href === '/service-requests') return servicesCount;
    if (href === '/orders') return ordersCount;
    if (href === '/messages') return unreadMessagesCount;
    return 0;
  };

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      await logoutAdmin();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside 
        className={`fixed left-0 top-0 bottom-0 z-50 bg-[#1f2940] border-r border-[#2c3754] flex flex-col justify-between p-4 shadow-2xl transition-all duration-300 ${
          // Desktop sizing
          collapsed ? 'md:w-20' : 'md:w-64'
        } ${
          // Mobile slide-over drawer
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto scrollbar-none pr-1 flex-1">
          {/* Top Bar: Brand AQUA POINT with official logo and collapse/close icon */}
          <div className="flex items-center justify-between px-2 py-3 mb-4 border-b border-[#2c3754]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img 
                src="/app_logo.png" 
                alt="Aqua Point Logo" 
                className="w-8 h-8 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(0,188,225,0.5)]" 
              />
              {(!collapsed || isMobileOpen) && (
                <span className="text-lg font-black tracking-wider text-white uppercase whitespace-nowrap">
                  AQUA<span className="text-[#00BCE1]"> POINT</span>
                </span>
              )}
            </div>

            {/* Desktop Collapse Button */}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:block p-1.5 rounded-lg text-[#A0AEC0] hover:text-white hover:bg-[#141b2d] cursor-pointer transition-colors shrink-0"
              title="Toggle Desktop Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-[#A0AEC0] hover:text-white hover:bg-[#141b2d] cursor-pointer transition-colors shrink-0"
              title="Close Mobile Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grouped Menu Section Headers */}
          <nav className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                {(!collapsed || isMobileOpen) && (
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#A0AEC0] px-3 mb-2">
                    {group.groupTitle}
                  </h4>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const badgeCount = getBadgeCount(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`group flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#3e4396] text-white shadow-lg shadow-[#3e4396]/40 font-bold border-l-4 border-[#00BCE1]'
                          : 'text-[#A0AEC0] hover:text-white hover:bg-[#141b2d]/60'
                      }`}
                      title={collapsed && !isMobileOpen ? item.name : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 transition-colors ${
                          isActive ? 'text-[#00BCE1]' : 'text-[#A0AEC0] group-hover:text-white'
                        }`} />
                        {(!collapsed || isMobileOpen) && <span>{item.name}</span>}
                      </div>

                      {(!collapsed || isMobileOpen) && (
                        badgeCount > 0 ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40">
                            {badgeCount}
                          </span>
                        ) : isActive ? (
                          <ChevronRight className="w-4 h-4 text-[#00BCE1]" />
                        ) : null
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Action: Logout Button */}
        <div className="pt-4 mt-auto border-t border-[#2c3754]">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 transition-all duration-200 cursor-pointer shadow-lg group ${
              collapsed && !isMobileOpen ? 'justify-center px-0' : 'justify-start'
            }`}
            title={collapsed && !isMobileOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0 text-red-400 group-hover:scale-110 transition-transform" />
            {(!collapsed || isMobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
