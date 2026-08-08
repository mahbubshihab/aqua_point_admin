'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, Bell, Settings, X, LogOut, ChevronDown, User, Shield,
  Package, ShoppingCart, Users, Wrench, FolderTree, Star, Image as ImageIcon,
  ArrowUpRight, Sparkles
} from 'lucide-react';
import { useSearch } from '@/core/context/SearchContext';
import { 
  logoutAdmin,
  subscribeToProducts,
  subscribeToOrders,
  subscribeToCustomers,
  subscribeToServiceRequests,
  subscribeToCategories,
  subscribeToBanners,
  subscribeToReviews,
  ProductDoc,
  OrderDoc,
  CustomerDoc,
  ServiceRequestDoc,
  CategoryDoc,
  BannerDoc,
  ReviewDoc
} from '@/core/services/firebase';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  categoryBadge: string;
  badgeStyle: string;
  iconStyle: string;
  iconType: 'product' | 'order' | 'customer' | 'service' | 'category' | 'banner' | 'review';
  url: string;
}

export default function Header() {
  const { searchTerm, setSearchTerm } = useSearch();
  const router = useRouter();
  const pathname = usePathname();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Firestore real-time cached lists for instant autocomplete response
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [customers, setCustomers] = useState<CustomerDoc[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestDoc[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [banners, setBanners] = useState<BannerDoc[]>([]);
  const [reviews, setReviews] = useState<ReviewDoc[]>([]);

  // Route-awareness configuration
  const isSearchDisabled = pathname === '/settings' || pathname === '/login';

  const getSearchPlaceholder = (path: string) => {
    if (path.startsWith('/products')) return 'Search products & global...';
    if (path.startsWith('/orders')) return 'Search orders & global...';
    if (path.startsWith('/customers')) return 'Search customers & global...';
    if (path.startsWith('/service-requests') || path.startsWith('/requests')) return 'Search service requests & global...';
    if (path.startsWith('/reviews')) return 'Search reviews & global...';
    if (path.startsWith('/banners')) return 'Search banners & global...';
    if (path.startsWith('/categories')) return 'Search categories & global...';
    if (path.startsWith('/settings')) return 'Search inactive on Settings';
    return 'Search Aqua Point...';
  };

  // Real-time listener subscriptions on component mount
  useEffect(() => {
    const unsubProducts = subscribeToProducts(50, (data) => setProducts(data));
    const unsubOrders = subscribeToOrders('All', 50, (data) => setOrders(data));
    const unsubCustomers = subscribeToCustomers(50, (data) => setCustomers(data));
    const unsubServices = subscribeToServiceRequests('All', 50, (data) => setServiceRequests(data));
    const unsubCategories = subscribeToCategories(50, (data) => setCategories(data));
    const unsubBanners = subscribeToBanners(50, (data) => setBanners(data));
    const unsubReviews = subscribeToReviews(50, (data) => setReviews(data));

    return () => {
      unsubProducts();
      unsubOrders();
      unsubCustomers();
      unsubServices();
      unsubCategories();
      unsubBanners();
      unsubReviews();
    };
  }, []);

  // Click-outside and Escape key handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Debounce search term for smooth letter-by-letter live autocomplete
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 120);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Compute live search results (at most 5 matched items, sorted by route relevance)
  const searchResults = useMemo(() => {
    const query = debouncedTerm.trim().toLowerCase();
    if (!query) return [];

    const items: SearchResultItem[] = [];

    // 1. Products
    products.forEach((p) => {
      if (
        p.name.toLowerCase().includes(query) ||
        (p.model && p.model.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      ) {
        items.push({
          id: `prod-${p.id}`,
          title: p.name,
          subtitle: `${p.category || 'Product'} • ৳${(p.price || 0).toLocaleString()}`,
          categoryBadge: 'Product',
          badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
          iconStyle: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          iconType: 'product',
          url: '/products',
        });
      }
    });

    // 2. Orders
    orders.forEach((o) => {
      const orderIdStr = o.id ? o.id.toLowerCase() : '';
      if (
        orderIdStr.includes(query) ||
        (o.customerName && o.customerName.toLowerCase().includes(query)) ||
        (o.phone && o.phone.toLowerCase().includes(query)) ||
        (o.address && o.address.toLowerCase().includes(query)) ||
        (o.status && o.status.toLowerCase().includes(query))
      ) {
        items.push({
          id: `ord-${o.id}`,
          title: `Order #${o.id.slice(-6).toUpperCase()}`,
          subtitle: `${o.customerName} • ৳${(o.totalAmount || 0).toLocaleString()} • ${o.status}`,
          categoryBadge: 'Order',
          badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
          iconStyle: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          iconType: 'order',
          url: '/orders',
        });
      }
    });

    // 3. Customers
    customers.forEach((c) => {
      if (
        (c.name && c.name.toLowerCase().includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.phone && c.phone.toLowerCase().includes(query)) ||
        (c.referralCode && c.referralCode.toLowerCase().includes(query))
      ) {
        items.push({
          id: `cust-${c.id}`,
          title: c.name || 'Customer',
          subtitle: `${c.phone || c.email || 'Registered User'} • ${c.rewardPoints || 0} pts`,
          categoryBadge: 'Customer',
          badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
          iconStyle: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          iconType: 'customer',
          url: '/customers',
        });
      }
    });

    // 4. Service Requests
    serviceRequests.forEach((s) => {
      if (
        (s.customerName && s.customerName.toLowerCase().includes(query)) ||
        (s.phone && s.phone.toLowerCase().includes(query)) ||
        (s.machineModel && s.machineModel.toLowerCase().includes(query)) ||
        (s.status && s.status.toLowerCase().includes(query)) ||
        s.id.toLowerCase().includes(query)
      ) {
        items.push({
          id: `serv-${s.id}`,
          title: s.machineModel || 'Service Request',
          subtitle: `${s.customerName} • ${s.phone} • ${s.status}`,
          categoryBadge: 'Service',
          badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
          iconStyle: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          iconType: 'service',
          url: '/service-requests',
        });
      }
    });

    // 5. Categories
    categories.forEach((cat) => {
      if (
        cat.name.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query))
      ) {
        items.push({
          id: `cat-${cat.id}`,
          title: cat.name,
          subtitle: `${cat.productCount || 0} Products in category`,
          categoryBadge: 'Category',
          badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
          iconStyle: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          iconType: 'category',
          url: '/categories',
        });
      }
    });

    // 6. Reviews
    reviews.forEach((r) => {
      if (
        (r.customerName && r.customerName.toLowerCase().includes(query)) ||
        (r.comment && r.comment.toLowerCase().includes(query)) ||
        (r.location && r.location.toLowerCase().includes(query))
      ) {
        items.push({
          id: `rev-${r.id}`,
          title: `${r.customerName || 'Customer'}'s Review`,
          subtitle: `"${r.comment ? r.comment.slice(0, 35) : 'Review'}" • Rating: ${r.rating || 5}★`,
          categoryBadge: 'Review',
          badgeStyle: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
          iconStyle: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
          iconType: 'review',
          url: '/reviews',
        });
      }
    });

    // 7. Banners
    banners.forEach((b) => {
      const bannerTitle = b.position ? `Banner (${b.position})` : 'Promotional Banner';
      if (
        bannerTitle.toLowerCase().includes(query) ||
        b.position.toLowerCase().includes(query)
      ) {
        items.push({
          id: `ban-${b.id}`,
          title: bannerTitle,
          subtitle: `Position: ${b.position} • Status: ${b.isActive ? 'Active' : 'Inactive'}`,
          categoryBadge: 'Banner',
          badgeStyle: 'bg-pink-500/20 text-pink-300 border-pink-400/30',
          iconStyle: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
          iconType: 'banner',
          url: '/banners',
        });
      }
    });

    // Priority Sort based on active route
    items.sort((a, b) => {
      let aIsCurrentRoute = false;
      let bIsCurrentRoute = false;

      if (pathname.startsWith('/products') && a.categoryBadge === 'Product') aIsCurrentRoute = true;
      if (pathname.startsWith('/products') && b.categoryBadge === 'Product') bIsCurrentRoute = true;

      if (pathname.startsWith('/orders') && a.categoryBadge === 'Order') aIsCurrentRoute = true;
      if (pathname.startsWith('/orders') && b.categoryBadge === 'Order') bIsCurrentRoute = true;

      if (pathname.startsWith('/customers') && a.categoryBadge === 'Customer') aIsCurrentRoute = true;
      if (pathname.startsWith('/customers') && b.categoryBadge === 'Customer') bIsCurrentRoute = true;

      if ((pathname.startsWith('/service-requests') || pathname.startsWith('/requests')) && a.categoryBadge === 'Service') aIsCurrentRoute = true;
      if ((pathname.startsWith('/service-requests') || pathname.startsWith('/requests')) && b.categoryBadge === 'Service') bIsCurrentRoute = true;

      if (pathname.startsWith('/categories') && a.categoryBadge === 'Category') aIsCurrentRoute = true;
      if (pathname.startsWith('/categories') && b.categoryBadge === 'Category') bIsCurrentRoute = true;

      if (pathname.startsWith('/reviews') && a.categoryBadge === 'Review') aIsCurrentRoute = true;
      if (pathname.startsWith('/reviews') && b.categoryBadge === 'Review') bIsCurrentRoute = true;

      if (pathname.startsWith('/banners') && a.categoryBadge === 'Banner') aIsCurrentRoute = true;
      if (pathname.startsWith('/banners') && b.categoryBadge === 'Banner') bIsCurrentRoute = true;

      if (aIsCurrentRoute && !bIsCurrentRoute) return -1;
      if (!aIsCurrentRoute && bIsCurrentRoute) return 1;
      return 0;
    });

    return items.slice(0, 5);
  }, [debouncedTerm, products, orders, customers, serviceRequests, categories, banners, reviews, pathname]);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    try {
      await logoutAdmin();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#1f2940] border-b border-[#2c3754] px-6 flex items-center justify-between shadow-lg">
      {/* Left Corner: User Profile Badge Dropdown & Route-Aware Search Bar */}
      <div className="flex items-center gap-6">
        {/* User Profile Badge Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#141b2d]/60 transition-colors cursor-pointer group focus:outline-none"
            title="User Profile Menu"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3e4396] to-[#00BCE1] flex items-center justify-center text-white font-extrabold text-sm shadow-md border-2 border-[#00BCE1]">
                MS
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00BCE1] rounded-full border-2 border-[#1f2940]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                Mahbub Shihab
                <ChevronDown className={`w-3.5 h-3.5 text-[#A0AEC0] group-hover:text-white transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </span>
              <span className="text-[10px] font-semibold bg-[#00BCE1]/15 text-[#00BCE1] border border-[#00BCE1]/30 px-2 py-0.5 rounded-full leading-tight mt-0.5 w-fit">
                Super Admin
              </span>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute top-full left-0 mt-2 w-60 rounded-2xl bg-[#1f2940] border border-[#2c3754] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2.5 border-b border-[#2c3754]">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-[#00BCE1]" />
                  <p className="text-xs font-bold text-white leading-tight">Mahbub Shihab</p>
                </div>
                <p className="text-[11px] text-[#A0AEC0] truncate">admin@aquapoint.bd</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Shield className="w-3 h-3 text-[#00BCE1]" />
                  <span className="text-[10px] font-bold text-[#00BCE1] uppercase tracking-wider">Super Administrator</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all cursor-pointer group"
                >
                  <LogOut className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Route-Aware Live Search Bar with 5-Result Autocomplete */}
        <div 
          className={`relative w-64 sm:w-80 transition-all duration-300 ${isSearchDisabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`} 
          ref={searchRef}
        >
          <input
            type="text"
            disabled={isSearchDisabled}
            placeholder={getSearchPlaceholder(pathname)}
            value={searchTerm}
            onFocus={() => {
              if (searchTerm.trim().length > 0) setIsDropdownOpen(true);
            }}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.trim().length > 0) {
                setIsDropdownOpen(true);
              } else {
                setIsDropdownOpen(false);
              }
            }}
            className="w-full pl-4 pr-9 py-1.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white placeholder-[#A0AEC0] focus:outline-none focus:border-[#00BCE1] focus:ring-1 focus:ring-[#00BCE1]/50 transition-all shadow-inner"
          />
          {searchTerm ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setIsDropdownOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-white transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0AEC0]" />
          )}

          {/* Glassmorphic 5-Result Live Autocomplete Search Dropdown */}
          {isDropdownOpen && searchTerm.trim().length > 0 && !isSearchDisabled && (
            <div className="absolute top-full left-0 mt-2 w-80 sm:w-[420px] rounded-2xl bg-[#141b2d]/95 backdrop-blur-xl border border-[#2c3754] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-[#2c3754]/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#00BCE1]" /> Live Search Results ({searchResults.length} / 5 max)
                </span>
                <span className="text-[10px] text-[#00BCE1] font-mono bg-[#00BCE1]/10 px-2 py-0.5 rounded-md border border-[#00BCE1]/20">
                  Esc to close
                </span>
              </div>

              <div className="py-1 space-y-1">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => {
                    const renderIcon = () => {
                      switch (item.iconType) {
                        case 'product': return <Package className="w-4 h-4" />;
                        case 'order': return <ShoppingCart className="w-4 h-4" />;
                        case 'customer': return <Users className="w-4 h-4" />;
                        case 'service': return <Wrench className="w-4 h-4" />;
                        case 'category': return <FolderTree className="w-4 h-4" />;
                        case 'review': return <Star className="w-4 h-4" />;
                        case 'banner': return <ImageIcon className="w-4 h-4" />;
                        default: return <Search className="w-4 h-4" />;
                      }
                    };

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push(item.url);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1f2940] transition-all cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className={`p-2 rounded-xl border ${item.iconStyle} shrink-0 group-hover:scale-105 transition-transform`}>
                            {renderIcon()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white leading-tight truncate group-hover:text-[#00BCE1] transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-[#A0AEC0] truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeStyle}`}>
                            {item.categoryBadge}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#A0AEC0] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all opacity-0 group-hover:opacity-100" />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center">
                    <Search className="w-6 h-6 text-[#A0AEC0] mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-white">No matching items found</p>
                    <p className="text-[11px] text-[#A0AEC0] mt-0.5">
                      No records match "{searchTerm.trim()}" across Cloud Firestore collections
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Corner: System Status, Notifications & Settings */}
      <div className="flex items-center gap-3">
        {/* System Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141b2d] border border-[#2c3754] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#00BCE1] animate-pulse" />
          <span className="text-[#00BCE1] text-[11px] font-bold">Cloud Node Active</span>
        </div>

        {/* Notifications Bell 🔔 */}
        <button 
          className="relative p-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] hover:border-[#00BCE1]/50 text-[#A0AEC0] hover:text-white transition-all cursor-pointer shadow-sm"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-[#A0AEC0] hover:text-white" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00BCE1] shadow-[0_0_8px_#00BCE1]" />
        </button>

        {/* Settings Gear ⚙️ */}
        <button 
          className="p-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] hover:border-[#00BCE1]/50 text-[#A0AEC0] hover:text-white transition-all cursor-pointer shadow-sm"
          title="Settings"
          onClick={() => router.push('/settings')}
        >
          <Settings className="w-4 h-4 text-[#A0AEC0] hover:text-white" />
        </button>
      </div>
    </header>
  );
}
