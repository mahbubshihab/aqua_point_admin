'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Building2, 
  Plus, 
  Upload, 
  LayoutGrid, 
  List, 
  AlertCircle, 
  X, 
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2
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
import { useSearch } from '@/core/context/SearchContext';

export default function ClientsView() {
  const [clients, setClients] = useState<ClientDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { searchTerm } = useSearch();

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Delete Modal State
  const [deletingClient, setDeletingClient] = useState<ClientDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState(false);
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
    setLogoUrl('');
    setSelectedFile(null);
    setPreviewUrl('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (client: ClientDoc) => {
    setEditingClientId(client.id);
    setName(client.name);
    setLogoUrl(client.imageUrl || client.logoUrl || '');
    setSelectedFile(null);
    setPreviewUrl('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Name is required.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      let finalLogoUrl = logoUrl || '';

      if (selectedFile) {
        // Uploading logo to Cloudinary folder 'clients'
        finalLogoUrl = await uploadToCloudinary(selectedFile, 'clients');
      }

      if (!finalLogoUrl && !editingClientId) {
        setFormError('Please select a logo image.');
        setIsSaving(false);
        return;
      }

      const payload = {
        name: name.trim(),
        imageUrl: finalLogoUrl || logoUrl || '',
        logoUrl: finalLogoUrl || logoUrl || '',
      };

      if (editingClientId) {
        await updateClientInFirestore(editingClientId, payload);
        setSuccessMessage(`Client "${name}" updated!`);
      } else {
        await addClientToFirestore(payload);
        setSuccessMessage(`Client "${name}" added!`);
      }

      setTimeout(() => setSuccessMessage(''), 3500);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving client:', err);
      setFormError(err.message || 'Failed to save client.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteClient = async () => {
    if (!deletingClient) return;

    setIsDeleting(true);
    try {
      await deleteClientFromFirestore(deletingClient.id);
      setSuccessMessage(`Client "${deletingClient.name}" deleted.`);
      setTimeout(() => setSuccessMessage(''), 3500);
      setDeletingClient(null);
    } catch (err: any) {
      console.error('Error deleting client:', err);
      alert(`Failed to delete client: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
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
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-[#141b2d] text-[#00BCE1] border border-[#2c3754]">
            {filteredClients.length} clients
          </span>
        </div>
        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-[#00BCE1]/25 rounded-full px-5 py-2.5 transition-all duration-300 transform active:scale-95 flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Client
        </button>
      </div>

      {/* View Controls & Counter */}
      <div className="p-3 bg-[#1f2940] border border-[#2c3754] rounded-2xl shadow-xl flex items-center justify-between gap-3">
        <p className="text-xs text-[#A0AEC0] font-medium">
          Showing {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
        </p>
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

      {/* Loading & Empty States */}
      {loading ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#00BCE1] animate-spin" />
          <p className="text-xs text-[#A0AEC0]">Loading clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-12 text-center space-y-4">
          <Building2 className="w-12 h-12 text-[#A0AEC0] mx-auto opacity-50" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Clients Found</h3>
            <p className="text-xs text-[#A0AEC0]">
              {searchTerm ? 'No clients match your search.' : 'No clients added yet.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-[#00BCE1]/25 rounded-full px-5 py-2.5 transition-all duration-300 transform active:scale-95 inline-flex items-center gap-2 cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Client
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredClients.map((client) => {
            const logo = client.imageUrl || client.logoUrl || '';
            return (
              <div 
                key={client.id} 
                className="bg-[#1f2940] border border-[#2c3754] hover:border-[#00BCE1]/50 rounded-2xl overflow-hidden p-5 flex flex-col justify-between space-y-4 group relative transition-all shadow-xl"
              >
                <div className="space-y-3 text-center">
                  <div className="relative w-full h-32 rounded-xl bg-white/95 border border-[#2c3754] flex items-center justify-center p-4 overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                    <img
                      src={logo || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=400&auto=format&fit=crop'}
                      alt={client.name}
                      className="max-h-24 max-w-full object-contain filter drop-shadow-sm"
                    />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#00BCE1] transition-colors truncate">
                    {client.name}
                  </h3>
                </div>

                <div className="pt-3 border-t border-[#2c3754] flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(client)}
                    className="p-2 rounded-xl bg-[#141b2d] hover:bg-[#3e4396] text-[#00BCE1] hover:text-white border border-[#2c3754] transition-all cursor-pointer"
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
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-[#2c3754]">
                <tr>
                  <th className="py-3.5 px-4">Logo</th>
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2c3754] bg-[#1f2940]">
                {filteredClients.map((client) => {
                  const logo = client.imageUrl || client.logoUrl || '';
                  return (
                    <tr key={client.id} className="hover:bg-[#2c3754] transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl bg-white p-1.5 border border-[#2c3754] flex items-center justify-center overflow-hidden">
                          <img
                            src={logo}
                            alt={client.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white text-sm">{client.name}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(client)}
                            className="p-1.5 rounded-lg bg-[#141b2d] hover:bg-[#3e4396] text-[#00BCE1] hover:text-white border border-[#2c3754] cursor-pointer transition-all"
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
                  );
                })}
              </tbody>
            </table>
          </div>
          <TableFooter totalItems={filteredClients.length} />
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141b2d]/80 backdrop-blur-md">
          <div className="bg-[#1f2940] border border-[#2c3754] w-full max-w-md rounded-3xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#2c3754]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingClientId ? <Edit2 className="w-5 h-5 text-[#00BCE1]" /> : <Plus className="w-5 h-5 text-[#00BCE1]" />}
                {editingClientId ? 'Edit Client' : 'Add Client'}
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Client Name"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white focus:outline-none focus:border-[#00BCE1]"
                />
              </div>

              {/* Cloudinary Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Logo Image
                </label>
                <div className="border-2 border-dashed border-[#2c3754] rounded-2xl p-4 text-center hover:border-[#00BCE1] transition-colors bg-[#141b2d]">
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
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4">
                      <Upload className="w-7 h-7 text-[#00BCE1]" />
                      <span className="text-xs text-slate-300 font-medium">Click to upload logo image</span>
                      <span className="text-[10px] text-[#A0AEC0]">PNG, JPG, SVG or WEBP</span>
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
                  className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-[#00BCE1]/25 rounded-full px-6 py-2.5 transition-all duration-300 transform active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{selectedFile ? 'Uploading logo...' : 'Saving...'}</span>
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
                <h3 className="text-base font-bold text-white">Delete Client</h3>
                <p className="text-xs text-[#A0AEC0]">Confirm deletion from Firestore.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to remove <strong className="text-white">"{deletingClient.name}"</strong>?
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
