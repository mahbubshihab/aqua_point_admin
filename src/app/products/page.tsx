'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Droplets, 
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
  Star
} from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { 
  subscribeToProducts, 
  subscribeToCategories,
  addProductToFirestore, 
  updateProductInFirestore, 
  deleteProductFromFirestore,
  ProductDoc,
  CategoryDoc 
} from '@/lib/firebase';

const CORE_CATEGORIES = [
  'RO Purifiers',
  'Cabinet Purifiers',
  'Water Dispensers',
  'Filters & Cartridges',
  'Spare Parts',
  'Industrial RO Plants'
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedStockFilter, setSelectedStockFilter] = useState('All');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Delete Modal State
  const [deletingProduct, setDeletingProduct] = useState<ProductDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('RO Purifiers');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [warranty, setWarranty] = useState('1 Year Standard Warranty');
  const [application, setApplication] = useState('Household');
  const [description, setDescription] = useState('');
  const [stockStatus, setStockStatus] = useState<'In Stock' | 'Low Stock' | 'Out of Stock' | 'Pre-Order'>('In Stock');
  const [featured, setFeatured] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Real-time Firestore Sync
  useEffect(() => {
    setLoading(true);
    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    const unsubCategories = subscribeToCategories((cats) => {
      setCategories(cats);
    });

    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  // Merge available category options
  const allCategoryNames = Array.from(
    new Set([...CORE_CATEGORIES, ...categories.map(c => c.name)])
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormError('');
    }
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setName('');
    setModel('');
    setCategory('RO Purifiers');
    setPrice('');
    setOriginalPrice('');
    setWarranty('1 Year Standard Warranty');
    setApplication('Household');
    setDescription('');
    setStockStatus('In Stock');
    setFeatured(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setExistingImageUrl('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductDoc) => {
    setEditingProductId(product.id);
    setName(product.name);
    setModel(product.model || '');
    setCategory(product.category || 'RO Purifiers');
    setPrice(product.price.toString());
    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
    setWarranty(product.warranty || '1 Year Standard Warranty');
    setApplication(product.application || 'Household');
    setDescription(product.description || '');
    setStockStatus(product.stockStatus || 'In Stock');
    setFeatured(Boolean(product.featured));
    setSelectedFile(null);
    setPreviewUrl('');
    setExistingImageUrl(product.imageUrl || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setFormError('Please enter a valid positive price.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      let finalImageUrl = existingImageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop';
      
      if (selectedFile) {
        finalImageUrl = await uploadToCloudinary(selectedFile, 'products');
      }

      const productPayload: Omit<ProductDoc, 'id'> = {
        name: name.trim(),
        model: model.trim() || 'AP-' + Math.floor(100 + Math.random() * 900),
        category,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        warranty: warranty.trim() || '1 Year Standard Warranty',
        application: application.trim() || 'Household',
        description: description.trim() || '',
        stockStatus,
        featured,
        filterHealth: 100,
        imageUrl: finalImageUrl,
      };

      if (editingProductId) {
        await updateProductInFirestore(editingProductId, productPayload);
        setSuccessMessage(`Product "${name}" updated successfully!`);
      } else {
        await addProductToFirestore(productPayload);
        setSuccessMessage(`Product "${name}" added to catalog!`);
      }

      setTimeout(() => setSuccessMessage(''), 3500);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    try {
      await deleteProductFromFirestore(deletingProduct.id);
      setSuccessMessage(`Product "${deletingProduct.name}" deleted successfully.`);
      setTimeout(() => setSuccessMessage(''), 3500);
      setDeletingProduct(null);
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert(`Error deleting product: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.model && p.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
    const matchesStock = selectedStockFilter === 'All' || p.stockStatus === selectedStockFilter;

    return matchesSearch && matchesCategory && matchesStock;
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
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Products
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your product catalog.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 text-xs rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 cursor-pointer font-bold"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add New Product
        </button>
      </div>

      {/* Control Bar: Search Input + Stock Filter Dropdown + Grid/Table View Toggles */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 glass-panel rounded-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by title, model code, or description..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>

            {/* Stock Status Filter */}
            <div className="relative w-full sm:w-36">
              <select
                value={selectedStockFilter}
                onChange={(e) => setSelectedStockFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="All">All Stock</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Pre-Order">Pre-Order</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-white/10">
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredProducts.length} of {products.length} Products
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

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryFilter('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategoryFilter === 'All'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                : 'bg-slate-900/70 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            All Products ({products.length})
          </button>
          {CORE_CATEGORIES.map((cat) => {
            const count = products.filter(p => p.category === cat).length;
            const isActive = selectedCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                    : 'bg-slate-900/70 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-cyan-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center space-y-3">
          <Droplets className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Products Found</h3>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add New Product
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="glass-panel glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group relative">
              <div>
                {/* Product Image Box */}
                <div className="relative w-full h-52 bg-slate-900 overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {p.featured && (
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-400/40 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-300" /> Featured
                      </span>
                    )}
                    <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-400/30 truncate max-w-[120px]">
                      {p.model || 'AP-MODEL'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full backdrop-blur-md border ${
                      p.stockStatus === 'In Stock'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : p.stockStatus === 'Low Stock'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                        : p.stockStatus === 'Out of Stock'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                    }`}>
                      {p.stockStatus}
                    </span>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 truncate">
                        {p.category}
                      </span>
                      {p.application && (
                        <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          {p.application}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 line-clamp-1 group-hover:text-cyan-300 transition-colors">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    )}
                    {p.warranty && (
                      <p className="text-[11px] text-cyan-400/80 mt-1 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {p.warranty}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Price & Actions */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-white/5 mt-2">
                <div>
                  <div className="text-lg font-extrabold text-white flex items-baseline gap-1.5">
                    <span>৳{p.price.toLocaleString()}</span>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="text-xs text-slate-500 line-through font-normal">
                        ৳{p.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                    title="Edit Product"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingProduct(p)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                    title="Delete Product"
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
        <div className="glass-panel rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Application</th>
                  <th className="py-3.5 px-4">Warranty</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-cyan-500/[0.03]">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {p.name}
                            {p.featured && (
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-cyan-400 font-mono">{p.model || 'AP-STANDARD'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-200">
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">৳{p.price.toLocaleString()}</div>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <div className="text-[10px] text-slate-500 line-through">৳{p.originalPrice.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300">{p.application || 'Household'}</td>
                    <td className="py-4 px-4 text-slate-400">{p.warranty || '1 Year Warranty'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        p.stockStatus === 'In Stock'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : p.stockStatus === 'Low Stock'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : p.stockStatus === 'Out of Stock'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      }`}>
                        {p.stockStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-white/10 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel-cyan w-full max-w-2xl rounded-3xl p-6 relative space-y-5 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingProductId ? <Edit2 className="w-5 h-5 text-cyan-400" /> : <Plus className="w-5 h-5 text-cyan-400" />}
                {editingProductId ? 'Edit Product Details' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. AquaPurify Pro 7-Stage RO"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model Code</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. AP-900-ROUV"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {allCategoryNames.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Price (৳) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 18500"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Original Price (৳)</label>
                  <input
                    type="number"
                    step="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="e.g. 22000"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Application</label>
                  <select
                    value={application}
                    onChange={(e) => setApplication(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="Household">Household</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Office">Office</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Universal">Universal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Warranty Period</label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    placeholder="e.g. 1 Year Warranty"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Status</label>
                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Pre-Order">Pre-Order</option>
                  </select>
                </div>
              </div>

              {/* Description & Featured Toggle */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Product specifications, filtration capacity, stage details..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/10">
                  <input
                    type="checkbox"
                    id="featuredToggle"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-950 border-white/20 cursor-pointer"
                  />
                  <label htmlFor="featuredToggle" className="text-xs text-slate-200 cursor-pointer font-medium flex items-center gap-1.5">
                    <Star className={`w-3.5 h-3.5 ${featured ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                    Highlight as Featured Product
                  </label>
                </div>
              </div>

              {/* Cloudinary Image Upload Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Product Image
                </label>
                <div className="border-2 border-dashed border-cyan-500/30 rounded-2xl p-4 text-center hover:border-cyan-400 transition-colors bg-slate-900/50">
                  {previewUrl || existingImageUrl ? (
                    <div className="relative w-36 h-36 mx-auto rounded-xl overflow-hidden border border-cyan-400/40">
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
                      <Upload className="w-8 h-8 text-cyan-400 animate-bounce" />
                      <span className="text-xs text-slate-300">Click to upload product photo</span>
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
                      <span>{selectedFile ? 'Uploading image...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{editingProductId ? 'Update Product' : 'Save Product'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border-rose-500/30 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Product</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to permanently remove <strong className="text-white">"{deletingProduct.name}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Product</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
