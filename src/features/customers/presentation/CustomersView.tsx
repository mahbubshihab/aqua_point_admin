'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  Copy, 
  Check, 
  Droplets,
  ShoppingBag,
  UserPlus,
  X,
  Package,
  Loader2,
  ChevronRight,
  MapPin,
  Search
} from 'lucide-react';
import TableFooter from '@/core/components/TableFooter';
import { useSearch } from '@/core/context/SearchContext';
import { 
  subscribeToCustomers, 
  subscribeToCustomerCustomProducts, 
  subscribeToCustomerAddresses,
  CustomerDoc, 
  CustomProductDoc 
} from '@/core/services/firebase';

export default function CustomersView() {
  const [customers, setCustomers] = useState<CustomerDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useSearch();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  // Customer Profile Drawer State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDoc | null>(null);
  const [customProducts, setCustomProducts] = useState<CustomProductDoc[]>([]);
  const [loadingCustomProducts, setLoadingCustomProducts] = useState(false);
  const [customerAddresses, setCustomerAddresses] = useState<{ id: string; address: string }[]>([]);

  // Subscribe to Customers real-time from Cloud Firestore
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToCustomers(100, (data) => {
      setCustomers(data || []);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Fetch Custom Products and Addresses from sub-collections when selected
  useEffect(() => {
    if (!selectedCustomer) {
      setCustomProducts([]);
      setCustomerAddresses([]);
      return;
    }

    setLoadingCustomProducts(true);
    const unsubProds = subscribeToCustomerCustomProducts(selectedCustomer.id, 50, (prods) => {
      setCustomProducts(prods || []);
      setLoadingCustomProducts(false);
    });

    const unsubAddrs = subscribeToCustomerAddresses(selectedCustomer.id, (addrs) => {
      setCustomerAddresses(addrs || []);
    });

    return () => {
      unsubProds();
      unsubAddrs();
    };
  }, [selectedCustomer]);

  const copyReferral = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter customers by search term
  const filteredCustomers = customers.filter((cust) => {
    const query = (searchTerm || '').toLowerCase().trim();
    if (!query) return true;
    return (
      (cust.name && cust.name.toLowerCase().includes(query)) ||
      (cust.phone && cust.phone.toLowerCase().includes(query)) ||
      (cust.email && cust.email.toLowerCase().includes(query)) ||
      (cust.address && cust.address.toLowerCase().includes(query)) ||
      (cust.id && cust.id.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Ultra-Minimal Page Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Customers
          </h1>
          <span className="px-3 py-1 text-xs font-mono font-semibold rounded-full bg-[#141b2d] text-[#00BCE1] border border-[#2c3754] shadow-sm">
            {filteredCustomers.length} Total
          </span>
        </div>
      </div>

      {/* Customer List Table */}
      {loading ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#00BCE1] animate-spin" />
          <p className="text-xs text-[#A0AEC0]">Connecting to Cloud Firestore customers collection...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-500 mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-white">No Customers Found</h3>
          <p className="text-xs text-[#A0AEC0]">
            {searchTerm ? `No customer records match "${searchTerm}".` : 'No customers exist in the Cloud Firestore database.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-[#2c3754]">
                <tr>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4 text-center">Total Orders</th>
                  <th className="py-3.5 px-4">Join Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2c3754] bg-[#1f2940]">
                {filteredCustomers.slice(0, visibleCount).map((cust) => (
                  <tr 
                    key={cust.id} 
                    onClick={() => setSelectedCustomer(cust)}
                    className="hover:bg-[#2c3754]/60 transition-colors cursor-pointer group"
                  >
                    {/* Customer Name */}
                    <td className="py-4 px-4 font-bold text-white flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3e4396] to-[#00BCE1] flex items-center justify-center text-white font-extrabold text-xs shadow-md shrink-0">
                        {cust.name ? cust.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CU'}
                      </div>
                      <div>
                        <div className="group-hover:text-[#00BCE1] transition-colors">{cust.name}</div>
                        <div className="text-[10px] text-[#00BCE1] font-mono">{cust.id}</div>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="py-4 px-4 text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#00BCE1] shrink-0" />
                        <span>{cust.phone || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#00BCE1] shrink-0" />
                        <span className="truncate max-w-[200px]">{cust.email || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-4 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#00BCE1] shrink-0" />
                        <span className="truncate max-w-[220px] text-slate-300" title={cust.address}>
                          {cust.address || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Total Orders */}
                    <td className="py-4 px-4 text-center font-bold text-white">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#141b2d] border border-[#2c3754] text-[#00BCE1]">
                        <ShoppingBag className="w-3 h-3 text-blue-400" />
                        {cust.totalOrders || 0}
                      </span>
                    </td>

                    {/* Join Date */}
                    <td className="py-4 px-4 text-[#A0AEC0] text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#00BCE1] shrink-0" />
                        <span>{cust.joinedDate || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#141b2d] hover:bg-[#3e4396] text-[#00BCE1] hover:text-white border border-[#2c3754] text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
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
          <TableFooter 
            totalItems={filteredCustomers.length} 
            visibleCount={visibleCount}
            onSeeMore={() => setVisibleCount((prev) => prev + 10)}
          />
        </div>
      )}

      {/* Customer Profile & Custom Products Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141b2d]/85 backdrop-blur-xl overflow-y-auto">
          <div className="bg-[#1f2940] border border-[#2c3754] w-full max-w-3xl rounded-3xl p-6 relative space-y-6 my-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2c3754]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3e4396] to-[#00BCE1] flex items-center justify-center text-white font-extrabold text-base shadow-lg border border-[#00BCE1]/40">
                  {selectedCustomer.name ? selectedCustomer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CU'}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    {selectedCustomer.name}
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#141b2d] text-[#00BCE1] border border-[#2c3754]">
                      {selectedCustomer.id}
                    </span>
                  </h2>
                  <p className="text-xs text-[#A0AEC0] flex flex-wrap items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#00BCE1]" /> {selectedCustomer.email || 'N/A'}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#00BCE1]" /> {selectedCustomer.phone || 'N/A'}</span>
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

            {/* Customer Information Summary Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#141b2d] border border-[#2c3754]">
                <span className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block">Total Orders</span>
                <span className="text-sm font-extrabold text-[#00BCE1] mt-0.5 block">{selectedCustomer.totalOrders || 0} Orders</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#141b2d] border border-[#2c3754]">
                <span className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block">Reward Points</span>
                <span className="text-sm font-extrabold text-amber-400 mt-0.5 block">{selectedCustomer.rewardPoints || 0} pts</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#141b2d] border border-[#2c3754]">
                <span className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block">Joined Date</span>
                <span className="text-xs font-semibold text-white mt-1 block">{selectedCustomer.joinedDate || 'N/A'}</span>
              </div>
            </div>

            {/* CUSTOMER SAVED ADDRESSES SECTION (From sub-collection) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00BCE1]" />
                  <h3 className="text-sm font-bold text-white">Saved Addresses</h3>
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40">
                  {customerAddresses.length || (selectedCustomer.address ? 1 : 0)} saved
                </span>
              </div>

              {customerAddresses.length === 0 ? (
                selectedCustomer.address ? (
                  <div className="p-3.5 rounded-2xl bg-[#141b2d] border border-[#2c3754] flex items-center justify-between gap-3 text-xs text-white">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-[#00BCE1] shrink-0" />
                      <span className="font-medium truncate">{selectedCustomer.address}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                      Primary
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#141b2d] border border-[#2c3754] text-xs text-[#A0AEC0]">
                    No addresses saved yet.
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  {customerAddresses.map((addr, idx) => (
                    <div key={addr.id || idx} className="p-3.5 rounded-2xl bg-[#141b2d] border border-[#2c3754] flex items-center justify-between gap-3 text-xs text-white">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-4 h-4 text-[#00BCE1] shrink-0" />
                        <span className="font-medium truncate">{addr.address}</span>
                      </div>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CUSTOMER CUSTOM PRODUCTS SECTION */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#00BCE1]" />
                  <h3 className="text-sm font-bold text-white">Custom Products</h3>
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40">
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
                  <h4 className="text-xs font-bold text-white">No Custom Products Registered</h4>
                  <p className="text-[11px] text-[#A0AEC0] max-w-sm mx-auto">
                    This customer has not registered any custom water purifier configurations in Cloud Firestore.
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
                            ৳{prod.price ? prod.price.toLocaleString() : 0}
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
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#141b2d] hover:bg-[#2c3754] text-slate-[#300] text-slate-300 border border-[#2c3754] cursor-pointer transition-colors"
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
