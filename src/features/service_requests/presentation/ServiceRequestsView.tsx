'use client';

import { useState, useEffect } from 'react';
import { 
  Wrench, 
  Clock, 
  Phone, 
  MapPin, 
  Loader2,
  CheckCircle2,
  UserPlus,
  LayoutGrid,
  List,
  Edit2,
  X,
  User
} from 'lucide-react';
import { 
  subscribeToServiceRequests, 
  updateServiceRequestStatusInFirestore, 
  ServiceRequestDoc 
} from '@/core/services/firebase';
import TableFooter from '@/core/components/TableFooter';

export default function ServiceRequestsView() {
  const [items, setItems] = useState<ServiceRequestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('All');
  
  // Action Modal State
  const [selectedItem, setSelectedItem] = useState<ServiceRequestDoc | null>(null);
  const [modalStatus, setModalStatus] = useState<ServiceRequestDoc['status']>('Pending');
  const [technicianName, setTechnicianName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToServiceRequests(activeStatus, 25, (data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeStatus]);

  const handleOpenActionModal = (item: ServiceRequestDoc) => {
    setSelectedItem(item);
    setModalStatus(item.status);
    setTechnicianName(item.technician !== 'Unassigned' ? item.technician : '');
  };

  const handleSaveActionModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsUpdating(true);
    try {
      await updateServiceRequestStatusInFirestore(
        selectedItem.id, 
        modalStatus, 
        technicianName.trim() || 'Unassigned'
      );
      setSuccessMessage(`Updated #${selectedItem.id} status to ${modalStatus}`);
      setSelectedItem(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(`Failed to update service request: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatId = (id: string) => {
    if (!id) return '#000';
    if (id.startsWith('#')) return id;
    return id.length <= 6 ? `#${id}` : `#${id.substring(0, 8)}`;
  };

  return (
    <div className="space-y-6 pb-12">
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
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-[#141b2d] text-[#00BCE1] border border-[#2c3754]">
            {items.length} requests
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-[#141b2d] p-1 rounded-xl border border-[#2c3754]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#3e4396] text-white' : 'text-[#A0AEC0] hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[#3e4396] text-white' : 'text-[#A0AEC0] hover:text-white'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#2c3754]">
        {(['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'] as const).map((st) => {
          const isActive = activeStatus === st;
          const count = st === 'All' 
            ? items.length 
            : items.filter(i => i.status === st).length;

          return (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-[#00BCE1] text-[#0F172A] shadow-md shadow-[#00BCE1]/20'
                  : 'bg-[#1f2940] text-[#A0AEC0] hover:text-white border border-[#2c3754]'
              }`}
            >
              <span>{st}</span>
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                isActive ? 'bg-[#0F172A]/20 text-[#0F172A]' : 'bg-[#141b2d] text-[#00BCE1]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Request Queue Cards / Detailed List */}
      {loading ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#00BCE1] animate-spin" />
          <p className="text-xs text-[#A0AEC0]">Loading service requests...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-12 text-center text-[#A0AEC0] text-xs">
          No service requests found.
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-[#2c3754]">
                <tr>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Appointment</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2c3754] bg-[#1f2940]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#2c3754]/50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#00BCE1]">
                      {formatId(item.id)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{item.customerName}</div>
                      <div className="text-[11px] text-[#A0AEC0]">{item.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-300 max-w-xs truncate">{item.address}</td>
                    <td className="py-4 px-4 text-[#A0AEC0]">
                      <div>{item.appointmentDate}</div>
                      <div className="text-[10px] text-slate-400">{item.appointmentTime}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{item.technician || 'Unassigned'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        item.status === 'Completed'
                          ? 'bg-[#00BCE1]/20 text-[#00BCE1] border-[#00BCE1]/40'
                          : item.status === 'In Progress'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : item.status === 'Cancelled'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenActionModal(item)}
                        className="px-3 py-1.5 rounded-xl bg-[#141b2d] hover:bg-[#00BCE1] text-[#00BCE1] hover:text-[#0F172A] border border-[#2c3754] cursor-pointer transition-all text-xs font-bold"
                      >
                        Action
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter totalItems={items.length} />
        </div>
      ) : (
        /* Grid / Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-5 hover:border-[#00BCE1]/50 transition-all duration-200 shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Card Header: ID, Status, Action */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#2c3754]">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-[#141b2d] border border-[#2c3754] text-[#00BCE1] font-mono font-bold text-xs">
                      {formatId(item.id)}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      item.status === 'Completed'
                        ? 'bg-[#00BCE1]/20 text-[#00BCE1] border-[#00BCE1]/40'
                        : item.status === 'In Progress'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : item.status === 'Cancelled'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenActionModal(item)}
                    className="px-3 py-1.5 rounded-xl bg-[#141b2d] hover:bg-[#00BCE1] text-[#00BCE1] hover:text-[#0F172A] border border-[#2c3754] cursor-pointer transition-all text-xs font-bold flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Action
                  </button>
                </div>

                {/* Customer Details */}
                <div className="pt-3 space-y-1.5">
                  <h3 className="text-base font-bold text-white">
                    {item.customerName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#A0AEC0]">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#00BCE1]" /> {item.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00BCE1]" /> {item.address}
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#141b2d] border border-[#2c3754]/80">
                    <span className="text-[#A0AEC0] font-medium block mb-1">Appointment</span>
                    <div className="font-bold text-white flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#00BCE1]" /> {item.appointmentDate}
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{item.appointmentTime}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141b2d] border border-[#2c3754]/80">
                    <span className="text-[#A0AEC0] font-medium block mb-1">Technician</span>
                    <div className="font-bold text-white flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#00BCE1]" /> {item.technician || 'Unassigned'}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {item.problemDetails && (
                  <div className="mt-3 p-3 rounded-xl bg-[#141b2d]/60 border border-[#2c3754]/60 text-xs text-slate-300">
                    <span className="font-bold text-[#00BCE1]">Note: </span>
                    {item.problemDetails}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action / Manage Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141b2d]/85 backdrop-blur-xl">
          <div className="bg-[#1f2940] border border-[#2c3754] w-full max-w-md rounded-2xl p-6 relative space-y-5 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#2c3754] pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#00BCE1]" /> Update Service Request
                </h2>
                <p className="text-xs text-[#A0AEC0]">
                  Request ID: <span className="font-mono text-[#00BCE1] font-bold">{formatId(selectedItem.id)}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl bg-[#141b2d] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveActionModal} className="space-y-4">
              {/* Customer Info Summary */}
              <div className="p-3 rounded-xl bg-[#141b2d] border border-[#2c3754] text-xs space-y-1">
                <div className="font-bold text-white">{selectedItem.customerName}</div>
                <div className="text-[#A0AEC0]">{selectedItem.phone} • {selectedItem.address}</div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Pending', 'In Progress', 'Completed', 'Cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setModalStatus(st)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        modalStatus === st
                          ? st === 'Pending'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                            : st === 'In Progress'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                            : st === 'Completed'
                            ? 'bg-[#00BCE1]/20 text-[#00BCE1] border-[#00BCE1]'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500'
                          : 'bg-[#141b2d] text-[#A0AEC0] border-[#2c3754] hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign Technician Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Technician</label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  placeholder="Technician name (optional)"
                  className="w-full px-3 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white focus:outline-none focus:border-[#00BCE1] transition-all"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2c3754]">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#141b2d] text-slate-300 border border-[#2c3754] hover:bg-[#2c3754] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-[#00BCE1] hover:bg-cyan-400 text-[#0F172A] text-xs font-bold rounded-xl px-5 py-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
