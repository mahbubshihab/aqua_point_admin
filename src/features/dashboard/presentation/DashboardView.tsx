'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Wrench, 
  Package, 
  CreditCard, 
  ArrowUpRight, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Zap,
  Eye,
  Sparkles,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
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

const initialRequests: ServiceRequest[] = [
  {
    id: 'REQ-9041',
    customerName: 'Sarah Jenkins',
    phone: '+880 1711-234567',
    model: 'AquaPurify Pro 900',
    appointmentDate: '2026-08-08 14:00',
    problem: 'Filter replacement alert & low flow rate',
    status: 'Pending',
    priority: 'Urgent',
  },
  {
    id: 'REQ-9040',
    customerName: 'Marcus Vance',
    phone: '+880 1819-876543',
    model: 'AquaUltra UV Pure',
    appointmentDate: '2026-08-08 16:30',
    problem: 'TDS sensor calibration required',
    status: 'In Progress',
    priority: 'Normal',
  },
  {
    id: 'REQ-9039',
    customerName: 'Elena Rostova',
    phone: '+880 1912-345678',
    model: 'AquaSmart Dispenser X1',
    appointmentDate: '2026-08-07 11:00',
    problem: 'Annual maintenance & UV sterilizer test',
    status: 'Completed',
    priority: 'Normal',
  },
  {
    id: 'REQ-9038',
    customerName: 'David Kim',
    phone: '+880 1611-987654',
    model: 'AquaAlkaline System HD',
    appointmentDate: '2026-08-09 10:00',
    problem: 'Cooling tank temperature check',
    status: 'Pending',
    priority: 'Normal',
  },
  {
    id: 'REQ-9037',
    customerName: 'Aisha Rahman',
    phone: '+880 1755-654321',
    model: 'AquaPurify Pro 900',
    appointmentDate: '2026-08-07 15:00',
    problem: 'Leakage around pre-filter housing',
    status: 'Completed',
    priority: 'Urgent',
  },
];

