'use client';

import { useState, useEffect } from 'react';
import { 
  Wrench, 
  Search, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Loader2,
  CheckCircle2,
  UserPlus,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  subscribeToServiceRequests, 
  updateServiceRequestStatusInFirestore, 
  assignTechnicianInFirestore,
  ServiceRequestDoc 
} from '@/core/services/firebase';

export default function ServiceRequestsView() {
  const [items, setItems] = useState<ServiceRequestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Technician Assignment Modal State
  const [assigningItem, setAssigningItem] = useState<ServiceRequestDoc | null>(null);
  const [technicianName, setTechnicianName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToServiceRequests((data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: ServiceRequestDoc['status']) => {
    try {
      await updateServiceRequestStatusInFirestore(id, newStatus);
      setSuccessMessage(`Status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleAssignTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningItem || !technicianName.trim()) return;

    setIsUpdating(true);
    try {
      await assignTechnicianInFirestore(assigningItem.id, technicianName.trim());
      setSuccessMessage(`Technician assigned to ${technicianName.trim()}`);
      setAssigningItem(null);
      setTechnicianName('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(`Failed to assign technician: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Urgent' | 'Normal'>('All');

  const filteredItems = items.filter(item => {
    const matchesStatus = activeStatus === 'All' ? true : item.status === activeStatus;
    const matchesPriority = priorityFilter === 'All' ? true : item.priority === priorityFilter;
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.machineModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
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
            Service Requests
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-slate-800 text-[#00BCE1] border border-[#00BCE1]/30">
            {filteredItems.length} requests
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setAssigningItem(items[0] || null)}
            className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" /> Assign Technician
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
                placeholder="Search request by customer, ID, phone or model..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-[#00BCE1] focus:ring-1 focus:ring-[#00BCE1]/50 transition-all"
              />
            </div>

            {/* Priority Filter Dropdown */}
            <div className="relative w-full sm:w-44">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-[#00BCE1] focus:ring-1 focus:ring-[#00BCE1]/50 cursor-pointer transition-all"
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent Only</option>
                <option value="Normal">Normal Only</option>
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
                title="Grid Cards View"
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
                title="Table List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/60 scrollbar-none">
          {['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map((status) => {
            const count = status === 'All' ? items.length : items.filter(i => i.status === status).length;
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

      {/* Request Queue Cards / Detailed List */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading service requests...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 text-xs">
          No service requests found matching your filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel glass-card-hover rounded-2xl p-6 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs">
                    {item.id.substring(0, 12)}
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
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-0.5">
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 mr-1 font-medium">Update Status:</span>
                  {(['Pending', 'In Progress', 'Completed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(item.id, st)}
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
                  <div className="font-bold text-[#00BCE1] text-sm">{item.machineModel}</div>
                  <div className="text-cyan-400 mt-1">Output TDS: {item.tdsReading || 45} PPM</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-400 font-semibold block mb-1">Appointment Slot</span>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> {item.appointmentDate}
                  </div>
                  <div className="text-slate-300 mt-1">{item.appointmentTime}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Assigned Technician</span>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" /> {item.technician || 'Unassigned'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAssigningItem(item);
                      setTechnicianName(item.technician !== 'Unassigned' ? item.technician : '');
                    }}
                    className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 cursor-pointer flex items-center gap-1 text-[11px]"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Assign
                  </button>
                </div>
              </div>

              {/* Problem Description */}
              <div className="mt-3 p-3 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/20 text-xs">
                <span className="font-bold text-cyan-300">Problem Description: </span>
                <span className="text-slate-300">{item.problemDetails}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Technician Modal */}
      {assigningItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-cyan w-full max-w-md rounded-3xl p-6 relative space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" /> Assign Service Technician
            </h2>
            <p className="text-xs text-slate-300">
              Assign a specialist for request <span className="font-mono text-cyan-400">{assigningItem.id.substring(0, 10)}</span> ({assigningItem.customerName}).
            </p>

            <form onSubmit={handleAssignTechnician} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Technician Name</label>
                <input
                  type="text"
                  required
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  placeholder="e.g. Alex Rivera (Technician Lead)"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAssigningItem(null)}
                  className="px-4 py-2 text-xs rounded-xl bg-slate-900 text-slate-300 border border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
