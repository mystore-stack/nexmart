// src/app/admin/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Grid, List, Filter, Check, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  lowStockAt: number;
  featured: boolean;
  published: boolean;
  images: string[];
  category: { name: string } | null;
  sku: string;
  _count?: {
    orderItems: number;
  };
}


export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.data || []);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  const filteredProducts = products.map((p) => ({
    ...p,
    category: p.category?.name || 'Uncategorized',
    image: p.images?.[0] || '/placeholder.png',
  })).filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600">{error}</p>
          <button onClick={fetchProducts} className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-slate-600 mt-1">{products.length} products in your store</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-border p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2 flex-1">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent flex-1 outline-none text-foreground placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${
                  viewMode === 'table' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
            {/* Filter Button */}
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-slate-50">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Filter</span>
            </button>
          </div>
        </div>
        {/* Bulk Actions */}
        {selectedProducts.size > 0 && (
          <div className="mt-3 flex items-center justify-between p-3 bg-brand-50 rounded-lg border border-brand-200">
            <p className="text-sm font-medium text-brand-700">
              {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                Delete
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-100 rounded-lg">
                Publish
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table/Grid */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-slate-600">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">MAD {product.price.toLocaleString()}</p>
                        {product.comparePrice && (
                          <p className="text-xs text-slate-600 line-through">MAD {product.comparePrice.toLocaleString()}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              product.stock < 50 ? 'bg-red-500' : product.stock < 150 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((product.stock / 500) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600">{product.stock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {product.featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">
                            Featured
                          </span>
                        )}
                        {product.published ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                            Live
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">
                            Draft
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-slate-600" />
                        </Link>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                selectedProducts.has(product.id) ? 'ring-2 ring-brand-500' : ''
              }`}
            >
              <div className="relative">
                <div className="aspect-square bg-slate-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-2 left-2 flex gap-1">
                  {product.featured && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                      Featured
                    </span>
                  )}
                  {!product.published && (
                    <span className="px-2 py-1 bg-slate-700 text-white text-xs font-bold rounded">
                      Draft
                    </span>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => toggleSelect(product.id)}
                  className="absolute top-2 right-2 w-4 h-4 rounded border-white bg-white/80"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                <p className="text-xs text-slate-600 mb-2">{product.category}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">MAD {product.price.toLocaleString()}</p>
                    {product.comparePrice && (
                      <p className="text-xs text-slate-600 line-through">MAD {product.comparePrice.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-slate-600" />
                    </Link>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        product.stock < 50 ? 'bg-red-500' : product.stock < 150 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((product.stock / 500) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600">{product.stock} in stock</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
