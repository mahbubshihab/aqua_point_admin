'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Wrench, 
  Package, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Activity,
  Eye,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import TableFooter from '@/core/components/TableFooter';
import { db, updateServiceRequestStatusInFirestore } from '@/core/services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface ServiceRequest {
  id: string;
  customerName: string;
  phone: string;
  model: string;
  appointmentDate: string;
  problem: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Urgent' | 'Normal';
}

export default function DashboardView() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Real-time Firestore Metric States
  const [customersCount, setCustomersCount] = useState<number>(0);
  const [activeRequestsCount, setActiveRequestsCount] = useState<number>(0);
  const [urgentRequestsCount, setUrgentRequestsCount] = useState<number>(0);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [categoriesCount, setCategoriesCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  const [loading, setLoading] = useState({
    customers: true,
    requests: true,
    products: true,
    categories: true,
    revenue: true,
  });

  // 1. TOTAL CUSTOMERS (collection: 'customers')
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'customers'),
      (snapshot) => {
        setCustomersCount(snapshot.docs.length);
        setLoading((prev) => ({ ...prev, customers: false }));
      },
      (error) => {
        console.error('Error in customers snapshot:', error);
        setLoading((prev) => ({ ...prev, customers: false }));
      }
    );
    return () => unsub();
  }, []);

  // 2. ACTIVE REQUESTS & Recent Activity Table (collection: 'service_requests' / fallback 'services')
  useEffect(() => {
    let unsubPrimary: (() => void) | null = null;
    let unsubFallback: (() => void) | null = null;

    const processDocs = (docs: any[]) => {
      let activeCount = 0;
      let urgentCount = 0;

      const parsed: (ServiceRequest & { createdAtMillis: number })[] = docs.map((docSnap) => {
        const data = docSnap.data();
        const rawStatus = (data.status || 'Pending').toString();
        let normStatus: ServiceRequest['status'] = 'Pending';
        const upper = rawStatus.toUpperCase();
        if (upper === 'PENDING') normStatus = 'Pending';
        else if (upper === 'IN PROGRESS' || upper === 'IN_PROGRESS' || upper === 'CONFIRMED') normStatus = 'In Progress';
        else if (upper === 'COMPLETED') normStatus = 'Completed';

        const priority: ServiceRequest['priority'] =
          data.priority === 'Urgent' || data.priority === 'High' ? 'Urgent' : 'Normal';

        if (normStatus === 'Pending' || normStatus === 'In Progress') {
          activeCount++;
          if (priority === 'Urgent') {
            urgentCount++;
          }
        }

        let formattedDate = 'N/A';
        if (data.appointmentDate || data.preferredDate) {
          formattedDate = (data.appointmentDate || data.preferredDate).toString();
        } else if (data.createdAt?.toDate) {
          formattedDate = data.createdAt.toDate().toISOString().split('T')[0];
        }

        let createdAtMillis = 0;
        if (data.createdAt?.toDate) {
          createdAtMillis = data.createdAt.toDate().getTime();
        } else if (typeof data.createdAt === 'number') {
          createdAtMillis = data.createdAt;
        }

        return {
          id: docSnap.id,
          customerName: data.customerName || data.name || 'Anonymous Customer',
          phone: data.phone || 'N/A',
          model: data.machineModel || data.model || data.machineType || 'RO Pure System',
          appointmentDate: formattedDate,
          problem: data.problemDetails || data.problem || data.problemDescription || 'General Servicing',
          status: normStatus,
          priority: priority,
          createdAtMillis,
        };
      });

      parsed.sort((a, b) => b.createdAtMillis - a.createdAtMillis);

      setActiveRequestsCount(activeCount);
      setUrgentRequestsCount(urgentCount);
      setRequests(parsed.slice(0, 10));
      setLoading((prev) => ({ ...prev, requests: false }));
    };

    unsubPrimary = onSnapshot(
      collection(db, 'service_requests'),
      (snapshot) => {
        if (snapshot.docs.length > 0) {
          processDocs(snapshot.docs);
        } else {
          unsubFallback = onSnapshot(
            collection(db, 'services'),
            (fallbackSnap) => {
              processDocs(fallbackSnap.docs);
            },
            (err) => {
              console.error('Error in services fallback snapshot:', err);
              setLoading((prev) => ({ ...prev, requests: false }));
            }
          );
        }
      },
      (error) => {
        console.warn('Error listening to service_requests, trying services collection:', error);
        unsubFallback = onSnapshot(
          collection(db, 'services'),
          (fallbackSnap) => {
            processDocs(fallbackSnap.docs);
          },
          (err) => {
            console.error('Error in services fallback snapshot:', err);
            setLoading((prev) => ({ ...prev, requests: false }));
          }
        );
      }
    );

    return () => {
      if (unsubPrimary) unsubPrimary();
      if (unsubFallback) unsubFallback();
    };
  }, []);

  // 3. PRODUCTS CATALOG (collection: 'products')
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        setProductsCount(snapshot.docs.length);
        setLoading((prev) => ({ ...prev, products: false }));
      },
      (error) => {
        console.error('Error in products snapshot:', error);
        setLoading((prev) => ({ ...prev, products: false }));
      }
    );
    return () => unsub();
  }, []);

  // 4. LIVE CATEGORIES COUNT (collection: 'categories')
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        setCategoriesCount(snapshot.docs.length);
        setLoading((prev) => ({ ...prev, categories: false }));
      },
      (error) => {
        console.error('Error in categories snapshot:', error);
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    );
    return () => unsub();
  }, []);

  // 5. TOTAL REVENUE (collection: 'orders')
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        let rev = 0;
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const st = (data.status || '').toString().toLowerCase();
          const paySt = (data.paymentStatus || '').toString().toLowerCase();
          if (st === 'completed' || st === 'delivered' || paySt === 'paid') {
            rev += Number(data.totalAmount || data.amount || data.total || 0);
          }
        });
        setTotalRevenue(rev);
        setLoading((prev) => ({ ...prev, revenue: false }));
      },
      (error) => {
        console.error('Error in orders snapshot:', error);
        setLoading((prev) => ({ ...prev, revenue: false }));
      }
    );
    return () => unsub();
  }, []);

  const toggleStatus = async (id: string) => {
    const target = requests.find((req) => req.id === id);
    if (!target) return;

    const nextStatus: ServiceRequest['status'] =
      target.status === 'Pending' ? 'In Progress' : target.status === 'In Progress' ? 'Completed' : 'Pending';

    // Optimistically update local state
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: nextStatus } : req))
    );

    try {
      await updateServiceRequestStatusInFirestore(id, nextStatus);
    } catch (err) {
      console.warn('Could not sync status update to Firestore:', err);
    }
  };

  const filteredRequests = requests.filter((req) =>
    statusFilter === 'All' ? true : req.status === statusFilter
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
          Dashboard
        </h1>
      </div>

      {/* Top Row: 4 Sleek KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Customers */}
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:border-[#00BCE1]/60 hover:-translate-y-1 transition-all duration-300 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Customers</span>
            <div className="bg-[#00BCE1]/15 text-[#00BCE1] p-3 rounded-xl border border-[#00BCE1]/30 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-[#00BCE1]" />
            </div>
          </div>
          <div className="mt-4">
            {loading.customers ? (
              <div className="flex items-center gap-2 my-1">
                <Loader2 className="w-5 h-5 animate-spin text-[#00BCE1]" />
                <span className="text-sm font-semibold text-slate-400 animate-pulse">Syncing...</span>
              </div>
            ) : (
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
                {customersCount.toLocaleString()}
              </h3>
            )}
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#00BCE1]/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 2: Active Requests */}
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:border-[#00BCE1]/60 hover:-translate-y-1 transition-all duration-300 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Requests</span>
            <div className="bg-[#00BCE1]/15 text-[#00BCE1] p-3 rounded-xl border border-[#00BCE1]/30 group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5 text-[#00BCE1]" />
            </div>
          </div>
          <div className="mt-4">
            {loading.requests ? (
              <div className="flex items-center gap-2 my-1">
                <Loader2 className="w-5 h-5 animate-spin text-[#00BCE1]" />
                <span className="text-sm font-semibold text-slate-400 animate-pulse">Syncing...</span>
              </div>
            ) : (
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
                {activeRequestsCount.toLocaleString()}
              </h3>
            )}
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#00BCE1]/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 3: Products Catalog */}
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:border-[#00BCE1]/60 hover:-translate-y-1 transition-all duration-300 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Products Catalog</span>
            <div className="bg-[#00BCE1]/15 text-[#00BCE1] p-3 rounded-xl border border-[#00BCE1]/30 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5 text-[#00BCE1]" />
            </div>
          </div>
          <div className="mt-4">
            {loading.products ? (
              <div className="flex items-center gap-2 my-1">
                <Loader2 className="w-5 h-5 animate-spin text-[#00BCE1]" />
                <span className="text-sm font-semibold text-slate-400 animate-pulse">Syncing...</span>
              </div>
            ) : (
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
                {productsCount.toLocaleString()}
              </h3>
            )}
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#00BCE1]/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:border-[#00BCE1]/60 hover:-translate-y-1 transition-all duration-300 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="bg-[#00BCE1]/15 text-[#00BCE1] p-3 rounded-xl border border-[#00BCE1]/30 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5 text-[#00BCE1]" />
            </div>
          </div>
          <div className="mt-4">
            {loading.revenue ? (
              <div className="flex items-center gap-2 my-1">
                <Loader2 className="w-5 h-5 animate-spin text-[#00BCE1]" />
                <span className="text-sm font-semibold text-slate-400 animate-pulse">Syncing...</span>
              </div>
            ) : (
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
                ৳{totalRevenue.toLocaleString()}
              </h3>
            )}
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#00BCE1]/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Bottom Row: Service Requests Table */}
      <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#2c3754] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#00BCE1]" /> Service Requests
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141b2d] border border-[#2c3754]">
            {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  statusFilter === status
                    ? 'bg-[#3e4396] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-[#2c3754]">
              <tr>
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Machine Model</th>
                <th className="py-3.5 px-4">Appointment</th>
                <th className="py-3.5 px-4">Issue Description</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2c3754]/50 bg-[#1f2940]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                    No Service Requests Found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#2c3754]/30 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#00BCE1]">
                      {req.id}
                      {req.priority === 'Urgent' && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          URGENT
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{req.customerName}</div>
                      <div className="text-[11px] text-slate-400">{req.phone}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-200">{req.model}</td>
                    <td className="py-4 px-4 text-slate-400">{req.appointmentDate}</td>
                    <td className="py-4 px-4 text-slate-300 max-w-xs truncate">{req.problem}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleStatus(req.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          req.status === 'Pending'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : req.status === 'In Progress'
                            ? 'bg-blue-500/20 text-[#00BCE1] border-[#00BCE1]/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                        title="Click to toggle status"
                      >
                        {req.status === 'Pending' && <Clock className="w-3 h-3 text-amber-400" />}
                        {req.status === 'In Progress' && <Activity className="w-3 h-3 text-blue-400 animate-spin" />}
                        {req.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {req.status}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href="/requests"
                        className="p-2 rounded-xl bg-[#141b2d] border border-[#2c3754] hover:border-[#00BCE1]/50 text-slate-300 hover:text-[#00BCE1] inline-flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#00BCE1]" /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TableFooter totalItems={filteredRequests.length} showEntriesInfo={false} />
      </div>
    </div>
  );
}
