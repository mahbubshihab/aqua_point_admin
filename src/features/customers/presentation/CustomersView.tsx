'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Gift, 
  Award, 
  Phone, 
  Mail, 
  Calendar, 
  Copy, 
  Check, 
  Droplets,
  ShoppingBag,
  UserPlus,
  LayoutGrid,
  List,
  X,
  Package,
  Loader2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import TableFooter from '@/core/components/TableFooter';
import { useSearch } from '@/core/context/SearchContext';
import { 
  subscribeToCustomers, 
  subscribeToCustomerCustomProducts, 
  CustomerDoc, 
  CustomProductDoc 
} from '@/core/services/firebase';

const DEMO_FALLBACK_CUSTOMERS: CustomerDoc[] = [
  {
    id: 'CUST-001',
    name: 'Sarah Ahmed',
    email: 'sarah.ahmed@example.com',
    phone: '01711-223344',
    joinedDate: '12 Jan 2025',
    rewardPoints: 1250,
    referralCode: 'AQUA-SARAH1',
    activeDevices: 3,
    totalOrders: 14,
  },
  {
    id: 'CUST-002',
    name: 'Tanvir Hossain',
    email: 'tanvir.h@example.com',
    phone: '01822-334455',
    joinedDate: '04 Feb 2025',
    rewardPoints: 480,
    referralCode: 'AQUA-TANVIR2',
    activeDevices: 1,
    totalOrders: 4,
  },
  {
    id: 'CUST-003',
    name: 'Nusrat Jahan',
    email: 'nusrat.j@example.com',
    phone: '01933-445566',
    joinedDate: '28 Feb 2025',
    rewardPoints: 920,
    referralCode: 'AQUA-NUSRAT3',
    activeDevices: 2,
    totalOrders: 9,
  },
  {
    id: 'CUST-004',
    name: 'Mahmudur Rahman',
    email: 'mahmud.r@example.com',
    phone: '01644-556677',
    joinedDate: '10 Mar 2025',
    rewardPoints: 310,
    referralCode: 'AQUA-MAHMUD4',
    activeDevices: 1,
    totalOrders: 2,
  },
  {
    id: 'CUST-005',
    name: 'Kimberly Chen',
    email: 'kim.chen@example.com',
    phone: '01555-667788',
    joinedDate: '15 Apr 2025',
    rewardPoints: 600,
    referralCode: 'AQUA-KIM60',
    activeDevices: 2,
    totalOrders: 6,
  },
];

const MOCK_CUSTOM_PRODUCTS: Record<string, CustomProductDoc[]> = {
  'CUST-001': [
    {
      id: 'cp-101',
      name: 'Custom RO 8-Stage Alkaline Unit',
      model: 'CUST-SARAH-RO8',
      price: 24500,
      description: 'Customized high-recovery membrane with mineralizer cart for home lab testing.',
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'cp-102',
      name: 'Industrial Dual UV Sterilization Skid',
      model: 'CUST-SARAH-UV2',
      price: 18000,
      description: 'Stainless steel 316L housing with automated flow shutoff sensor.',
      imageUrl: 'https://images.unsplash.com/photo-1585832770485-e68a5fc88280?q=80&w=800&auto=format&fit=crop',
    }
  ],
  'CUST-003': [
    {
      id: 'cp-301',
      name: 'Under-Sink Compact Purifier System',
      model: 'CUST-NUSRAT-US',
      price: 16500,
      description: 'Custom narrow frame for small kitchen under-counter cabinet placement.',
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop',
    }
  ]
};

