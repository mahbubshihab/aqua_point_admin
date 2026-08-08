'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  LayoutGrid,
  List,
  Loader2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import TableFooter from '@/core/components/TableFooter';
import { useSearch } from '@/core/context/SearchContext';
import {
  StoreDoc,
  subscribeToStores,
  addStoreToFirestore,
  updateStoreInFirestore,
  deleteStoreFromFirestore,
} from '@/core/services/firebase';

export default function StoresView() {
  const [stores, setStores] = useState<StoreDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { searchTerm } = useSearch();
  const [visibleCount, setVisibleCount] = useState(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreDoc | null>(null);
  const [deletingStore, setDeletingStore] = useState<StoreDoc | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    openingHours: '09:00 AM - 08:00 PM',
    googleMapUrl: '',
  });

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToStores((data) => {
      setStores(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      openingHours: '09:00 AM - 08:00 PM',
      googleMapUrl: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (store: StoreDoc) => {
    setEditingStore(store);
    setFormData({
      name: store.name || '',
      address: store.address || '',
      phone: store.phone || '',
      openingHours: store.openingHours || '09:00 AM - 08:00 PM',
      googleMapUrl: store.googleMapUrl || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      setFormError('Store Name and Address are required.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      if (editingStore) {
        await updateStoreInFirestore(editingStore.id, formData);
        setSuccessMessage('Store updated successfully!');
      } else {
        await addStoreToFirestore(formData);
        setSuccessMessage('New store added successfully!');
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save store.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStore) return;
    setIsDeleting(true);
    try {
      await deleteStoreFromFirestore(deletingStore.id);
      setSuccessMessage('Store deleted successfully.');
      setDeletingStore(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(`Failed to delete store: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Stores
  const filteredStores = stores.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1f2940] border border-[#2c3754] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00BCE1] to-blue-600 flex items-center justify-center text-white shadow-lg shadow-[#00BCE1]/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">Aqua Point Stores</h1>
            <p className="text-xs text-slate-400">Manage store locations, addresses, & operating hours</p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-[#00BCE1]/20 transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add New Store
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Control Bar: View Switcher */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Total Stores:</span>
          <span className="px-3 py-1 rounded-full bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40 text-xs font-bold font-mono">
            {stores.length}
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1f2940] border border-[#2c3754]">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-[#00BCE1] text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-[#00BCE1] text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-[#1f2940] border border-[#2c3754] text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#00BCE1] animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading stores from Cloud Firestore...</p>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#1f2940] border border-[#2c3754] text-center space-y-4">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-white">No Stores Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm ? `No stores match "${searchTerm}"` : 'Click "Add New Store" to register your first store.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredStores.slice(0, visibleCount).map((store) => (
              <div
                key={store.id}
                className="bg-[#1f2940] border border-[#2c3754] hover:border-[#00BCE1]/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00BCE1]/15 text-[#00BCE1] border border-[#00BCE1]/30 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">{store.name}</h3>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#2c3754]/60 text-xs">
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-[#00BCE1] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{store.address}</span>
                    </div>
                    {store.phone && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="w-4 h-4 text-[#00BCE1] shrink-0" />
                        <span>{store.phone}</span>
                      </div>
                    )}
                    {store.openingHours && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-[#00BCE1] shrink-0" />
                        <span>{store.openingHours}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#2c3754] flex items-center justify-end gap-2">
                  {store.googleMapUrl && (
                    <a
                      href={store.googleMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-[#141b2d] hover:bg-[#2c3754] text-[#00BCE1] border border-[#2c3754] transition-all cursor-pointer"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => openEditModal(store)}
                    className="p-2 rounded-xl bg-[#141b2d] hover:bg-blue-900/40 text-blue-400 border border-[#2c3754] transition-all cursor-pointer"
                    title="Edit Store"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingStore(store)}
                    className="p-2 rounded-xl bg-[#141b2d] hover:bg-rose-950 text-rose-400 border border-[#2c3754] transition-all cursor-pointer"
                    title="Delete Store"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-lg">
            <TableFooter
              totalItems={filteredStores.length}
              visibleCount={visibleCount}
              onSeeMore={() => setVisibleCount((prev) => prev + 10)}
            />
          </div>
        </div>
      ) : (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-[#2c3754]">
                <tr>
                  <th className="py-3.5 px-4">Store Name</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Hours</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2c3754] bg-[#1f2940]">
                {filteredStores.slice(0, visibleCount).map((store) => (
                  <tr key={store.id} className="hover:bg-[#2c3754] transition-colors">
                    <td className="py-4 px-4 font-bold text-white">{store.name}</td>
                    <td className="py-4 px-4 text-slate-300 max-w-xs truncate">{store.address}</td>
                    <td className="py-4 px-4 text-[#00BCE1] font-medium">{store.phone || 'N/A'}</td>
                    <td className="py-4 px-4 text-slate-300">{store.openingHours || 'N/A'}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(store)}
                          className="p-1.5 rounded-lg bg-[#141b2d] hover:bg-blue-900/50 text-blue-400 border border-[#2c3754] cursor-pointer transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingStore(store)}
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
          <TableFooter
            totalItems={filteredStores.length}
            visibleCount={visibleCount}
            onSeeMore={() => setVisibleCount((prev) => prev + 10)}
          />
        </div>
      )}

      {/* Add / Edit Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141b2d]/80 backdrop-blur-md">
          <div className="bg-[#1f2940] border border-[#2c3754] w-full max-w-lg rounded-3xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#2c3754]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-[#00BCE1]" />
                {editingStore ? 'Edit Store' : 'Add New Store'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#141b2d] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aqua Point Dhanmondi Branch"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#141b2d] border border-[#2c3754] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#00BCE1]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Store Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#141b2d] border border-[#2c3754] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#00BCE1]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +880 1700-000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#141b2d] border border-[#2c3754] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#00BCE1]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Opening Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM - 08:00 PM"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    className="w-full bg-[#141b2d] border border-[#2c3754] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#00BCE1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Google Maps Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.googleMapUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapUrl: e.target.value })}
                  className="w-full bg-[#141b2d] border border-[#2c3754] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#00BCE1]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#2c3754]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#141b2d] border border-[#2c3754] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingStore ? 'Update Store' : 'Save Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141b2d]/80 backdrop-blur-md">
          <div className="bg-[#1f2940] border border-[#2c3754] w-full max-w-sm rounded-3xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Delete Store?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white">"{deletingStore.name}"</span>? This action cannot be undone.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingStore(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#141b2d] border border-[#2c3754] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
