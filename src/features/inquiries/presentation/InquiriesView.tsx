'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Loader2,
  CheckCircle2,
  Trash2,
  Tag
} from 'lucide-react';
import { 
  subscribeToInquiries, 
  updateInquiryStatusInFirestore, 
  deleteInquiryFromFirestore,
  InquiryDoc 
} from '@/core/services/firebase';

export default function InquiriesView() {
  const [inquiries, setInquiries] = useState<InquiryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToInquiries((data) => {
      setInquiries(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  const filteredInquiries = inquiries.filter(inq => {
    const matchesFilter = activeFilter === 'All' ? true : inq.status === activeFilter;
    const matchesSearch =
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.email && inq.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
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
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-slate-800 text-[#00BCE1] border border-[#00BCE1]/30">
            {filteredInquiries.length} messages
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#00BCE1]/10 border border-[#00BCE1]/30 text-[#00BCE1] text-xs font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#00BCE1]" />
            <span>{inquiries.length} Total Messages</span>
          </div>
        </div>
      </div>

      {/* Unified Filter Bar (Single Consolidated Bar) */}
      <div className="p-4 backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 rounded-2xl shadow-xl shadow-cyan-950/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, email or subject..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-[#00BCE1] focus:ring-1 focus:ring-[#00BCE1]/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {['All', 'New', 'In Progress', 'Resolved'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === filter
                  ? 'bg-[#00BCE1] text-slate-950 font-bold shadow-[0_0_15px_rgba(0,188,225,0.4)]'
                  : 'text-slate-400 hover:text-white bg-slate-950/70 border border-slate-800/80 hover:border-[#00BCE1]/30'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading customer messages...</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Inquiries Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm ? 'No customer messages match your search term.' : 'There are currently no customer contact messages.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inq) => (
            <div
              key={inq.id}
              className="glass-panel glass-card-hover rounded-2xl p-6 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm border border-cyan-400/30">
                    {inq.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {inq.name}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        inq.status === 'Resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : inq.status === 'In Progress'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {inq.status || 'New'}
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-cyan-400" /> {inq.phone}
                      </span>
                      {inq.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-cyan-400" /> {inq.email}
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
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                  <button
                    onClick={() => handleDelete(inq.id)}
                    disabled={isDeleting === inq.id}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-rose-400 border border-rose-500/30 cursor-pointer disabled:opacity-50 ml-2"
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
                <div className="font-bold text-cyan-300 flex items-center gap-1.5 text-sm">
                  <Tag className="w-3.5 h-3.5" /> Subject: {inq.subject}
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-slate-300 leading-relaxed">
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
