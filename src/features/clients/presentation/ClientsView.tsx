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
  const industries = Array.from(new Set(clients.map(c => c.industry).filter(Boolean)));

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

      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[#00BCE1]" /> Corporate Clients
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage corporate partners, institutions, and brand logos featured on the website showcase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {clients.length === 0 && (
            <button
              onClick={handleSeedDefaultClients}
              disabled={isSeeding}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-cyan-400" />}
              Seed Default Clients
            </button>
          )}
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 cursor-pointer font-bold"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Corporate Client
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Total Clients</p>
            <p className="text-2xl font-black text-white">{clients.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#00BCE1]/15 text-[#00BCE1] border border-[#00BCE1]/30">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Industries Served</p>
            <p className="text-2xl font-black text-white">{industries.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Showcase Status</p>
            <p className="text-2xl font-black text-emerald-400">Live Active</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Globe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & View Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-panel rounded-2xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client name or industry..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          {industries.length > 0 && (
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Industries ({clients.length})</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <span className="text-xs text-slate-400 font-mono">
            {filteredClients.length} Client{filteredClients.length === 1 ? '' : 's'}
          </span>
          <div className="p-1 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
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
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading & Empty States */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading corporate clients from Cloud Firestore...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center space-y-4">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Corporate Clients Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? 'No clients match your filter term.'
              : 'Add your corporate clients (e.g. BRAC, Navana Group, TECNO, Bangladesh Army) to show on user website.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSeedDefaultClients}
              disabled={isSeeding}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-cyan-400" />}
              Seed Default Clients
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Corporate Client
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="glass-panel glass-card-hover rounded-2xl overflow-hidden p-5 flex flex-col justify-between space-y-4 group relative">
              <div className="space-y-4 text-center">
                {/* Logo Container */}
                <div className="relative w-full h-32 rounded-xl bg-white/95 border border-slate-200/80 flex items-center justify-center p-4 overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                  <img
                    src={client.logoUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=400&auto=format&fit=crop'}
                    alt={client.name}
                    className="max-h-24 max-w-full object-contain filter drop-shadow-sm"
                  />
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {client.name}
                  </h3>
                  <span className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                    {client.industry || 'Corporate Partner'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(client)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                  title="Edit Client"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingClient(client)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
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
        <div className="glass-panel rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Client Logo</th>
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Industry Category</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-cyan-500/[0.03]">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl bg-white p-1.5 border border-slate-200 flex items-center justify-center overflow-hidden">
                        <img
                          src={client.logoUrl}
                          alt={client.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white text-sm">{client.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
                        {client.industry || 'Corporate Partner'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-white/10 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingClient(client)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 border border-rose-500/30 cursor-pointer"
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
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-cyan w-full max-w-lg rounded-3xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingClientId ? <Edit2 className="w-5 h-5 text-cyan-400" /> : <Plus className="w-5 h-5 text-cyan-400" />}
                {editingClientId ? 'Edit Corporate Client' : 'Add New Corporate Client'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
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
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Industry / Sector</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Defense, Conglomerate, Tech"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-cyan-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Cloudinary Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Client Logo Image (Cloudinary Folder: <span className="text-cyan-400">clients/</span>)
                </label>
                <div className="border-2 border-dashed border-cyan-500/30 rounded-2xl p-4 text-center hover:border-cyan-400 transition-colors bg-slate-900/50">
                  {previewUrl || logoUrl ? (
                    <div className="relative w-40 h-28 mx-auto rounded-xl overflow-hidden bg-white p-2 border border-cyan-400/40 flex items-center justify-center">
                      <img src={previewUrl || logoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); setPreviewUrl(''); setLogoUrl(''); }}
                        className="absolute top-1.5 right-1.5 p-1 bg-slate-950/80 rounded-full text-white cursor-pointer hover:bg-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-3">
                      <Upload className="w-8 h-8 text-cyan-400 animate-bounce" />
                      <span className="text-xs text-slate-300">Click to upload client logo photo</span>
                      <span className="text-[10px] text-slate-500 font-mono">Folder: clients/ | Preset: aqua_point</span>
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
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border-rose-500/30 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Corporate Client</h3>
                <p className="text-xs text-slate-400">Confirm deletion from Firestore.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to remove <strong className="text-white">"{deletingClient.name}"</strong>? It will no longer be visible on the public website client showcase.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setDeletingClient(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteClient}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold"
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