export default function DashboardView() {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
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

  // 2. ACTIVE REQUESTS & Service Table (collection: 'services')
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        let activeCount = 0;
        let urgentCount = 0;

        const fetchedRequests: ServiceRequest[] = snapshot.docs.map((docSnap) => {
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

          return {
            id: docSnap.id,
            customerName: data.customerName || data.name || 'Anonymous Customer',
            phone: data.phone || 'N/A',
            model: data.machineModel || data.model || 'RO Pure System',
            appointmentDate: data.appointmentDate || data.preferredDate || new Date().toISOString().split('T')[0],
            problem: data.problemDetails || data.problem || 'General Servicing',
            status: normStatus,
            priority: priority,
          };
        });

        setActiveRequestsCount(activeCount);
        setUrgentRequestsCount(urgentCount);
        if (snapshot.docs.length > 0) {
          setRequests(fetchedRequests);
        } else {
          setRequests([]);
        }
        setLoading((prev) => ({ ...prev, requests: false }));
      },
      (error) => {
        console.error('Error in services snapshot:', error);
        setLoading((prev) => ({ ...prev, requests: false }));
      }
    );
    return () => unsub();
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
    const target = requests.find(req => req.id === id);
    if (!target) return;

    const nextStatus: ServiceRequest['status'] =
      target.status === 'Pending' ? 'In Progress' : target.status === 'In Progress' ? 'Completed' : 'Pending';

    // Optimistically update local state
    setRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status: nextStatus } : req))
    );

    try {
      await updateServiceRequestStatusInFirestore(id, nextStatus);
    } catch (err) {
      console.warn('Could not sync status update to Firestore:', err);
    }
  };

  const filteredRequests = requests.filter(req => 
    statusFilter === 'All' ? true : req.status === statusFilter
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00BCE1]/10 text-[#00BCE1] border border-[#00BCE1]/30 shadow-[0_0_15px_rgba(0,188,225,0.2)] mb-2 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-[#00BCE1]" /> REAL-TIME METRICS
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-[#00BCE1] bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System overview and operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/requests"
            className="px-4.5 py-2.5 text-xs font-bold rounded-2xl bg-[#00BCE1]/15 text-[#00BCE1] border border-[#00BCE1]/40 shadow-[0_0_20px_rgba(0,188,225,0.15)] hover:bg-[#00BCE1]/25 hover:border-[#00BCE1]/70 hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
          >
            <Wrench className="w-4 h-4 text-[#00BCE1]" /> View Queue ({loading.requests ? '...' : activeRequestsCount})
          </Link>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Customers */}
        <div className="backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-[#00BCE1]/40 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-cyan-950/10 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Customers</span>
            <div className="p-2.5 rounded-xl bg-[#00BCE1]/10 border border-[#00BCE1]/20 text-[#00BCE1] group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading.customers ? (
              <div className="flex items-center gap-2 my-1">
                <Loader2 className="w-5 h-5 animate-spin text-[#00BCE1]" />
                <span className="text-sm font-semibold text-slate-400 animate-pulse">Syncing...</span>
              </div>
            ) : (
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {customersCount.toLocaleString()}
              </h3>
            )}
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
              {customersCount === 0 ? '0 registered customers' : '↑ Live from Firestore'}
            </span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#00BCE1]/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 2: Active Requests */}
        <div className="backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-cyan-950/10 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Requests</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading.requests ? (
              <div className="flex items-center gap-2 my-1">
                <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                <span className="text-sm font-semibold text-slate-400 animate-pulse">Syncing...</span>
              </div>
            ) : (
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {activeRequestsCount.toLocaleString()}
              </h3>
            )}
            <span className="text-[11px] text-amber-300 font-semibold mt-1 inline-block">
              {urgentRequestsCount > 0 ? `${urgentRequestsCount} Urgent Priority` : '0 Urgent Priority'}
            </span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 3: Products Catalog */}
        <div className="backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-cyan-950/10 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Products Catalog</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading.products ? (
              <div className="flex items-center gap-2 my-1">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <span className="text-sm font-semibold text-slate-400 animate-pulse">Syncing...</span>
              </div>
            ) : (
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {productsCount.toLocaleString()}
              </h3>
            )}
            <span className="text-[11px] text-blue-300 font-semibold mt-1 inline-block">
              {loading.categories ? '...' : `${categoriesCount} Categories Live`}
            </span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 4: Total Revenue */}
        <div className="backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-cyan-950/10 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading.revenue ? (
              <div className="flex items-center gap-2 my-1">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                <span className="text-sm font-semibold text-slate-400 animate-pulse">Syncing...</span>
              </div>
            ) : (
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                ৳{totalRevenue.toLocaleString()}
              </h3>
            )}
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
              Completed orders total
            </span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* System Overview & TDS Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water Quality Index */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-slate-900/80 border border-[#00BCE1]/30 rounded-2xl p-6 relative shadow-2xl shadow-cyan-950/20">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00BCE1]" /> Water Quality Index
            </h2>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#00BCE1]/15 text-[#00BCE1] border border-[#00BCE1]/30 shadow-[0_0_10px_rgba(0,188,225,0.2)]">
              Optimal Grade A
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Output TDS</p>
              <p className="text-2xl font-extrabold text-[#00BCE1] mt-1">42 <span className="text-xs text-slate-400 font-normal">PPM</span></p>
              <span className="text-[10px] text-emerald-400 font-medium">Pure Mineral Water</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Filter Lifespan</p>
              <p className="text-2xl font-extrabold text-blue-400 mt-1">88 <span className="text-xs text-slate-400 font-normal">%</span></p>
              <span className="text-[10px] text-slate-400 font-medium">Next cycle in 45 days</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daily Purified Water</p>
              <p className="text-2xl font-extrabold text-white mt-1">45.2 <span className="text-xs text-slate-400 font-normal">kL</span></p>
              <span className="text-[10px] text-[#00BCE1] font-medium">Peak demand high</span>
            </div>
          </div>

          {/* Graphical Purity Meter Simulation */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-medium">TDS Purity Level (0 - 150 PPM scale)</span>
              <span className="text-[#00BCE1] font-bold">42 PPM (Ideal Drinking Range)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800 p-0.5 shadow-inner">
              <div className="h-full rounded-full bg-gradient-to-r from-[#00BCE1] via-blue-500 to-indigo-500 w-[28%] shadow-[0_0_12px_#00BCE1]" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 (Ultra Pure)</span>
              <span>50 (Ideal)</span>
              <span>100 (Acceptable)</span>
              <span>150+ (Filter Alert)</span>
            </div>
          </div>
        </div>

        {/* Equipment Status */}
        <div className="backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
              <Zap className="w-4 h-4 text-[#00BCE1]" /> Equipment Status
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
                  <span className="text-xs font-semibold text-slate-200">Active RO Units</span>
                </div>
                <span className="text-xs font-bold text-white">{productsCount > 0 ? productsCount : 3710}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
                  <span className="text-xs font-semibold text-slate-200">Maintenance Warnings</span>
                </div>
                <span className="text-xs font-bold text-amber-300">142</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#EF4444]" />
                  <span className="text-xs font-semibold text-slate-200">Filter Replacement Due</span>
                </div>
                <span className="text-xs font-bold text-rose-300">40</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <Link 
              href="/products" 
              className="w-full py-3 text-xs font-bold rounded-xl bg-slate-950 hover:bg-[#00BCE1]/15 text-[#00BCE1] border border-[#00BCE1]/30 flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
            >
              Manage Products & Devices <ArrowUpRight className="w-3.5 h-3.5 text-[#00BCE1]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Service Requests Interactive Table */}
      <div className="backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#00BCE1]" /> Recent Service Requests
            </h2>
            <p className="text-xs text-slate-400 mt-1">Click status badge to update request state in real-time</p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
            {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  statusFilter === status
                    ? 'bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40 shadow-[0_0_10px_rgba(0,188,225,0.2)]'
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
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/60">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No requests found matching "{statusFilter}" filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#00BCE1]/[0.04] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#00BCE1]">
                      {req.id}
                      {req.priority === 'Urgent' && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
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
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                            : req.status === 'In Progress'
                            ? 'bg-[#00BCE1]/15 text-[#00BCE1] border-[#00BCE1]/40 hover:bg-[#00BCE1]/25 shadow-[0_0_10px_rgba(0,188,225,0.2)]'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                        }`}
                        title="Click to toggle status"
                      >
                        {req.status === 'Pending' && <Clock className="w-3 h-3 text-amber-400" />}
                        {req.status === 'In Progress' && <Activity className="w-3 h-3 text-[#00BCE1] animate-spin" />}
                        {req.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {req.status}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href="/requests"
                        className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-[#00BCE1]/40 text-slate-400 hover:text-[#00BCE1] inline-flex items-center gap-1 transition-all"
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
      </div>
    </div>
  );
}
