'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  User, 
  Phone, 
  Mail, 
  Loader2,
  CheckCircle2,
  Trash2,
  Tag,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  subscribeToInquiries, 
  updateInquiryStatusInFirestore, 
  deleteInquiryFromFirestore,
  InquiryDoc 
} from '@/core/services/firebase';
import TableFooter from '@/core/components/TableFooter';
import { useSearch } from '@/core/context/SearchContext';

export default function InquiriesView() {
  const [inquiries, setInquiries] = useState<InquiryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const { searchTerm } = useSearch();
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToInquiries(activeFilter, 15, (data) => {
      setInquiries(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeFilter]);

  const handleUpdateStatus = async (id: string, status: InquiryDoc['status']) => {
    try {
      await updateInquiryStatusInFirestore(id, status);
      setSuccessMessage(`Inquiry marked as ${status}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(`Failed to update inquiry: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer inquiry?')) return;

    setIsDeleting(id);
    try {
      await deleteInquiryFromFirestore(id);
      setSuccessMessage('Inquiry deleted.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(`Error deleting inquiry: ${err.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredInquiries = inquiries;

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
            Inquiries
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-[#141b2d] text-[#00BCE1] border border-[#2c3754]">
            {filteredInquiries.length} messages
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => alert('Compose new customer message / reply dispatch!')}
            className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-[#00BCE1]/25 rounded-full px-6 py-2.5 transition-all duration-300 transform active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <MessageSquare className="w-4 h-4 stroke-[2.5]" /> + New Inquiry
          </button>
        </div>
      </div>

      {/* Unified Filter Bar (Single Consolidated Bar) */}
      <div className="p-4 bg-[#1f2940] border border-[#2c3754] rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-48">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 focus:outline-none focus:border-[#00BCE1] cursor-pointer transition-all"
              >
                <option value="All">All Inquiries</option>
                <option value="New">New Messages</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
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
                title="Grid View"
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

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#2c3754] scrollbar-none">
          {['All', 'New', 'In Progress', 'Resolved'].map((filter) => {
            const count = filter === 'All' ? inquiries.length : inquiries.filter(i => i.status === filter).length;
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#00BCE1] text-[#141b2d] font-bold shadow-[0_0_15px_rgba(0,188,225,0.4)]'
                    : 'bg-[#141b2d] text-slate-400 hover:text-white border border-[#2c3754]'
                }`}
              >
                <span>{filter}</span>
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

      {/* Inquiries List */}
      {loading ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#00BCE1] animate-spin" />
          <p className="text-xs text-[#A0AEC0]">Loading customer messages...</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 text-center space-y-3">
          <MessageSquare className="w-12 h-12 text-[#A0AEC0] mx-auto" />
          <h3 className="text-base font-bold text-white">No Inquiries Found</h3>
          <p className="text-xs text-[#A0AEC0] max-w-sm mx-auto">
            {searchTerm ? 'No customer messages match your search term.' : 'There are currently no customer contact messages.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-[#2c3754]">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Message Summary</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2c3754] bg-[#1f2940]">
                {filteredInquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-[#2c3754] transition-colors">
                    <td className="py-4 px-4 font-bold text-white">{inq.name}</td>
                    <td className="py-4 px-4 text-slate-300">
                      <div>{inq.phone}</div>
                      {inq.email && <div className="text-[11px] text-[#00BCE1]">{inq.email}</div>}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#00BCE1]">{inq.subject}</td>
                    <td className="py-4 px-4 text-[#A0AEC0] max-w-xs truncate">{inq.message}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        inq.status === 'Resolved'
                          ? 'bg-[#00BCE1]/20 text-[#00BCE1] border-[#00BCE1]/40'
                          : inq.status === 'In Progress'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {inq.status || 'New'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDelete(inq.id)}
                        disabled={isDeleting === inq.id}
                        className="p-1.5 rounded-lg bg-[#141b2d] hover:bg-rose-900/50 text-rose-400 border border-[#2c3754] cursor-pointer disabled:opacity-50 transition-all"
                        title="Delete Inquiry"
                      >
                        {isDeleting === inq.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter totalItems={filteredInquiries.length} />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-6 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#2c3754]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#3e4396] text-[#00BCE1] flex items-center justify-center font-bold text-sm border border-[#00BCE1]/40">
                    {inq.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {inq.name}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        inq.status === 'Resolved'
                          ? 'bg-[#00BCE1]/20 text-[#00BCE1] border-[#00BCE1]/40'
                          : inq.status === 'In Progress'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {inq.status || 'New'}
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#A0AEC0] mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#00BCE1]" /> {inq.phone}
                      </span>
                      {inq.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#00BCE1]" /> {inq.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(['New', 'In Progress', 'Resolved'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(inq.id, st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        inq.status === st
                          ? st === 'New'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : st === 'In Progress'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-[#00BCE1]/20 text-[#00BCE1] border-[#00BCE1]/40'
                          : 'bg-[#141b2d] text-[#A0AEC0] border-[#2c3754] hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                  <button
                    onClick={() => handleDelete(inq.id)}
                    disabled={isDeleting === inq.id}
                    className="p-2 rounded-xl bg-[#141b2d] hover:bg-rose-900/50 text-rose-400 border border-[#2c3754] cursor-pointer disabled:opacity-50 ml-2 transition-all"
                    title="Delete Inquiry"
                  >
                    {isDeleting === inq.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Subject & Message Content */}
              <div className="pt-4 space-y-2 text-xs">
                <div className="font-bold text-[#00BCE1] flex items-center gap-1.5 text-sm">
                  <Tag className="w-3.5 h-3.5" /> Subject: {inq.subject}
                </div>
                <div className="p-3.5 rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-300 leading-relaxed">
                  {inq.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