export default function CustomersView() {
  const [customers, setCustomers] = useState<CustomerDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useSearch();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [statusFilter, setStatusFilter] = useState<'All' | 'VIP' | 'Regular'>('All');

  // Customer Profile Drawer State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDoc | null>(null);
  const [customProducts, setCustomProducts] = useState<CustomProductDoc[]>([]);
  const [loadingCustomProducts, setLoadingCustomProducts] = useState(false);

  // Subscribe to Customers from Firestore with server-side limit(15)
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToCustomers(15, (data) => {
      if (data && data.length > 0) {
        setCustomers(data);
      } else {
        setCustomers(DEMO_FALLBACK_CUSTOMERS);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Fetch Custom Products from customers/{userId}/custom_products subcollection
  useEffect(() => {
    if (!selectedCustomer) {
      setCustomProducts([]);
      return;
    }

    setLoadingCustomProducts(true);
    const unsub = subscribeToCustomerCustomProducts(selectedCustomer.id, 15, (prods) => {
      if (prods && prods.length > 0) {
        setCustomProducts(prods);
      } else {
        setCustomProducts(MOCK_CUSTOM_PRODUCTS[selectedCustomer.id] || []);
      }
      setLoadingCustomProducts(false);
    });

    return () => unsub();
  }, [selectedCustomer]);

  const copyReferral = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCustomers = customers;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Customers
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-[#141b2d] text-[#00BCE1] border border-[#2c3754]">
            {filteredCustomers.length} customers
          </span>
        </div>
        <button 
          onClick={() => alert('Customer registration form ready!')}
          className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-[#00BCE1]/25 rounded-full px-6 py-2.5 transition-all duration-300 transform active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" /> Register Customer
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#1f2940] border border-[#2c3754] shadow-xl hover:border-[#00BCE1]/60 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Total Active Users</span>
            <div className="p-2.5 rounded-xl bg-[#00BCE1]/15 text-[#00BCE1]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">1,428</p>
          <span className="text-[11px] text-[#00BCE1] font-medium mt-1 inline-block">+34 new this week</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1f2940] border border-[#2c3754] shadow-xl hover:border-[#00BCE1]/60 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Reward Points Issued</span>
            <div className="p-2.5 rounded-xl bg-[#f59e0b]/15 text-[#f59e0b]">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-300 mt-2">342,900 <span className="text-xs text-slate-400 font-normal">PTS</span></p>
          <span className="text-[11px] text-[#00BCE1] font-medium mt-1 inline-block">Aqua Loyalty Program</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1f2940] border border-[#2c3754] shadow-xl hover:border-[#00BCE1]/60 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Referrals Converted</span>
            <div className="p-2.5 rounded-xl bg-[#00BCE1]/15 text-[#00BCE1]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#00BCE1] mt-2">584</p>
          <span className="text-[11px] text-[#00BCE1] font-medium mt-1 inline-block">+18% growth month-over-month</span>
        </div>
      </div>

      {/* Unified Filter Bar */}
      <div className="p-4 bg-[#1f2940] border border-[#2c3754] rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            <div className="relative w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 focus:outline-none focus:border-[#00BCE1] cursor-pointer transition-all"
              >
                <option value="All">All Loyalty Tiers</option>
                <option value="VIP">VIP Gold (800+ PTS)</option>
                <option value="Regular">Standard Member</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#2c3754]">
            <div className="p-1 rounded-xl bg-[#141b2d] border border-[#2c3754] flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40'
                    : 'text-[#A0AEC0] hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40'
                    : 'text-[#A0AEC0] hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loyalty Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#2c3754] scrollbar-none">
          {(['All', 'VIP', 'Regular'] as const).map((tier) => {
            const label = tier === 'All' ? 'All Customers' : tier === 'VIP' ? 'VIP Gold Tier' : 'Standard Tier';
            const count = customers.length;
            const isActive = statusFilter === tier;
            return (
              <button
                key={tier}
                onClick={() => setStatusFilter(tier)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#00BCE1] text-[#141b2d] font-bold shadow-md'
                    : 'bg-[#141b2d] text-[#A0AEC0] border border-[#2c3754] hover:text-white'
                }`}
              >
                <span>{label}</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                  isActive ? 'bg-[#141b2d]/25 text-[#141b2d]' : 'bg-white/10 text-[#00BCE1]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customers Table / Grid */}
      {loading ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#00BCE1] animate-spin" />
          <p className="text-xs text-[#A0AEC0]">Loading customers from Cloud Firestore...</p>
        </div>
      ) : (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-[#2c3754]">
                <tr>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Referral Code</th>
                  <th className="py-3.5 px-4">Reward Points</th>
                  <th className="py-3.5 px-4">Devices</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2c3754] bg-[#1f2940]">
                {filteredCustomers.map((cust) => (
                  <tr 
                    key={cust.id} 
                    onClick={() => setSelectedCustomer(cust)}
                    className="hover:bg-[#2c3754]/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3e4396] to-[#00BCE1] flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {cust.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="group-hover:text-[#00BCE1] transition-colors">{cust.name}</div>
                        <div className="text-[10px] text-[#00BCE1] font-mono">{cust.id}</div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="w-3 h-3 text-[#00BCE1]" /> {cust.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-[#A0AEC0] text-[11px] mt-0.5">
                        <Phone className="w-3 h-3 text-[#00BCE1]" /> {cust.phone}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyReferral(cust.referralCode);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#141b2d] border border-[#2c3754] text-[#00BCE1] font-mono text-[11px] flex items-center gap-1.5 hover:border-[#00BCE1] transition-all cursor-pointer"
                        title="Click to copy referral code"
                      >
                        {cust.referralCode}
                        {copiedCode === cust.referralCode ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-[#A0AEC0]" />
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-4 font-bold text-amber-300">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                        ⚡ {cust.rewardPoints} pts
                      </span>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-200">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-[#00BCE1]" /> {cust.activeDevices} Units
                      </span>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-200">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-400" /> {cust.totalOrders} Orders
                      </span>
                    </td>

                    <td className="py-4 px-4 text-[#A0AEC0] text-[11px]">
                      {cust.joinedDate}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="px-3 py-1.5 rounded-xl bg-[#141b2d] hover:bg-[#3e4396] text-[#00BCE1] hover:text-white border border-[#2c3754] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <span>Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter totalItems={filteredCustomers.length} />
        </div>
      )}

      {/* Customer Profile & Custom Products Modal / Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141b2d]/85 backdrop-blur-xl overflow-y-auto">
          <div className="bg-[#1f2940] border border-[#2c3754] w-full max-w-3xl rounded-3xl p-6 relative space-y-6 my-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2c3754]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3e4396] to-[#00BCE1] flex items-center justify-center text-white font-extrabold text-base shadow-lg border border-[#00BCE1]/40">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    {selectedCustomer.name}
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#141b2d] text-[#00BCE1] border border-[#2c3754]">
                      {selectedCustomer.id}
                    </span>
                  </h2>
                  <p className="text-xs text-[#A0AEC0] flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#00BCE1]" /> {selectedCustomer.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#00BCE1]" /> {selectedCustomer.phone}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-xl text-[#A0AEC0] hover:text-white hover:bg-[#141b2d] border border-[#2c3754] cursor-pointer transition-colors"
                title="Close Profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#141b2d] border border-[#2c3754]">
                <span className="text-[10px] font-medium text-[#A0AEC0] block">Reward Points</span>
                <span className="text-base font-extrabold text-amber-300 mt-0.5 block">⚡ {selectedCustomer.rewardPoints} pts</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#141b2d] border border-[#2c3754]">
                <span className="text-[10px] font-medium text-[#A0AEC0] block">Active Devices</span>
                <span className="text-base font-extrabold text-[#00BCE1] mt-0.5 block">{selectedCustomer.activeDevices} Units</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#141b2d] border border-[#2c3754]">
                <span className="text-[10px] font-medium text-[#A0AEC0] block">Total Orders</span>
                <span className="text-base font-extrabold text-blue-400 mt-0.5 block">{selectedCustomer.totalOrders} Orders</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#141b2d] border border-[#2c3754]">
                <span className="text-[10px] font-medium text-[#A0AEC0] block">Referral Code</span>
                <button
                  onClick={() => copyReferral(selectedCustomer.referralCode)}
                  className="text-xs font-mono font-bold text-[#00BCE1] mt-1 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  {selectedCustomer.referralCode}
                  {copiedCode === selectedCustomer.referralCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#A0AEC0]" />}
                </button>
              </div>
            </div>

            {/* CUSTOMER CUSTOM PRODUCTS SUBCOLLECTION SECTION */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#00BCE1]" />
                  <h3 className="text-sm font-bold text-white">Customer Custom Products</h3>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40">
                    customers/{selectedCustomer.id}/custom_products
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-300">
                  {customProducts.length} items
                </span>
              </div>

              {loadingCustomProducts ? (
                <div className="p-10 rounded-2xl bg-[#141b2d] border border-[#2c3754] text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-[#00BCE1] animate-spin mx-auto" />
                  <p className="text-xs text-[#A0AEC0]">Fetching custom products from subcollection...</p>
                </div>
              ) : customProducts.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#141b2d] border border-[#2c3754] text-center space-y-2">
                  <Droplets className="w-10 h-10 text-slate-500 mx-auto opacity-40" />
                  <h4 className="text-xs font-bold text-white">No Custom Products Found</h4>
                  <p className="text-[11px] text-[#A0AEC0] max-w-sm mx-auto">
                    This customer has not registered any custom water purifier configurations in their subcollection.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customProducts.map((prod) => (
                    <div 
                      key={prod.id}
                      className="p-4 rounded-2xl bg-[#141b2d] border border-[#2c3754] hover:border-[#00BCE1]/50 transition-all flex gap-3.5 items-start"
                    >
                      <img 
                        src={prod.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop'}
                        alt={prod.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#2c3754] shrink-0"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold text-[#00BCE1] px-2 py-0.5 rounded bg-[#1f2940] border border-[#2c3754]">
                            {prod.model || 'CUSTOM'}
                          </span>
                          <span className="text-xs font-extrabold text-white">
                            ৳{prod.price.toLocaleString()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                        {prod.description && (
                          <p className="text-[11px] text-[#A0AEC0] line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 flex items-center justify-end border-t border-[#2c3754]">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#141b2d] hover:bg-[#2c3754] text-slate-300 border border-[#2c3754] cursor-pointer transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
