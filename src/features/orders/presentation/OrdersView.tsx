'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Loader2,
  CheckCircle2,
  PackageCheck,
  CreditCard,
  ChevronDown,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  subscribeToOrders, 
  updateOrderStatusInFirestore, 
  OrderDoc 
} from '@/core/services/firebase';
import TableFooter from '@/core/components/TableFooter';

export default function OrdersView() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderDoc | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: OrderDoc['status'], paymentStatus?: OrderDoc['paymentStatus']) => {
    try {
      await updateOrderStatusInFirestore(id, newStatus, paymentStatus);
      setSuccessMessage(`Order status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(`Failed to update order status: ${err.message}`);
    }
  };

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');

  const filteredOrders = orders.filter(order => {
    const matchesStatus = activeStatus === 'All' ? true : order.status === activeStatus;
    const matchesPayment =
      paymentFilter === 'All'
        ? true
        : paymentFilter === 'Paid'
        ? order.paymentStatus === 'Paid'
        : order.paymentStatus !== 'Paid';

    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesPayment && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Page Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Orders
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-slate-800 text-[#00BCE1] border border-[#00BCE1]/30">
            {filteredOrders.length} orders
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => alert('Order management ready for checkout processing!')}
            className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" /> + Create New Order
          </button>
        </div>
      </div>

      {/* Unified Filter Bar (Single Consolidated Bar) */}
      <div className="p-4 backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 rounded-2xl shadow-xl shadow-cyan-950/10 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            {/* In-Page Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search order by customer, ID, phone or email..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-[#00BCE1] focus:ring-1 focus:ring-[#00BCE1]/50 transition-all"
              />
            </div>

            {/* Payment Filter Dropdown */}
            <div className="relative w-full sm:w-48">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-[#00BCE1] focus:ring-1 focus:ring-[#00BCE1]/50 cursor-pointer transition-all"
              >
                <option value="All">All Payment Status</option>
                <option value="Paid">Paid Only</option>
                <option value="Unpaid">Unpaid / Pending COD</option>
              </select>
            </div>
          </div>

          {/* View Toggles */}
          <div className="flex items-center justify-between sm:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800/80">
            <div className="p-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40 shadow-[0_0_10px_rgba(0,188,225,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40 shadow-[0_0_10px_rgba(0,188,225,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Fulfillment Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/60 scrollbar-none">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => {
            const count = status === 'All' ? orders.length : orders.filter(o => o.status === status).length;
            const isActive = activeStatus === status;
            return (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#00BCE1] text-slate-950 font-bold shadow-[0_0_15px_rgba(0,188,225,0.4)]'
                    : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800/80 hover:border-[#00BCE1]/30'
                }`}
              >
                <span>{status}</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                  isActive ? 'bg-slate-950/25 text-slate-950' : 'bg-white/10 text-[#00BCE1]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading customer orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm ? 'No orders match your filter criteria.' : 'There are currently no orders.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-[#1f2940] border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 bg-[#1f2940]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#2c3754] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#4cceac]">
                      {order.id.substring(0, 10)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{order.customerName}</div>
                      <div className="text-[11px] text-slate-400">{order.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-300 max-w-xs truncate">{order.address}</td>
                    <td className="py-4 px-4 font-bold text-white">${order.totalAmount}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-[#4cceac]/20 text-[#4cceac] border-[#4cceac]/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        order.status === 'Delivered'
                          ? 'bg-[#4cceac]/20 text-[#4cceac] border-[#4cceac]/40'
                          : order.status === 'Shipped'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : order.status === 'Processing'
                          ? 'bg-[#00BCE1]/20 text-[#00BCE1] border-[#00BCE1]/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter totalItems={filteredOrders.length} />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-[#1f2940] border border-slate-700/50 rounded-2xl p-6 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-[#141b2d] border border-slate-700 text-[#4cceac] font-mono font-bold text-xs">
                    {order.id.substring(0, 12)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {order.customerName}
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-[#4cceac]/20 text-[#4cceac] border-[#4cceac]/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {order.paymentMethod} • {order.paymentStatus}
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#4cceac]" /> {order.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#4cceac]" /> {order.address} {order.district ? `(${order.district})` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fulfillment Status Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 mr-1 font-medium">Fulfillment Status:</span>
                  {(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(order.id, st, st === 'Delivered' ? 'Paid' : undefined)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        order.status === st
                          ? st === 'Pending'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : st === 'Processing'
                            ? 'bg-[#00BCE1]/20 text-[#00BCE1] border-[#00BCE1]/40'
                            : st === 'Shipped'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : st === 'Delivered'
                            ? 'bg-[#4cceac]/20 text-[#4cceac] border-[#4cceac]/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-[#141b2d] text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Content Summary */}
              <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <span className="text-xs font-semibold text-slate-400 block">Ordered Items:</span>
                  {order.items && order.items.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-[#141b2d] border border-slate-700/50 text-xs text-white">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="w-7 h-7 rounded-lg object-cover" />
                          )}
                          <span>{item.name} <strong className="text-[#4cceac]">x{item.quantity}</strong></span>
                          <span className="text-slate-400">(${item.price})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">Standard RO Water Purifier Package</div>
                  )}
                </div>

                <div className="text-right flex flex-col items-end justify-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/50">
                  <span className="text-xs text-slate-400">Total Order Amount</span>
                  <div className="text-xl font-extrabold text-white">
                    ${order.totalAmount}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
