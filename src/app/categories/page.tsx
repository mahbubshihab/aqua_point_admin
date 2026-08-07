'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Upload, 
  LayoutGrid, 
  List, 
  AlertCircle, 
  X, 
  Sparkles,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  Package,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { 
  subscribeToCategories, 
  subscribeToProducts,
  addCategoryToFirestore, 
  updateCategoryInFirestore, 
  deleteCategoryFromFirestore,
  CategoryDoc,
  ProductDoc 
} from '@/lib/firebase';

const CORE_CATEGORIES = [
  {
    name: 'RO Purifiers',
    slug: 'ro-purifiers',
    description: 'Advanced Reverse Osmosis multi-stage purification systems for homes & offices.',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Cabinet Purifiers',
    slug: 'cabinet-purifiers',
    description: 'Sleek wall-mounted and tabletop cabinet water purifiers with high storage.',
    imageUrl: 'https://images.unsplash.com/photo-1527264935190-1401c51b5bab?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Water Dispensers',
    slug: 'water-dispensers',
    description: 'Hot, Cold, and Normal temperature dispenser units with built-in filtration.',
    imageUrl: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Filters & Cartridges',
    slug: 'filters-cartridges',
    description: 'Sediment filters, Carbon block, RO membranes, UV lamps, and Mineral cartridges.',
    imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Spare Parts',
    slug: 'spare-parts',
    description: 'Booster pumps, adapters, solenoid valves, connectors, and replacement fittings.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Industrial RO Plants',
    slug: 'industrial-ro-plants',
    description: 'High capacity commercial & industrial reverse osmosis water treatment plants.',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop'
  }
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Delete Modal State
  const [deletingCategory, setDeletingCategory] = useState<CategoryDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Real-time Firestore Sync
  useEffect(() => {
    setLoading(true);
    const unsubCat = subscribeToCategories((cats) => {
      setCategories(cats);
      setLoading(false);
    });
    const unsubProd = subscribeToProducts((prods) => {
      setProducts(prods);
    });

    return () => {
      unsubCat();
      unsubProd();
    };
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategoryId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormError('');
    }
  };

  const openAddModal = () => {
    setEditingCategoryId(null);
    setName('');
    setSlug('');
    setDescription('');
    setSelectedFile(null);
    setPreviewUrl('');
    setExistingImageUrl('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryDoc) => {
    setEditingCategoryId(cat.id);
    setName(cat.name);
    setSlug(cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    setDescription(cat.description || '');
    setSelectedFile(null);
    setPreviewUrl('');
    setExistingImageUrl(cat.imageUrl || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category Name is required.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      let finalImageUrl = existingImageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop';

      if (selectedFile) {
        finalImageUrl = await uploadToCloudinary(selectedFile, 'categories');
      }

      const generatedSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const payload: Omit<CategoryDoc, 'id'> = {
        name: name.trim(),
        slug: generatedSlug,
        description: description.trim(),
        imageUrl: finalImageUrl,
        productCount: products.filter(p => p.category === name.trim()).length,
      };

      if (editingCategoryId) {
        await updateCategoryInFirestore(editingCategoryId, payload);
        setSuccessMessage(`Category "${name}" updated successfully!`);
      } else {
        await addCategoryToFirestore(payload);
        setSuccessMessage(`Category "${name}" created in Cloud Firestore!`);
      }

      setTimeout(() => setSuccessMessage(''), 3500);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving category:', err);
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;

    setIsDeleting(true);
    try {
      await deleteCategoryFromFirestore(deletingCategory.id);
      setSuccessMessage(`Category "${deletingCategory.name}" removed.`);
      setTimeout(() => setSuccessMessage(''), 3500);
      setDeletingCategory(null);
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert(`Failed to delete category: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedCoreCategories = async () => {
    setIsSeeding(true);
    try {
      for (const coreCat of CORE_CATEGORIES) {
        const exists = categories.some(c => c.name.toLowerCase() === coreCat.name.toLowerCase());
        if (!exists) {
          await addCategoryToFirestore({
            name: coreCat.name,
            slug: coreCat.slug,
            description: coreCat.description,
            imageUrl: coreCat.imageUrl,
            productCount: products.filter(p => p.category === coreCat.name).length
          });
        }
      }
      setSuccessMessage('Core categories seeded to Cloud Firestore successfully!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err: any) {
      console.error('Error seeding categories:', err);
      alert(`Error seeding categories: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Categories
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage product categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedCoreCategories}
            disabled={isSeeding}
            className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-400/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Populate 6 Core AQUA POINT Categories"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Seed Core Categories
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 cursor-pointer font-bold"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Category
          </button>
        </div>
      </div>

      {/* Search & View Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-panel rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search category by title, slug or description..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
          />
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <span className="text-xs text-slate-400 font-mono">
            {filteredCategories.length} Categori{filteredCategories.length === 1 ? 'y' : 'es'}
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
          <p className="text-xs text-slate-400">Loading categories from Cloud Firestore...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center space-y-4">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Categories Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? 'No categories match your search term.'
              : 'You have no custom categories yet. Click "Seed Core Categories" to load the 6 default categories instantly!'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSeedCoreCategories}
              disabled={isSeeding}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 cursor-pointer font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)]"
            >
              Seed 6 Core Categories
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 cursor-pointer"
            >
              Add Custom Category
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const liveProductCount = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
            return (
              <div key={cat.id} className="glass-panel glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group relative">
                <div>
                  {/* Banner Image */}
                  <div className="relative w-full h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={cat.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop'}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D16] via-[#0A0D16]/40 to-transparent" />
                    
                    <div className="absolute top-3 right-3 px-3 py-1 text-xs font-extrabold rounded-full bg-cyan-500/20 backdrop-blur-md text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                      <Package className="w-3.5 h-3.5" /> {liveProductCount} Product{liveProductCount !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-2 relative -mt-6">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-950/80 border border-cyan-400/30 text-cyan-400">
                      /{cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    </span>
                    <h3 className="text-lg font-bold text-white pt-1 group-hover:text-cyan-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {cat.description || 'Category for Aqua Point purifiers, spare parts, and filtration systems.'}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 flex items-center justify-between border-t border-white/5 mt-2">
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group/link"
                  >
                    View Products <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Live Items</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCategories.map((cat) => {
                  const liveCount = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
                  return (
                    <tr key={cat.id} className="hover:bg-cyan-500/[0.03]">
                      <td className="py-4 px-4 font-bold text-white">
                        <div className="flex items-center gap-3">
                          <img
                            src={cat.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop'}
                            alt={cat.name}
                            className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                          />
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-cyan-400">/{cat.slug}</td>
                      <td className="py-4 px-4 text-slate-400 max-w-xs truncate">{cat.description || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                          {liveCount} Items
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-white/10 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingCategory(cat)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 border border-rose-500/30 cursor-pointer"
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
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-cyan w-full max-w-lg rounded-3xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingCategoryId ? <Edit2 className="w-5 h-5 text-cyan-400" /> : <Plus className="w-5 h-5 text-cyan-400" />}
                {editingCategoryId ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. RO Purifiers"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. ro-purifiers"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-cyan-400 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of products under this category..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Cloudinary Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category Banner Image (Cloudinary Folder: <span className="text-cyan-400">categories/</span>)
                </label>
                <div className="border-2 border-dashed border-cyan-500/30 rounded-2xl p-4 text-center hover:border-cyan-400 transition-colors bg-slate-900/50">
                  {previewUrl || existingImageUrl ? (
                    <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border border-cyan-400/40">
                      <img src={previewUrl || existingImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); setPreviewUrl(''); setExistingImageUrl(''); }}
                        className="absolute top-1.5 right-1.5 p-1 bg-slate-950/80 rounded-full text-white cursor-pointer hover:bg-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-2">
                      <Upload className="w-7 h-7 text-cyan-400 animate-bounce" />
                      <span className="text-xs text-slate-300">Click to upload category cover photo</span>
                      <span className="text-[10px] text-slate-500 font-mono">Preset: aqua_point | Folder: categories</span>
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
                    <span>{editingCategoryId ? 'Update Category' : 'Create Category'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border-rose-500/30 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Category</h3>
                <p className="text-xs text-slate-400">Confirm deletion of category record.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete category <strong className="text-white">"{deletingCategory.name}"</strong>? Products in this category will not be deleted but will need reassignment.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setDeletingCategory(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCategory}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Category</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
