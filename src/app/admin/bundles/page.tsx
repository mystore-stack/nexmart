// src/app/admin/bundles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';


export default function BundlesPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/bundles');
      if (!response.ok) throw new Error('Failed to fetch bundles');
      const data = await response.json();
      setBundles(data.data || []);
    } catch (err) {
      setError('Failed to load bundles');
      console.error('Error fetching bundles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

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
          <button onClick={fetchBundles} className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg">
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
          <h1 className="text-3xl font-bold text-foreground">Bundle Deals</h1>
          <p className="text-slate-600 mt-1">{bundles.length} active bundles</p>
        </div>
        <Link
          href="/admin/bundles/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Bundle
        </Link>
      </div>

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => (
          <div key={bundle.id} className={`bg-white rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
            !bundle.active ? 'opacity-60' : ''
          }`}>
            {/* Stacked Products Preview */}
            <div className="relative h-48 bg-slate-100 p-4">
              <div className="flex items-end justify-center gap-2 h-full">
                {bundle.products.map((product, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-lg"
                    style={{
                      transform: `translateY(${idx * -8}px)`,
                      zIndex: bundle.products.length - idx,
                    }}
                  >
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  bundle.active ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                }`}>
                  {bundle.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            {/* Card Body */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-brand-100 rounded-lg">
                    <Package className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{bundle.name}</h3>
                    <p className="text-xs text-slate-600">{bundle.sales} sales</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Link
                    href={`/admin/bundles/${bundle.id}/edit`}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-slate-600" />
                  </Link>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Products List */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Products included</p>
                <div className="flex flex-wrap gap-1">
                  {bundle.products.map((product, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                      {product.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-slate-600">Regular Price</p>
                    <p className="text-base font-bold text-slate-400 line-through">MAD {bundle.regularPrice.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600">Bundle Price</p>
                    <p className="text-xl font-bold text-green-600">MAD {bundle.bundlePrice.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-block px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
                    Save {bundle.discount}%
                  </span>
                  <span className="text-xs text-green-600 font-medium">
                    Save MAD {(bundle.regularPrice - bundle.bundlePrice).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action */}
              <Link
                href={`/admin/bundles/${bundle.id}/edit`}
                className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors text-center flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Bundle
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
