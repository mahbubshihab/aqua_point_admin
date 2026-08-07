'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Image as ImageIcon, 
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
  ExternalLink,
  Tag,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { uploadToCloudinary } from '@/core/services/cloudinary';
import { 
  subscribeToBanners, 
  addBannerToFirestore, 
  updateBannerInFirestore, 
  deleteBannerFromFirestore,
  BannerDoc 
} from '@/core/services/firebase';
import TableFooter from '@/core/components/TableFooter';

export default function BannersView() {
  const [banners, setBanners] = useState<BannerDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Delete Modal State
  const [deletingBanner, setDeletingBanner] = useState<BannerDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Real-time Firestore Sync
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToBanners((data) => {
      setBanners(data);
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
    setEditingBannerId(null);
    setTitle('');
    setTag('');
    setCtaLink('');
    setIsActive(true);
    setSelectedFile(null);
    setPreviewUrl('');
    setExistingImageUrl('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (banner: BannerDoc) => {
    setEditingBannerId(banner.id);
    setTitle(banner.title);
    setTag(banner.tag || '');
    setCtaLink(banner.ctaLink || '');
    setIsActive(banner.isActive);
    setSelectedFile(null);
    setPreviewUrl('');
    setExistingImageUrl(banner.imageUrl || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Banner Title is required.');
      return;
    }

    if (!selectedFile && !existingImageUrl) {
      setFormError('Please select or upload a banner image.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      let finalImageUrl = existingImageUrl;

      if (selectedFile) {
        // Upload to folder 'banners/' on Cloudinary
        finalImageUrl = await uploadToCloudinary(selectedFile, 'banners');
      }

      const payload: Omit<BannerDoc, 'id'> = {
        title: title.trim(),
        tag: tag.trim(),
        imageUrl: finalImageUrl,
        ctaLink: ctaLink.trim(),
        isActive: isActive,
      };

      if (editingBannerId) {
        await updateBannerInFirestore(editingBannerId, payload);
        setSuccessMessage(`Banner "${title}" updated successfully!`);
      } else {
        await addBannerToFirestore(payload);
        setSuccessMessage(`Banner "${title}" added to Cloud Firestore!`);
      }

      setTimeout(() => setSuccessMessage(''), 3500);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving banner:', err);
      setFormError(err.message || 'Failed to save banner.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (banner: BannerDoc) => {
    try {
      await updateBannerInFirestore(banner.id, { isActive: !banner.isActive });
      setSuccessMessage(`Banner status updated to ${!banner.isActive ? 'Active' : 'Inactive'}.`);
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err: any) {
      console.error('Error toggling banner status:', err);
      alert(`Failed to update banner status: ${err.message}`);
    }
  };

  const confirmDeleteBanner = async () => {
    if (!deletingBanner) return;

    setIsDeleting(true);
    try {
      await deleteBannerFromFirestore(deletingBanner.id);
      setSuccessMessage(`Banner "${deletingBanner.title}" removed.`);
      setTimeout(() => setSuccessMessage(''), 3500);
      setDeletingBanner(null);
    } catch (err: any) {
      console.error('Error deleting banner:', err);
      alert(`Failed to delete banner: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  const filteredBanners = banners.filter(b => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.tag && b.tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.ctaLink && b.ctaLink.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesStatus = true;
    if (statusFilter === 'Active') matchesStatus = b.isActive;
    if (statusFilter === 'Inactive') matchesStatus = !b.isActive;

    return matchesSearch && matchesStatus;
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
            Banners
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-slate-800 text-[#00BCE1] border border-[#00BCE1]/30">
            {filteredBanners.length} banners
          </span>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Banner
        </button>
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
                placeholder="Search banner by title, tag, or CTA link..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-[#00BCE1] focus:ring-1 focus:ring-[#00BCE1]/50 transition-all"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-[#00BCE1] focus:ring-1 focus:ring-[#00BCE1]/50 cursor-pointer transition-all"
              >
                <option value="All">All Banner Status</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Disabled Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800/80">
            <div className="p-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40 shadow-[0_0_10px_rgba(0,188,225,0.2)]'
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
                    ? 'bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40 shadow-[0_0_10px_rgba(0,188,225,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Banner Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/60 scrollbar-none">
          {(['All', 'Active', 'Inactive'] as const).map((st) => {
            const label = st === 'All' ? 'All Banners' : st === 'Active' ? 'Active Hero Slides' : 'Disabled Slides';
            const count = st === 'All' ? banners.length : banners.filter(b => st === 'Active' ? b.isActive : !b.isActive).length;
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#00BCE1] text-slate-950 font-bold shadow-[0_0_15px_rgba(0,188,225,0.4)]'
                    : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800/80 hover:border-[#00BCE1]/30'
                }`}
              >
                <span>{label}</span>
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

      {/* Loading & Empty States */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading banners from Cloud Firestore...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center space-y-4">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Banners Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? 'No banners match your search query.'
              : 'Add your first promotional hero slider banner for the website.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Banner
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className={`glass-panel glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group relative border transition-all ${
                banner.isActive ? 'border-cyan-500/30' : 'border-slate-800 opacity-75'
              }`}
            >
              <div>
                {/* Banner Image Preview */}
                <div className="relative w-full h-48 bg-slate-900 overflow-hidden">
                  {banner.imageUrl ? (
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D16] via-transparent to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-[11px] font-extrabold rounded-full backdrop-blur-md border flex items-center gap-1.5 shadow-lg ${
                        banner.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-emerald-500/10'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700'
                      }`}
                    >
                      {banner.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Tag / Badge */}
                  {banner.tag && (
                    <div className="absolute top-3 right-3 px-3 py-1 text-[11px] font-extrabold rounded-full bg-cyan-500/20 backdrop-blur-md text-cyan-300 border border-cyan-400/40 flex items-center gap-1 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                      <Tag className="w-3 h-3 text-cyan-400" /> {banner.tag}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-2 relative">
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {banner.title}
                  </h3>

                  {banner.ctaLink && (
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400/90 font-mono truncate pt-1">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{banner.ctaLink}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-white/5 mt-2">
                <button
                  onClick={() => handleToggleActive(banner)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                    banner.isActive
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Toggle active visibility on website hero slider"
                >
                  {banner.isActive ? (
                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{banner.isActive ? 'Active' : 'Disabled'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                    title="Edit Banner"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingBanner(banner)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[#1f2940] border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Banner Preview</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Tag / Badge</th>
                  <th className="py-3.5 px-4">CTA Link</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 bg-[#1f2940]">
                {filteredBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-[#2c3754] transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={banner.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop'}
                        alt={banner.title}
                        className="w-20 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                    </td>
                    <td className="py-4 px-4 font-bold text-white">{banner.title}</td>
                    <td className="py-4 px-4">
                      {banner.tag ? (
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#4cceac]/20 text-[#4cceac] border border-[#4cceac]/40">
                          {banner.tag}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-[#4cceac] max-w-xs truncate">
                      {banner.ctaLink || '-'}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                          banner.isActive
                            ? 'bg-[#4cceac]/20 text-[#4cceac] border-[#4cceac]/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(banner)}
                          className="p-1.5 rounded-lg bg-[#141b2d] hover:bg-[#3e4396] text-[#4cceac] hover:text-white border border-slate-700 cursor-pointer transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingBanner(banner)}
                          className="p-1.5 rounded-lg bg-[#141b2d] hover:bg-rose-900/50 text-rose-400 border border-slate-700 cursor-pointer transition-all"
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
          <TableFooter totalItems={filteredBanners.length} />
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-cyan w-full max-w-lg rounded-3xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingBannerId ? <Edit2 className="w-5 h-5 text-cyan-400" /> : <Plus className="w-5 h-5 text-cyan-400" />}
                {editingBannerId ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Livotec & RO Water Purifiers Showcase"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tag / Badge</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. Featured, Offer, New"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CTA Link (URL / Route)</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="e.g. /products or https://..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-cyan-400 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Cloudinary Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Banner Image * (Cloudinary Folder: <span className="text-cyan-400">banners/</span>)
                </label>
                <div className="border-2 border-dashed border-cyan-500/30 rounded-2xl p-4 text-center hover:border-cyan-400 transition-colors bg-slate-900/50">
                  {previewUrl || existingImageUrl ? (
                    <div className="relative w-full h-36 mx-auto rounded-xl overflow-hidden border border-cyan-400/40">
                      <img src={previewUrl || existingImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); setPreviewUrl(''); setExistingImageUrl(''); }}
                        className="absolute top-2 right-2 p-1.5 bg-slate-950/80 rounded-full text-white cursor-pointer hover:bg-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4">
                      <Upload className="w-8 h-8 text-cyan-400 animate-bounce" />
                      <span className="text-xs text-slate-300">Click to upload banner image file</span>
                      <span className="text-[10px] text-slate-500 font-mono">Preset: aqua_point | Folder: banners</span>
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

              {/* Active Status Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-white/10">
                <div>
                  <p className="text-xs font-semibold text-white">Active Visibility</p>
                  <p className="text-[11px] text-slate-400">Show this banner in the user website hero slider</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`p-1.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {isActive ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-slate-500" />}
                  <span className="text-xs font-bold pr-1">{isActive ? 'Active' : 'Inactive'}</span>
                </button>
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
                      <span>{selectedFile ? 'Uploading Image...' : 'Saving to Firestore...'}</span>
                    </>
                  ) : (
                    <span>{editingBannerId ? 'Update Banner' : 'Create Banner'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border-rose-500/30 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Banner</h3>
                <p className="text-xs text-slate-400">Confirm deletion of banner slide.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete banner <strong className="text-white">"{deletingBanner.title}"</strong>? It will immediately be removed from the user website hero slider.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setDeletingBanner(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBanner}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Banner</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
