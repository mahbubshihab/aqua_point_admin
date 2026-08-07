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
  CheckCircle2
} from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { 
  subscribeToProducts, 
  addProductToFirestore, 
  updateProductInFirestore, 
  deleteProductFromFirestore,
  ProductDoc 
} from '@/lib/firebase';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('RO + UV Purifier');
  const [price, setPrice] = useState('');
  const [warranty, setWarranty] = useState('1 Year Standard Warranty');
  const [description, setDescription] = useState('');
  const [stockStatus, setStockStatus] = useState<'In Stock' | 'Low Stock' | 'Pre-Order'>('In Stock');
  const [filterHealth, setFilterHealth] = useState('100');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Real-time Firestore Sync
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
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
    setEditingProductId(null);
    setName('');
    setModel('');
    setCategory('RO + UV Purifier');
    setPrice('');
    setWarranty('1 Year Standard Warranty');
    setDescription('');
    setStockStatus('In Stock');
    setFilterHealth('100');
    setSelectedFile(null);
    setPreviewUrl('');
    setExistingImageUrl('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductDoc) => {
    setEditingProductId(product.id);
    setName(product.name);
    setModel(product.model);
    setCategory(product.category);
    setPrice(product.price.toString());
    setWarranty(product.warranty || '1 Year Standard Warranty');
    setDescription(product.description || '');
    setStockStatus(product.stockStatus || 'In Stock');
    setFilterHealth((product.filterHealth || 100).toString());
    setSelectedFile(null);
    setPreviewUrl('');
    setExistingImageUrl(product.imageUrl || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      setFormError('Please fill in all required fields (Name and Price).');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      let finalImageUrl = existingImageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop';
      
      if (selectedFile) {
        finalImageUrl = await uploadToCloudinary(selectedFile);
      }

      const productPayload = {
        name,
        model: model || 'AP-900',
        category,
        price: parseFloat(price),
        warranty: warranty || '1 Year Warranty',
        description: description || '',
        stockStatus,
        filterHealth: parseInt(filterHealth) || 100,
        imageUrl: finalImageUrl,
      };

      if (editingProductId) {
        await updateProductInFirestore(editingProductId, productPayload);
        setSuccessMessage('Product updated successfully!');
      } else {
        await addProductToFirestore(productPayload);
        setSuccessMessage('Product added to Cloud Firestore catalog!');
      }

      setTimeout(() => setSuccessMessage(''), 3000);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setFormError(err.message || 'Failed to save product to Firestore or upload image.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setIsDeleting(id);
    try {
      await deleteProductFromFirestore(id);
      setSuccessMessage(`Product "${title}" deleted.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(`Error deleting product: ${err.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Purifier Products Catalog <Sparkles className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time synchronization with Cloud Firestore (<code className="text-cyan-400">products</code>) & Cloudinary media catalog.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add New Product
        </button>
      </div>

      {/* Control Bar: Search & View Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-panel rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title, model code, or category..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
            {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''}
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

      {/* Loading Indicator */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Connecting to Cloud Firestore...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center space-y-3">
          <Droplets className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Products Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm ? 'No products match your search query.' : 'There are currently no products in your Cloud Firestore catalog.'}
          </p>
          {!searchTerm && (
            <button
              onClick={openAddModal}
              className="mt-2 px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 cursor-pointer"
            >
              Add Your First Product
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="glass-panel glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative w-full h-48 bg-slate-900 overflow-hidden group">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-mono font-bold rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-400/30 truncate max-w-[120px]">
                    {p.id.substring(0, 10)}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-400/30">
                    {p.stockStatus || 'In Stock'}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{p.category}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{p.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{p.model}</p>
                    {p.warranty && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">{p.warranty}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Filter Health</span>
                      <span className="text-cyan-400 font-bold">{p.filterHealth}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        style={{ width: `${p.filterHealth}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-white/5 mt-2">
                <div className="text-lg font-extrabold text-white">
                  ${p.price}
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
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                    disabled={isDeleting === p.id}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-rose-400 border border-rose-500/30 transition-all cursor-pointer disabled:opacity-50"
                    title="Delete Product"
                  >
                    {isDeleting === p.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
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
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="text-[11px] text-cyan-400 font-mono">{p.model}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-300">{p.category}</td>
                    <td className="py-4 px-4 font-bold text-white">${p.price}</td>
                    <td className="py-4 px-4 text-slate-400">{p.warranty || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {p.stockStatus || 'In Stock'}
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
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          disabled={isDeleting === p.id}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 border border-rose-500/30 cursor-pointer disabled:opacity-50"
                          title="Delete"
                        >
                          {isDeleting === p.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
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
          <div className="glass-panel-cyan w-full max-w-lg rounded-3xl p-6 relative space-y-5 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingProductId ? <Edit2 className="w-5 h-5 text-cyan-400" /> : <Plus className="w-5 h-5 text-cyan-400" />}
                {editingProductId ? 'Edit Product Model' : 'Add Product to Firestore'}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title / Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. AquaPurify Pro 900"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model Code</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. AP-900-ROUV"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="RO Purifiers">RO Purifiers</option>
                    <option value="Water Filters">Water Filters</option>
                    <option value="Spare Parts">Spare Parts</option>
                    <option value="Industrial RO Plants">Industrial RO Plants</option>
                    <option value="RO + UV Purifier">RO + UV Purifier</option>
                    <option value="UV Filtration System">UV Filtration System</option>
                    <option value="Smart Hot/Cold Dispenser">Smart Hot/Cold Dispenser</option>
                    <option value="Alkaline Water System">Alkaline Water System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="499"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Warranty Period</label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    placeholder="e.g. 1 Year Standard Warranty"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Status</label>
                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Pre-Order">Pre-Order</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive technical specifications and feature overview..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Cloudinary Image Upload Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Product Image (Cloudinary Cloud: <span className="text-cyan-400">rvoym2gw</span> | Preset: <span className="text-cyan-400">aqua_point</span>)
                </label>
                <div className="border-2 border-dashed border-cyan-500/30 rounded-2xl p-4 text-center hover:border-cyan-400 transition-colors bg-slate-900/50">
                  {previewUrl || existingImageUrl ? (
                    <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border border-cyan-400/40">
                      <img src={previewUrl || existingImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); setPreviewUrl(''); setExistingImageUrl(''); }}
                        className="absolute top-1 right-1 p-1 bg-slate-950/80 rounded-full text-white cursor-pointer hover:bg-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                      <Upload className="w-8 h-8 text-cyan-400 animate-bounce" />
                      <span className="text-xs text-slate-300">Click to upload product photo to Cloudinary</span>
                      <span className="text-[10px] text-slate-500">Preset: aqua_point | Auto secure URL link</span>
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
                      <span>{selectedFile ? 'Uploading to Cloudinary...' : 'Saving to Firestore...'}</span>
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
    </div>
  );
}
