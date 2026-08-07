'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { 
  Droplets, 
  Plus, 
  Search, 
  Upload, 
  LayoutGrid, 
  List, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Filter, 
  Sparkles,
  DollarSign,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  model: string;
  category: string;
  price: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Pre-Order';
  filterHealth: number;
  imageUrl: string;
}

const initialProducts: Product[] = [
  {
    id: 'PROD-101',
    name: 'AquaPurify Pro 900',
    model: 'AP-900-ROUV',
    category: 'RO + UV Purifier',
    price: 499,
    stockStatus: 'In Stock',
    filterHealth: 96,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'PROD-102',
    name: 'AquaUltra UV Pure',
    model: 'AU-UV-200',
    category: 'UV Filtration System',
    price: 349,
    stockStatus: 'In Stock',
    filterHealth: 88,
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'PROD-103',
    name: 'AquaSmart Dispenser X1',
    model: 'AS-DISP-X1',
    category: 'Smart Hot/Cold Dispenser',
    price: 699,
    stockStatus: 'Low Stock',
    filterHealth: 74,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'PROD-104',
    name: 'AquaAlkaline System HD',
    model: 'AA-ALK-HD',
    category: 'Alkaline Water System',
    price: 580,
    stockStatus: 'In Stock',
    filterHealth: 92,
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=800&auto=format&fit=crop',
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add Product Form State
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('RO + UV Purifier');
  const [price, setPrice] = useState('');
  const [stockStatus, setStockStatus] = useState<'In Stock' | 'Low Stock' | 'Pre-Order'>('In Stock');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError('');
    }
  };

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !model || !price) {
      setUploadError('Please fill in all required fields.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      let finalImageUrl = 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop';
      
      if (selectedFile) {
        finalImageUrl = await uploadToCloudinary(selectedFile);
      }

      const newProd: Product = {
        id: `PROD-${Date.now().toString().slice(-3)}`,
        name,
        model,
        category,
        price: parseFloat(price),
        stockStatus,
        filterHealth: 100,
        imageUrl: finalImageUrl,
      };

      setProducts([newProd, ...products]);
      setIsModalOpen(false);

      // Reset Form
      setName('');
      setModel('');
      setCategory('RO + UV Purifier');
      setPrice('');
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Purifier Products <Sparkles className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage connected RO units, filtration systems, and Cloudinary media catalog.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
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
            placeholder="Search products by model, category or title..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
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
              className={`p-2 rounded-lg transition-all ${
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

      {/* Grid View */}
      {viewMode === 'grid' ? (
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
                  <div className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-400/30">
                    {p.id}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-400/30">
                    {p.stockStatus}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{p.category}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{p.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{p.model}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Telemetry Health</span>
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
                <button className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-all">
                  Edit Model
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
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4">Telemetry Health</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
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
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {p.stockStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-32">
                        <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                          <span>Health</span>
                          <span className="text-cyan-400 font-bold">{p.filterHealth}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-cyan-400"
                            style={{ width: `${p.filterHealth}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-3 py-1.5 text-xs rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-white/10">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-cyan w-full max-w-lg rounded-3xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" /> Add Product to Catalog
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. AquaPurify Max"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model Code</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. AP-MAX-100"
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
                    <option value="RO + UV Purifier">RO + UV Purifier</option>
                    <option value="UV Filtration System">UV Filtration System</option>
                    <option value="Smart Hot/Cold Dispenser">Smart Hot/Cold Dispenser</option>
                    <option value="Alkaline Water System">Alkaline Water System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="499"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Cloudinary Image Upload Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Product Image (Cloudinary Preset: <span className="text-cyan-400">aqua_point</span>)
                </label>
                <div className="border-2 border-dashed border-cyan-500/30 rounded-2xl p-4 text-center hover:border-cyan-400 transition-colors bg-slate-900/50">
                  {previewUrl ? (
                    <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border border-cyan-400/40">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                        className="absolute top-1 right-1 p-1 bg-slate-950/80 rounded-full text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                      <Upload className="w-8 h-8 text-cyan-400 animate-bounce" />
                      <span className="text-xs text-slate-300">Click to upload product photo to Cloudinary</span>
                      <span className="text-[10px] text-slate-500">Cloud: rvoym2gw | Preset: aqua_point</span>
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
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isUploading ? 'Uploading to Cloudinary...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
