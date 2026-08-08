'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
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
  List,
  Plus,
  Search,
  Trash2,
  X,
  Minus,
  Package
} from 'lucide-react';
import { 
  subscribeToOrders, 
  updateOrderStatusInFirestore, 
  addOrderToFirestore,
  subscribeToProducts,
  OrderDoc,
  OrderItemDoc,
  ProductDoc
} from '@/core/services/firebase';
import TableFooter from '@/core/components/TableFooter';
import { useSearch } from '@/core/context/SearchContext';

export default function OrdersView() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const { searchTerm } = useSearch();
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');

  // Create Order Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  // Product Search & Selection state
  const [availableProducts, setAvailableProducts] = useState<ProductDoc[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductDoc | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedItems, setSelectedItems] = useState<OrderItemDoc[]>([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  // Payment & Order Status state
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash on Delivery');
  const [paymentStatus, setPaymentStatus] = useState<OrderDoc['paymentStatus']>('Pending');
  const [orderStatus, setOrderStatus] = useState<OrderDoc['status']>('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToOrders(activeStatus, 50, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeStatus]);

  // Load products when modal is open
  useEffect(() => {
    if (isCreateModalOpen) {
      const unsubscribeProds = subscribeToProducts('All', 100, (data) => {
        setAvailableProducts(data);
      });
      return () => unsubscribeProds();
    }
  }, [isCreateModalOpen]);

  const handleUpdateStatus = async (id: string, newStatus: OrderDoc['status'], newPaymentStatus?: OrderDoc['paymentStatus']) => {
    try {
      await updateOrderStatusInFirestore(id, newStatus, newPaymentStatus);
      setSuccessMessage(`Order status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(`Failed to update order status: ${err.message}`);
    }
  };

  // Matching products based on search query
  const matchingProducts = availableProducts.filter((p) => {
    if (!productSearchQuery.trim()) return true;
    const q = productSearchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.model && p.model.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  const handleAddItemToOrder = () => {
    if (!selectedProduct || selectedQuantity < 1) return;

    setSelectedItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === selectedProduct.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + selectedQuantity,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            quantity: selectedQuantity,
            imageUrl: selectedProduct.imageUrl || '',
          },
        ];
      }
    });

    setSelectedProduct(null);
    setProductSearchQuery('');
    setSelectedQuantity(1);
    setIsSearchDropdownOpen(false);
  };

  const handleUpdateItemQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setSelectedItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculatedTotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setProductSearchQuery('');
    setSelectedProduct(null);
    setSelectedQuantity(1);
    setSelectedItems([]);
    setPaymentMethod('Cash on Delivery');
    setPaymentStatus('Pending');
    setOrderStatus('Pending');
    setIsSearchDropdownOpen(false);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleSaveOrder = async () => {
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Please enter customer phone');
      return;
    }
    if (!deliveryAddress.trim()) {
      alert('Please enter delivery address');
      return;
    }
    if (selectedItems.length === 0) {
      alert('Please add at least one product to the order');
      return;
    }

    try {
      setIsSubmitting(true);
      await addOrderToFirestore({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: deliveryAddress.trim(),
        items: selectedItems,
        totalAmount: calculatedTotal,
        paymentMethod,
        paymentStatus,
        status: orderStatus,
      });

      setSuccessMessage('Order created successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      closeCreateModal();
    } catch (err: any) {
      console.error('Error creating order:', err);
      alert(`Failed to save order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter orders by payment and search term
  const filteredOrders = orders.filter((order) => {
    if (paymentFilter === 'Paid' && order.paymentStatus !== 'Paid') return false;
    if (paymentFilter === 'Unpaid' && order.paymentStatus === 'Paid') return false;

    if (searchTerm && searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const nameMatch = order.customerName.toLowerCase().includes(q);
      const phoneMatch = order.phone.toLowerCase().includes(q);
      const addressMatch = order.address.toLowerCase().includes(q);
      const idMatch = order.id.toLowerCase().includes(q);
      return nameMatch || phoneMatch || addressMatch || idMatch;
    }
    return true;
  });

  // Visible Count (starts at 10)
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [activeStatus, paymentFilter, searchTerm]);

  const paginatedOrders = filteredOrders.slice(0, visibleCount);

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
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-[#141b2d] text-[#00BCE1] border border-[#2c3754]">
            {filteredOrders.length} orders
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-[#00BCE1]/25 rounded-full px-6 py-2.5 transition-all duration-300 transform active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" /> + Create New Order
          </button>
        </div>
      </div>

      {/* Unified Filter Bar */}
      <div className="p-4 bg-[#1f2940] border border-[#2c3754] rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            {/* Payment Filter Dropdown */}
            <div className="relative w-full sm:w-48">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 focus:outline-none focus:border-[#00BCE1] cursor-pointer transition-all"
              >
                <option value="All">All Payment Status</option>
                <option value="Paid">Paid Only</option>
                <option value="Unpaid">Unpaid / Pending COD</option>
              </select>
            </div>
          </div>

          {/* View Toggles */}
          <div className="flex items-center justify-between sm:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#2c3754]">
            <div className="p-1 rounded-xl bg-[#141b2d] border border-[#2c3754] flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#3e4396] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#3e4396] text-white shadow-md'
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
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#2c3754] scrollbar-none">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => {
            const count = orders.filter(o => o.status === 'Pending').length;
            const isActive = activeStatus === status;
            return (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#00BCE1] text-[#141b2d] font-bold shadow-[0_0_15px_rgba(0,188,225,0.4)]'
                    : 'bg-[#141b2d] text-slate-400 hover:text-white border border-[#2c3754]'
                }`}
              >
                <span>{status}</span>
                {status === 'Pending' && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    isActive ? 'bg-[#141b2d]/25 text-[#141b2d]' : 'bg-white/10 text-[#00BCE1]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#00BCE1] animate-spin" />
          <p className="text-xs text-[#A0AEC0]">Loading customer orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-[#A0AEC0] mx-auto" />
          <h3 className="text-base font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-[#A0AEC0] max-w-sm mx-auto">
            {searchTerm ? 'No orders match your filter criteria.' : 'There are currently no orders.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-[#2c3754]">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2c3754] bg-[#1f2940]">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#2c3754] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#00BCE1]">
                      {order.id.substring(0, 10)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{order.customerName}</div>
                      <div className="text-[11px] text-[#A0AEC0]">{order.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-300 max-w-xs truncate">{order.address}</td>
                    <td className="py-4 px-4 font-bold text-white">৳{order.totalAmount.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-[#00BCE1]/20 text-[#00BCE1] border-[#00BCE1]/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        order.status === 'Delivered'
                          ? 'bg-[#00BCE1]/20 text-[#00BCE1] border-[#00BCE1]/40'
                          : order.status === 'Shipped'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : order.status === 'Processing'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
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
          <TableFooter 
            totalItems={filteredOrders.length} 
            visibleCount={visibleCount}
            onSeeMore={() => setVisibleCount((prev) => prev + 10)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            {paginatedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-6 transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#2c3754]">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-[#141b2d] border border-[#2c3754] text-[#00BCE1] font-mono font-bold text-xs">
                      {order.id.substring(0, 12)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {order.customerName}
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-[#00BCE1]/20 text-[#00BCE1] border-[#00BCE1]/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {order.paymentMethod} • {order.paymentStatus}
                        </span>
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#A0AEC0] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#00BCE1]" /> {order.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#00BCE1]" /> {order.address} {order.district ? `(${order.district})` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fulfillment Status Selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#A0AEC0] mr-1 font-medium">Fulfillment Status:</span>
                    {(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(order.id, st, st === 'Delivered' ? 'Paid' : undefined)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          order.status === st
                            ? 'bg-[#00BCE1] text-[#141b2d] border-[#00BCE1]'
                            : 'bg-[#141b2d] text-slate-400 border-[#2c3754] hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-2">
                    <div className="text-xs font-semibold text-slate-300 mb-2">Order Items ({order.items?.length || 0}):</div>
                    {order.items && order.items.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="px-3 py-1.5 rounded-xl bg-[#141b2d] border border-[#2c3754] text-xs text-white flex items-center gap-2">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.name} className="w-7 h-7 rounded-lg object-cover" />
                            )}
                            <span>{item.name} <strong className="text-[#00BCE1]">x{item.quantity}</strong></span>
                            <span className="text-[#A0AEC0]">(৳{item.price.toLocaleString()})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[#A0AEC0] italic">Standard RO Water Purifier Package</div>
                    )}
                  </div>

                  <div className="text-right flex flex-col items-end justify-center pt-2 md:pt-0 border-t md:border-t-0 border-[#2c3754]">
                    <span className="text-xs text-[#A0AEC0]">Total Order Amount</span>
                    <div className="text-xl font-extrabold text-white">
                      ৳{order.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-lg">
            <TableFooter 
              totalItems={filteredOrders.length} 
              visibleCount={visibleCount}
              onSeeMore={() => setVisibleCount((prev) => prev + 10)}
            />
          </div>
        </div>
      )}

      {/* CREATE ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#2c3754] flex items-center justify-between bg-[#141b2d]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#00BCE1]/10 text-[#00BCE1]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">New Order</h2>
                </div>
              </div>
              <button
                onClick={closeCreateModal}
                className="p-2 rounded-xl bg-[#141b2d] hover:bg-[#2c3754] text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Customer Details Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#00BCE1] flex items-center gap-2">
                  <User className="w-4 h-4" /> Customer
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Name *</label>
                    <input
                      type="text"
                      placeholder="Customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00BCE1] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone *</label>
                    <input
                      type="text"
                      placeholder="+880..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00BCE1] transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Address *</label>
                    <textarea
                      rows={2}
                      placeholder="Delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00BCE1] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Product Search & Item Selector */}
              <div className="space-y-3 pt-4 border-t border-[#2c3754]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#00BCE1] flex items-center gap-2">
                  <Package className="w-4 h-4" /> Products
                </h3>
                
                <div className="p-4 rounded-2xl bg-[#141b2d] border border-[#2c3754] space-y-4">
                  <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
                    {/* Product Search Input with dropdown */}
                    <div className="relative flex-1">
                      <label className="block text-slate-300 font-semibold mb-1">Product</label>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search product..."
                          value={productSearchQuery}
                          onChange={(e) => {
                            setProductSearchQuery(e.target.value);
                            setIsSearchDropdownOpen(true);
                          }}
                          onFocus={() => setIsSearchDropdownOpen(true)}
                          className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#1f2940] border border-[#2c3754] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00BCE1] transition-all"
                        />
                        {selectedProduct && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProduct(null);
                              setProductSearchQuery('');
                            }}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Dropdown list of matching products */}
                      {isSearchDropdownOpen && matchingProducts.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-60 overflow-y-auto bg-[#1f2940] border border-[#2c3754] rounded-xl shadow-2xl divide-y divide-[#2c3754]">
                          {matchingProducts.map((prod) => (
                            <div
                              key={prod.id}
                              onClick={() => {
                                setSelectedProduct(prod);
                                setProductSearchQuery(prod.name);
                                setIsSearchDropdownOpen(false);
                              }}
                              className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-[#2c3754] transition-colors ${
                                selectedProduct?.id === prod.id ? 'bg-[#3e4396]/40 border-l-4 border-[#00BCE1]' : ''
                              }`}
                            >
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="w-10 h-10 rounded-lg object-cover bg-[#141b2d] shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-white truncate">{prod.name}</div>
                                <div className="text-[11px] text-[#A0AEC0] flex items-center gap-2">
                                  <span>{prod.category}</span>
                                  {prod.model && <span className="font-mono text-[#00BCE1]">• {prod.model}</span>}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-bold text-[#00BCE1]">৳{prod.price.toLocaleString()}</div>
                                <div className="text-[10px] text-slate-400">{prod.stockStatus}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity Counter Input */}
                    <div className="w-full md:w-36">
                      <label className="block text-slate-300 font-semibold mb-1">Quantity</label>
                      <div className="flex items-center rounded-xl bg-[#1f2940] border border-[#2c3754] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                          className="p-2.5 text-slate-400 hover:text-white hover:bg-[#2c3754] transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={selectedQuantity}
                          onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full text-center font-bold text-white bg-transparent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedQuantity((q) => q + 1)}
                          className="p-2.5 text-slate-400 hover:text-white hover:bg-[#2c3754] transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Add to Order Button */}
                    <button
                      type="button"
                      onClick={handleAddItemToOrder}
                      disabled={!selectedProduct}
                      className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        selectedProduct
                          ? 'bg-[#00BCE1] text-[#141b2d] hover:bg-cyan-300 shadow-md'
                          : 'bg-[#2c3754] text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-4 h-4" /> Add to Order
                    </button>
                  </div>

                  {selectedProduct && (
                    <div className="p-2.5 rounded-xl bg-[#00BCE1]/10 border border-[#00BCE1]/20 flex items-center justify-between text-xs text-cyan-200">
                      <span>Selected: <strong>{selectedProduct.name}</strong> (৳{selectedProduct.price.toLocaleString()})</span>
                      <span className="font-bold">Line Subtotal: ৳{(selectedProduct.price * selectedQuantity).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Selected Items Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Items ({selectedItems.length})</span>
                  </div>
                  {selectedItems.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[#141b2d] border border-dashed border-[#2c3754] text-center text-slate-400">
                      No items added yet.
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#2c3754] overflow-hidden bg-[#141b2d]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#1f2940] text-slate-300 font-bold uppercase text-[10px] border-b border-[#2c3754]">
                          <tr>
                            <th className="py-2.5 px-3">Product</th>
                            <th className="py-2.5 px-3">Price</th>
                            <th className="py-2.5 px-3">Qty</th>
                            <th className="py-2.5 px-3">Subtotal</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2c3754]">
                          {selectedItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-[#1f2940]/50 transition-colors">
                              <td className="py-2.5 px-3 flex items-center gap-2.5">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-[#2c3754] flex items-center justify-center text-slate-400">
                                    <ShoppingBag className="w-4 h-4" />
                                  </div>
                                )}
                                <span className="font-bold text-white">{item.name}</span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-200">৳{item.price.toLocaleString()}</td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemQuantity(idx, item.quantity - 1)}
                                    className="p-1 rounded bg-[#2c3754] text-slate-300 hover:text-white cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2 font-bold text-white">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemQuantity(idx, item.quantity + 1)}
                                    className="p-1 rounded bg-[#2c3754] text-slate-300 hover:text-white cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-bold text-[#00BCE1]">
                                ৳{(item.price * item.quantity).toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                                  title="Remove Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment & Order Status Section */}
              <div className="space-y-4 pt-4 border-t border-[#2c3754]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#00BCE1] flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Payment
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 focus:outline-none focus:border-[#00BCE1] transition-all cursor-pointer"
                    >
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="bKash">bKash</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 focus:outline-none focus:border-[#00BCE1] transition-all cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Order Status</label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 focus:outline-none focus:border-[#00BCE1] transition-all cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                {/* Total Amount Summary Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#141b2d] to-[#1f2940] border border-[#2c3754] flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-medium block">Total Amount (৳)</span>
                    <span className="text-slate-300 text-[11px]">{selectedItems.length} items selected</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#00BCE1]">৳{calculatedTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#2c3754] flex items-center justify-end gap-3 bg-[#141b2d]/50">
              <button
                type="button"
                onClick={closeCreateModal}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-[#2c3754] text-slate-300 hover:text-white hover:bg-[#2c3754] font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOrder}
                disabled={isSubmitting || !customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim() || selectedItems.length === 0}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSubmitting || !customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim() || selectedItems.length === 0
                    ? 'bg-[#2c3754] text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-[#00BCE1]/25'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Order...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Save Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
