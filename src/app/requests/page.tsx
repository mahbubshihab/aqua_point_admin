'use client';

import { useState } from 'react';
import { 
  Wrench, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Phone, 
  MapPin, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface ServiceItem {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  machineModel: string;
  appointmentDate: string;
  appointmentTime: string;
  problemDetails: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Urgent' | 'High' | 'Normal';
  technician: string;
  tdsReading: number;
}

const initialServiceItems: ServiceItem[] = [
  {
    id: 'REQ-9041',
    customerName: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Suite 4B',
    machineModel: 'AquaPurify Pro 900',
    appointmentDate: '2026-08-08',
    appointmentTime: '14:00 PM',
    problemDetails: 'Filter replacement alert & low flow rate (Output TDS reading 110 PPM).',
    status: 'Pending',
    priority: 'Urgent',
    technician: 'Alex Rivera (Technician Lead)',
    tdsReading: 110,
  },
  {
    id: 'REQ-9040',
    customerName: 'Marcus Vance',
    phone: '+1 (555) 876-5432',
    address: '1204 Grand Avenue, Apt 12',
    machineModel: 'AquaUltra UV Pure',
    appointmentDate: '2026-08-08',
    appointmentTime: '16:30 PM',
    problemDetails: 'TDS sensor calibration required following municipal pipe maintenance.',
    status: 'In Progress',
    priority: 'Normal',
    technician: 'David Miller',
    tdsReading: 48,
  },
  {
    id: 'REQ-9039',
    customerName: 'Elena Rostova',
    phone: '+1 (555) 345-6789',
    address: '88 Ocean Boulevard, Floor 15',
    machineModel: 'AquaSmart Dispenser X1',
    appointmentDate: '2026-08-07',
    appointmentTime: '11:00 AM',
    problemDetails: 'Annual scheduled maintenance & UV lamp sterilization test.',
    status: 'Completed',
    priority: 'Normal',
    technician: 'Sarah Lin',
    tdsReading: 35,
  },
  {
    id: 'REQ-9038',
    customerName: 'David Kim',
    phone: '+1 (555) 987-6543',
    address: '450 Pine Tree Lane',
    machineModel: 'AquaAlkaline System HD',
    appointmentDate: '2026-08-09',
    appointmentTime: '10:00 AM',
    problemDetails: 'Cooling tank temperature check and alkaline cartridge refresh.',
    status: 'Pending',
    priority: 'Normal',
    technician: 'Unassigned',
    tdsReading: 40,
  },
  {
    id: 'REQ-9037',
    customerName: 'Aisha Rahman',
    phone: '+1 (555) 654-3210',
    address: '302 Sunset Heights',
    machineModel: 'AquaPurify Pro 900',
    appointmentDate: '2026-08-07',
    appointmentTime: '15:00 PM',
    problemDetails: 'Leakage around pre-filter housing union joint.',
    status: 'Completed',
    priority: 'Urgent',
    technician: 'Alex Rivera (Technician Lead)',
    tdsReading: 42,
  },
];

export default function ServiceRequestsPage() {
  const [items, setItems] = useState<ServiceItem[]>(initialServiceItems);
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const updateStatus = (id: string, newStatus: ServiceItem['status']) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const filteredItems = items.filter(item => {
    const matchesStatus = activeStatus === 'All' ? true : item.status === activeStatus;
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.machineModel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Service Request Queue <Sparkles className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch technicians, update service appointment statuses, and resolve machine issues.
          </p>
        </div>

        {/* Quick Queue Summary Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{items.filter(i => i.status === 'Pending').length} Pending</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>{items.filter(i => i.status === 'In Progress').length} In Progress</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, request ID, or machine model..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeStatus === status
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Request Queue Cards / Detailed List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">
            No service requests found for your selected query.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel glass-card-hover rounded-2xl p-6 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs">
                    {item.id}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {item.customerName}
                      {item.priority === 'Urgent' && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
                          URGENT
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-cyan-400" /> {item.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" /> {item.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Selector Pills */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 mr-1 font-medium">Update Status:</span>
                  {(['Pending', 'In Progress', 'Completed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateStatus(item.id, st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        item.status === st
                          ? st === 'Pending'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : st === 'In Progress'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Request Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-400 font-semibold block mb-1">Machine & Telemetry</span>
                  <div className="font-bold text-white text-sm">{item.machineModel}</div>
                  <div className="text-cyan-400 mt-1">Output TDS: {item.tdsReading} PPM</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-400 font-semibold block mb-1">Appointment Slot</span>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" /> {item.appointmentDate}
                  </div>
                  <div className="text-slate-300 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> {item.appointmentTime}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-400 font-semibold block mb-1">Assigned Dispatch</span>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" /> {item.technician}
                  </div>
                  <div className="text-emerald-400 mt-1">Route Optimized</div>
                </div>
              </div>

              {/* Problem Description */}
              <div className="mt-3 p-3 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/20 text-xs">
                <span className="font-bold text-cyan-300">Problem Description: </span>
                <span className="text-slate-300">{item.problemDetails}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
