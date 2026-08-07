'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Upload, 
  LayoutGrid, 
  List, 
  AlertCircle, 
  X, 
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Layers,
  Globe
} from 'lucide-react';
import { uploadToCloudinary } from '@/core/services/cloudinary';
import { 
  subscribeToClients, 
  addClientToFirestore, 
  updateClientInFirestore, 
  deleteClientFromFirestore,
  ClientDoc 
} from '@/core/services/firebase';
import TableFooter from '@/core/components/TableFooter';

const DEFAULT_SAMPLE_CLIENTS: Omit<ClientDoc, 'id'>[] = [
  {
    name: 'BRAC',
    industry: 'NGO & International Development',
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Navana Group',
    industry: 'Industrial & Automotive Conglomerate',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'TECNO Mobile',
    industry: 'Electronics & Consumer Technology',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Bangladesh Army',
    industry: 'Defense & Government Organization',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Square Group',
    industry: 'Pharmaceuticals & Healthcare',
    logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Walton Hi-Tech',
    industry: 'Electronics & Home Appliances',
    logoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=400&auto=format&fit=crop',
  }
];

export default function ClientsView() {
  const [clients, setClients] = useState<ClientDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Delete Modal State
  const [deletingClient, setDeletingClient] = useState<ClientDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Real-time Firestore Sync
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToClients((data) => {
      setClients(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormError('');
    }
  };

  const openAddModal = () => {
    setEditingClientId(null);
    setName('');
    setIndustry('Corporate');
    setLogoUrl('');
    setSelectedFile(null);
    setPreviewUrl('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (client: ClientDoc) => {
    setEditingClientId(client.id);
    setName(client.name);
    setIndustry(client.industry || 'Corporate');
    setLogoUrl(client.logoUrl || '');
    setSelectedFile(null);
    setPreviewUrl('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Client Name is required.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      let finalLogoUrl = logoUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=400&auto=format&fit=crop';

      if (selectedFile) {
        // Uploading to folder 'clients/'
        finalLogoUrl = await uploadToCloudinary(selectedFile, 'clients');
      }

      const payload: Omit<ClientDoc, 'id'> = {
        name: name.trim(),
        industry: industry.trim() || 'Corporate',
        logoUrl: finalLogoUrl,
      };

      if (editingClientId) {
        await updateClientInFirestore(editingClientId, payload);
        setSuccessMessage(`Client "${name}" updated successfully!`);
      } else {
        await addClientToFirestore(payload);
        setSuccessMessage(`Corporate Client "${name}" added to Cloud Firestore!`);
      }

      setTimeout(() => setSuccessMessage(''), 3500);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving client:', err);
      setFormError(err.message || 'Failed to save corporate client.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteClient = async () => {
    if (!deletingClient) return;

    setIsDeleting(true);
    try {
      await deleteClientFromFirestore(deletingClient.id);
      setSuccessMessage(`Corporate Client "${deletingClient.name}" deleted.`);
      setTimeout(() => setSuccessMessage(''), 3500);
      setDeletingClient(null);
    } catch (err: any) {
      console.error('Error deleting client:', err);
      alert(`Failed to delete client: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedDefaultClients = async () => {
    setIsSeeding(true);
    try {
      for (const sample of DEFAULT_SAMPLE_CLIENTS) {
        await addClientToFirestore(sample);
      }
      setSuccessMessage('Default corporate clients seeded to Firestore!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err: any) {
      console.error('Error seeding clients:', err);
      alert(`Failed to seed clients: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // Industries list
  const industries = Array.from(new Set(clients.map(c => c.industry).filter((i): i is string => Boolean(i))));

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.industry && c.industry.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIndustry = selectedIndustry === 'All' || c.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Page Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Clients
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-[#141b2d] text-[#4cceac] border border-[#2c3754]">
            {filteredClients.length} clients
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {clients.length === 0 && (
            <button
              onClick={handleSeedDefaultClients}
              disabled={isSeeding}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#141b2d] hover:bg-[#3e4396] text-[#4cceac] border border-[#2c3754] transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#4cceac]" />}
              Seed Default Clients
            </button>
          )}
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-lg shadow-[#00BCE1]/20 rounded-xl px-5 py-2.5 text-xs transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Corporate Client
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#1f2940] border border-[#2c3754] flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Total Clients</p>
            <p className="text-3xl font-extrabold text-white">{clients.length}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#4cceac]/15 text-[#4cceac] border border-[#4cceac]/30">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1f2940] border border-[#2c3754] flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Industries Served</p>
            <p className="text-3xl font-extrabold text-white">{industries.length}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#4cceac]/15 text-[#4cceac] border border-[#4cceac]/30">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1f2940] border border-[#2c3754] flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Showcase Status</p>
            <p className="text-3xl font-extrabold text-[#4cceac]">Live Active</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#4cceac]/15 text-[#4cceac] border border-[#4cceac]/30">
            <Globe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Unified Filter Bar (Single Consolidated Bar) */}
      <div className="p-4 bg-[#1f2940] border border-[#2c3754] rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            {/* In-Page Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by client name or industry sector..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white placeholder-slate-400 focus:outline-none focus:border-[#4cceac] transition-all"
              />
            </div>

            {/* Industry Filter Dropdown */}
            {industries.length > 0 && (
              <div className="relative w-full sm:w-52">
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 focus:outline-none focus:border-[#4cceac] cursor-pointer transition-all"
                >
                  <option value="All">All Industries ({clients.length})</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

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

        {/* Industry Filter Tabs */}
        {industries.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#2c3754] scrollbar-none">
            <button
              onClick={() => setSelectedIndustry('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                selectedIndustry === 'All'
                  ? 'bg-[#4cceac] text-[#141b2d] font-bold shadow-[0_0_15px_rgba(76,206,172,0.4)]'
                  : 'bg-[#141b2d] text-slate-400 hover:text-white border border-[#2c3754]'
              }`}
            >
              <span>All Clients</span>
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                selectedIndustry === 'All' ? 'bg-[#141b2d]/25 text-[#141b2d]' : 'bg-white/10 text-[#4cceac]'
              }`}>
                {clients.length}
              </span>
            </button>

            {industries.map((ind) => {
              const count = clients.filter(c => c.industry === ind).length;
              const isActive = selectedIndustry === ind;
              return (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#4cceac] text-[#141b2d] font-bold shadow-[0_0_15px_rgba(76,206,172,0.4)]'
                      : 'bg-[#141b2d] text-slate-400 hover:text-white border border-[#2c3754]'
                  }`}
                >
                  <span>{ind}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    isActive ? 'bg-[#141b2d]/25 text-[#141b2d]' : 'bg-white/10 text-[#4cceac]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading & Empty States */}
      {loading ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#4cceac] animate-spin" />
          <p className="text-xs text-[#A0AEC0]">Loading corporate clients from Cloud Firestore...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 text-center space-y-4">
          <Building2 className="w-12 h-12 text-[#A0AEC0] mx-auto" />
          <h3 className="text-base font-bold text-white">No Corporate Clients Found</h3>
          <p className="text-xs text-[#A0AEC0] max-w-sm mx-auto">
            {searchTerm
              ? 'No clients match your filter term.'
              : 'Add your corporate clients (e.g. BRAC, Navana Group, TECNO, Bangladesh Army) to show on user website.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSeedDefaultClients}
              disabled={isSeeding}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#141b2d] hover:bg-[#3e4396] text-[#4cceac] hover:text-white border border-[#2c3754] transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#4cceac]" />}
              Seed Default Clients
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#4cceac] text-[#141b2d] hover:bg-[#4cceac]/90 shadow-md transition-all flex items-center gap-2 cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Corporate Client
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-[#1f2940] border border-[#2c3754] hover:border-[#4cceac]/50 rounded-2xl overflow-hidden p-5 flex flex-col justify-between space-y-4 group relative transition-all">
              <div className="space-y-4 text-center">
                {/* Logo Container */}
                <div className="relative w-full h-32 rounded-xl bg-white/95 border border-[#2c3754] flex items-center justify-center p-4 overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                  <img
                    src={client.logoUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=400&auto=format&fit=crop'}
                    alt={client.name}
                    className="max-h-24 max-w-full object-contain filter drop-shadow-sm"
                  />
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white group-hover:text-[#4cceac] transition-colors">
                    {client.name}
                  </h3>
                  <span className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#141b2d] border border-[#2c3754] text-[#4cceac]">
                    {client.industry || 'Corporate Partner'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#2c3754] flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(client)}
                  className="p-2 rounded-xl bg-[#141b2d] hover:bg-[#3e4396] text-[#4cceac] hover:text-white border border-[#2c3754] transition-all cursor-pointer"
                  title="Edit Client"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingClient(client)}
                  className="p-2 rounded-xl bg-[#141b2d] hover:bg-rose-950 text-rose-400 border border-[#2c3754] transition-all cursor-pointer"
                  title="Delete Client"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-[#2c3754]">
                <tr>
                  <th className="py-3.5 px-4">Client Logo</th>
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Industry Category</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2c3754] bg-[#1f2940]">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#2c3754] transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl bg-white p-1.5 border border-[#2c3754] flex items-center justify-center overflow-hidden">
                        <img
                          src={client.logoUrl}
                          alt={client.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white text-sm">{client.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#4cceac]/20 text-[#4cceac] border border-[#4cceac]/40">
                        {client.industry || 'Corporate Partner'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-1.5 rounded-lg bg-[#141b2d] hover:bg-[#3e4396] text-[#4cceac] hover:text-white border border-[#2c3754] cursor-pointer transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingClient(client)}
                          className="p-1.5 rounded-lg bg-[#141b2d] hover:bg-rose-900/50 text-rose-400 border border-[#2c3754] cursor-pointer transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter totalItems={filteredClients.length} />
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141b2d]/80 backdrop-blur-md">
          <div className="bg-[#1f2940] border border-[#2c3754] w-full max-w-lg rounded-3xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#2c3754]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingClientId ? <Edit2 className="w-5 h-5 text-[#4cceac]" /> : <Plus className="w-5 h-5 text-[#4cceac]" />}
                {editingClientId ? 'Edit Corporate Client' : 'Add New Corporate Client'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-[#A0AEC0] hover:text-white hover:bg-[#141b2d] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. BRAC, Navana Group, TECNO"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white focus:outline-none focus:border-[#4cceac]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Industry / Sector</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Defense, Conglomerate, Tech"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-[#4cceac] focus:outline-none focus:border-[#4cceac]"
                  />
                </div>
              </div>

              {/* Cloudinary Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Client Logo Image (Cloudinary Folder: <span className="text-[#4cceac]">clients/</span>)
                </label>
                <div className="border-2 border-dashed border-[#2c3754] rounded-2xl p-4 text-center hover:border-[#4cceac] transition-colors bg-[#141b2d]">
                  {previewUrl || logoUrl ? (
                    <div className="relative w-40 h-28 mx-auto rounded-xl overflow-hidden bg-white p-2 border border-[#2c3754] flex items-center justify-center">
                      <img src={previewUrl || logoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); setPreviewUrl(''); setLogoUrl(''); }}
                        className="absolute top-1.5 right-1.5 p-1 bg-[#141b2d] rounded-full text-white cursor-pointer hover:bg-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-3">
                      <Upload className="w-8 h-8 text-[#4cceac] animate-bounce" />
                      <span className="text-xs text-slate-300">Click to upload client logo photo</span>
                      <span className="text-[10px] text-[#A0AEC0] font-mono">Folder: clients/ | Preset: aqua_point</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Direct Image URL Option */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Or Direct Logo Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white focus:outline-none focus:border-[#4cceac]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#2c3754]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#141b2d] hover:bg-[#2c3754] text-slate-300 border border-[#2c3754] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#4cceac] text-[#141b2d] hover:bg-[#4cceac]/90 disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{selectedFile ? 'Uploading to folder clients/...' : 'Saving to Firestore...'}</span>
                    </>
                  ) : (
                    <span>{editingClientId ? 'Update Client' : 'Save Client'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141b2d]/80 backdrop-blur-md">
          <div className="bg-[#1f2940] border border-rose-500/30 w-full max-w-md rounded-3xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Corporate Client</h3>
                <p className="text-xs text-[#A0AEC0]">Confirm deletion from Firestore.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to remove <strong className="text-white">"{deletingClient.name}"</strong>? It will no longer be visible on the public website client showcase.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2c3754]">
              <button
                onClick={() => setDeletingClient(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#141b2d] hover:bg-[#2c3754] text-slate-300 border border-[#2c3754] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteClient}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Client</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
