'use client';

import { useState } from 'react';
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
  Eye
} from 'lucide-react';
import Link from 'next/link';

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

export default function DashboardPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const toggleStatus = (id: string) => {
    setRequests(prev =>
      prev.map(req => {
        if (req.id === id) {
          const nextStatus: ServiceRequest['status'] =
            req.status === 'Pending' ? 'In Progress' : req.status === 'In Progress' ? 'Completed' : 'Pending';
          return { ...req, status: nextStatus };
        }
        return req;
      })
    );
  };

  const filteredRequests = requests.filter(req => 
    statusFilter === 'All' ? true : req.status === statusFilter
  );

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/requests"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all flex items-center gap-2"
          >
            <Wrench className="w-3.5 h-3.5" /> View Queue ({requests.filter(r => r.status !== 'Completed').length})
          </Link>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Customers */}
        <div className="glass-panel glass-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customers</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">1,428</h3>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 2: Service Requests */}
        <div className="glass-panel glass-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Service Requests</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              {requests.filter(r => r.status !== 'Completed').length}
            </h3>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 3: Products Catalog */}
        <div className="glass-panel glass-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Products Catalog</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">3,892</h3>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 4: Total Revenue */}
        <div className="glass-panel glass-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">৳142,850</h3>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Analytics Overview & TDS Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water Quality Index */}
        <div className="lg:col-span-2 glass-panel-cyan rounded-2xl p-6 relative">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Water Quality Index
            </h2>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Optimal Grade A
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Output TDS</p>
              <p className="text-2xl font-extrabold text-cyan-400 mt-1">42 <span className="text-xs text-slate-400 font-normal">PPM</span></p>
              <span className="text-[10px] text-emerald-400 font-medium">Pure Mineral Water</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Filter Lifespan</p>
              <p className="text-2xl font-extrabold text-blue-400 mt-1">88 <span className="text-xs text-slate-400 font-normal">%</span></p>
              <span className="text-[10px] text-slate-400 font-medium">Next cycle in 45 days</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Daily Purified Water</p>
              <p className="text-2xl font-extrabold text-white mt-1">45.2 <span className="text-xs text-slate-400 font-normal">kL</span></p>
              <span className="text-[10px] text-cyan-400 font-medium">Peak demand high</span>
            </div>
          </div>

          {/* Graphical Purity Meter Simulation */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-medium">TDS Purity Level (0 - 150 PPM scale)</span>
              <span className="text-cyan-400 font-bold">42 PPM (Ideal Drinking Range)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-white/10 p-0.5">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 w-[28%] shadow-[0_0_10px_#00E5FF]" />
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
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
              <Zap className="w-4 h-4 text-cyan-400" /> Equipment Status
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
                  <span className="text-xs font-semibold text-slate-200">Active RO Units</span>
                </div>
                <span className="text-xs font-bold text-white">3,710</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
                  <span className="text-xs font-semibold text-slate-200">Maintenance Warnings</span>
                </div>
                <span className="text-xs font-bold text-amber-300">142</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#EF4444]" />
                  <span className="text-xs font-semibold text-slate-200">Filter Replacement Due</span>
                </div>
                <span className="text-xs font-bold text-rose-300">40</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <Link 
              href="/products" 
              className="w-full py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-2 transition-all"
            >
              Manage Products & Devices <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Service Requests Interactive Table */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" /> Recent Service Requests
            </h2>
            <p className="text-xs text-slate-400 mt-1">Click status badge to update request state in real-time</p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/10">
            {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(0,229,255,0.15)]'
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
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-white/10">
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
            <tbody className="divide-y divide-white/5">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No requests found matching "{statusFilter}" filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-cyan-500/[0.03] transition-colors">
                    <td className="py-4 px-4 font-mono font-semibold text-cyan-400">
                      {req.id}
                      {req.priority === 'Urgent' && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          URGENT
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{req.customerName}</div>
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
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25 shadow-[0_0_10px_rgba(0,229,255,0.15)]'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                        }`}
                        title="Click to toggle status"
                      >
                        {req.status === 'Pending' && <Clock className="w-3 h-3 text-amber-400" />}
                        {req.status === 'In Progress' && <Activity className="w-3 h-3 text-cyan-400 animate-spin" />}
                        {req.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {req.status}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href="/requests"
                        className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-400/40 text-slate-400 hover:text-cyan-400 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
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
