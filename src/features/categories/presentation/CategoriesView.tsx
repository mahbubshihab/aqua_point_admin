'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Layers, 
  Plus, 
  Upload, 
  LayoutGrid, 
  List, 
  AlertCircle, 
  X, 
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  Package,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { uploadToCloudinary } from '@/core/services/cloudinary';
import { 
  subscribeToCategories, 
  subscribeToProducts,
  addCategoryToFirestore, 
  updateCategoryInFirestore, 
  deleteCategoryFromFirestore,
  CategoryDoc,
  ProductDoc 
} from '@/core/services/firebase';
import TableFooter from '@/core/components/TableFooter';
import { useSearch } from '@/core/context/SearchContext';

export default function CategoriesView() {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { searchTerm } = useSearch();

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Delete Modal State
  const [deletingCategory, setDeletingCategory] = useState<CategoryDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredCategories = categories.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const liveCount = products.filter(p => p.category.toLowerCase() === c.name.toLowerCase()).length;
    let matchesFilter = true;
    if (selectedFilter === 'WithProducts') matchesFilter = liveCount > 0;
    if (selectedFilter === 'Empty') matchesFilter = liveCount === 0;

    return matchesSearch && matchesFilter;
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
            Categories
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-[#141b2d] text-[#00BCE1] border border-[#2c3754]">
            {filteredCategories.length} categories
          </span>
        </div>
        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-[#00BCE1]/25 rounded-full px-6 py-2.5 transition-all duration-300 transform active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Category
        </button>
      </div>

      {/* Unified Filter Bar (Single Consolidated Bar) */}
      <div className="p-4 bg-[#1f2940] border border-[#2c3754] rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-48">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 focus:outline-none focus:border-[#00BCE1] cursor-pointer transition-all"
              >
                <option value="All">All Status</option>
                <option value="WithProducts">Active With Products</option>
                <option value="Empty">Empty (0 Products)</option>
              </select>
            </div>
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
                    ? 'bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40'
                    : 'text-[#A0AEC0] hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#2c3754] scrollbar-none">
          {['All', 'WithProducts', 'Empty'].map((opt) => {
            const label = opt === 'All' ? 'All Categories' : opt === 'WithProducts' ? 'Active Catalogs' : 'Empty Categories';
            const isActive = selectedFilter === opt;
            return (
              <button
                key={opt}
                onClick={() => setSelectedFilter(opt)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#00BCE1] text-[#141b2d] font-bold shadow-md'
                    : 'bg-[#141b2d] text-[#A0AEC0] border border-[#2c3754] hover:text-white'
                }`}
              >
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading & Empty States */}
      {loading ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#00BCE1] animate-spin" />
          <p className="text-xs text-[#A0AEC0]">Loading categories from Cloud Firestore...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 text-center space-y-4">
          <Layers className="w-12 h-12 text-[#A0AEC0] mx-auto" />
          <h3 className="text-base font-bold text-white">No Categories Found</h3>
          <p className="text-xs text-[#A0AEC0] max-w-sm mx-auto">
            {searchTerm
              ? 'No categories match your search term.'
              : 'There are currently no categories in your catalog.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-[#00BCE1]/25 rounded-full px-6 py-2.5 transition-all duration-300 transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Category
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const liveProductCount = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
            return (
              <div key={cat.id} className="bg-[#1f2940] border border-[#2c3754] hover:border-[#00BCE1]/50 rounded-2xl overflow-hidden flex flex-col justify-between group relative transition-all">
                <div>
                  {/* Banner Image */}
                  <div className="relative w-full h-44 bg-[#141b2d] overflow-hidden">
                    <img
                      src={cat.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop'}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f2940] via-[#1f2940]/40 to-transparent" />
                    
                    <div className="absolute top-3 right-3 px-3 py-1 text-xs font-extrabold rounded-full bg-[#141b2d] text-[#00BCE1] border border-[#2c3754] flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> {liveProductCount} Product{liveProductCount !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-2 relative -mt-6">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#141b2d] border border-[#2c3754] text-[#00BCE1]">
                      /{cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    </span>
                    <h3 className="text-lg font-bold text-white pt-1 group-hover:text-[#00BCE1] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#A0AEC0] line-clamp-2 leading-relaxed">
                      {cat.description || 'Category for Aqua Point purifiers, spare parts, and filtration systems.'}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 flex items-center justify-between border-t border-[#2c3754] mt-2 pt-3">
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="text-xs font-semibold text-[#00BCE1] hover:text-white flex items-center gap-1 group/link"
                  >
                    View Products <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2 rounded-xl bg-[#141b2d] hover:bg-[#3e4396] text-[#00BCE1] hover:text-white border border-[#2c3754] transition-all cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      className="p-2 rounded-xl bg-[#141b2d] hover:bg-rose-950 text-rose-400 border border-[#2c3754] transition-all cursor-pointer"
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
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-[#2c3754]">
                <tr>
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Live Items</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2c3754] bg-[#1f2940]">
                {filteredCategories.map((cat) => {
                  const liveCount = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
                  return (
                    <tr key={cat.id} className="hover:bg-[#2c3754] transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        <div className="flex items-center gap-3">
                          <img
                            src={cat.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop'}
                            alt={cat.name}
                            className="w-9 h-9 rounded-lg object-cover border border-[#2c3754] shrink-0"
                          />
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-[#00BCE1]">/{cat.slug}</td>
                      <td className="py-4 px-4 text-[#A0AEC0] max-w-xs truncate">{cat.description || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40">
                          {liveCount} Items
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 rounded-lg bg-[#141b2d] hover:bg-[#3e4396] text-[#00BCE1] hover:text-white border border-[#2c3754] cursor-pointer transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingCategory(cat)}
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
          <TableFooter totalItems={filteredCategories.length} />
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141b2d]/80 backdrop-blur-md">
          <div className="bg-[#1f2940] border border-[#2c3754] w-full max-w-lg rounded-3xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#2c3754]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingCategoryId ? <Edit2 className="w-5 h-5 text-[#00BCE1]" /> : <Plus className="w-5 h-5 text-[#00BCE1]" />}
                {editingCategoryId ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-[#A0AEC0] hover:text-white hover:bg-[#141b2d] cursor-pointer"
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
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white focus:outline-none focus:border-[#00BCE1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. ro-purifiers"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-[#00BCE1] font-mono focus:outline-none focus:border-[#00BCE1]"
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
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white focus:outline-none focus:border-[#00BCE1]"
                />
              </div>

              {/* Cloudinary Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category Banner Image (Cloudinary Folder: <span className="text-[#00BCE1]">categories/</span>)
                </label>
                <div className="border-2 border-dashed border-[#2c3754] rounded-2xl p-4 text-center hover:border-[#00BCE1] transition-colors bg-[#141b2d]">
                  {previewUrl || existingImageUrl ? (
                    <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border border-[#2c3754]">
                      <img src={previewUrl || existingImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); setPreviewUrl(''); setExistingImageUrl(''); }}
                        className="absolute top-1.5 right-1.5 p-1 bg-[#141b2d] rounded-full text-white cursor-pointer hover:bg-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-2">
                      <Upload className="w-7 h-7 text-[#00BCE1] animate-bounce" />
                      <span className="text-xs text-slate-300">Click to upload category cover photo</span>
                      <span className="text-[10px] text-[#A0AEC0] font-mono">Preset: aqua_point | Folder: categories</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141b2d]/80 backdrop-blur-md">
          <div className="bg-[#1f2940] border border-rose-500/30 w-full max-w-md rounded-3xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Category</h3>
                <p className="text-xs text-[#A0AEC0]">Confirm deletion of category record.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete category <strong className="text-white">"{deletingCategory.name}"</strong>? Products in this category will not be deleted but will need reassignment.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2c3754]">
              <button
                onClick={() => setDeletingCategory(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#141b2d] hover:bg-[#2c3754] text-slate-300 border border-[#2c3754] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCategory}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold"
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
