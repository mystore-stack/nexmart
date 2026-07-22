// src/app/admin/bundles/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Package, Calculator } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const mockProducts = [
  { id: '1', name: 'Argan Oil Premium 100ml', price: 2499, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200' },
  { id: '2', name: 'Moroccan Leather Bag', price: 8990, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200' },
  { id: '3', name: 'Rose Water 100ml', price: 499, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200' },
  { id: '4', name: 'Berber Carpet 2x3m', price: 45000, image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=200' },
  { id: '5', name: 'Tagine Pot Traditional', price: 3500, image: 'https://images.unsplash.com/photo-1585237672814-2f5bc7769a94?w=200' },
  { id: '6', name: 'Moroccan Tea Set', price: 5990, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200' },
];

const mockBundles: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Moroccan Beauty Essentials',
    products: ['1', '3', '5'],
    regularPrice: 3500,
    bundlePrice: 2490,
    discount: 29,
    sales: 240,
    active: true,
  },
  '2': {
    id: '2',
    name: 'Home Comfort Set',
    products: ['5', '4', '6'],
    regularPrice: 8500,
    bundlePrice: 5990,
    discount: 30,
    sales: 87,
    active: true,
  },
  '3': {
    id: '3',
    name: 'Luxury Fashion Bundle',
    products: ['2', '5', '6'],
    regularPrice: 12000,
    bundlePrice: 7990,
    discount: 33,
    sales: 156,
    active: true,
  },
  '4': {
    id: '4',
    name: 'Gift Starter Pack',
    products: ['1', '3', '2'],
    regularPrice: 5990,
    bundlePrice: 3990,
    discount: 33,
    sales: 420,
    active: false,
  },
};

export default function EditBundlePage() {
  const params = useParams();
  const bundleId = params.id as string;
  
  const [bundle, setBundle] = useState(mockBundles[bundleId] || mockBundles['1']);
  const [name, setName] = useState(bundle.name);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(bundle.products);
  const [bundlePrice, setBundlePrice] = useState(bundle.bundlePrice.toString());
  const [active, setActive] = useState(bundle.active);

  const addProduct = (productId: string) => {
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((id) => id !== productId));
  };

  const selectedProductsData = selectedProducts.map((id) => mockProducts.find((p) => p.id === id)).filter(Boolean);
  
  const totalPrice = selectedProductsData.reduce((sum, p) => sum + (p?.price || 0), 0);
  const bundlePriceNum = Number(bundlePrice) || 0;
  const discount = totalPrice > 0 ? Math.round(((totalPrice - bundlePriceNum) / totalPrice) * 100) : 0;
  const savings = totalPrice - bundlePriceNum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log({
      id: bundleId,
      name,
      products: selectedProducts,
      bundlePrice: bundlePriceNum,
      totalPrice,
      discount,
      active,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/bundles"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Bundle #{bundleId}</h1>
            <p className="text-slate-600 mt-1">Modify product bundle with special pricing</p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg ${
        active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold">{active ? 'Active' : 'Inactive'}</p>
            <p className="text-sm opacity-80">
              {active ? 'Bundle is visible to customers' : 'Bundle is hidden from customers'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm">Total Sales</p>
            <p className="font-bold text-lg">{bundle.sales}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bundle Info */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Bundle Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bundle Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="active" className="text-sm font-medium text-slate-700">
                  Active (visible to customers)
                </label>
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Bundle Products</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Add Products
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockProducts
                    .filter((p) => !selectedProducts.includes(p.id))
                    .map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addProduct(product.id)}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{product.name}</p>
                          <p className="text-xs text-slate-600">MAD {product.price.toLocaleString()}</p>
                        </div>
                        <Plus className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                </div>
              </div>

              {/* Selected Products */}
              {selectedProductsData.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Selected Products ({selectedProductsData.length})
                  </label>
                  <div className="space-y-2">
                    {selectedProductsData.map((product) => (
                      <div key={product.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{product.name}</p>
                          <p className="text-xs text-slate-600">MAD {product.price.toLocaleString()}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Pricing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bundle Price (MAD)
                </label>
                <input
                  type="number"
                  value={bundlePrice}
                  onChange={(e) => setBundlePrice(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              {selectedProductsData.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Regular Price</span>
                    <span className="font-bold text-slate-400 line-through">MAD {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Bundle Price</span>
                    <span className="font-bold text-green-600">MAD {bundlePriceNum.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Discount</span>
                    <span className="font-bold text-orange-600">{discount}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Customer Saves</span>
                    <span className="font-bold text-green-600">MAD {savings.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          {selectedProductsData.length > 0 && (
            <div className={`bg-white rounded-lg border border-border shadow-sm overflow-hidden ${!active ? 'opacity-60' : ''}`}>
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-foreground">Bundle Preview</h3>
              </div>
              <div className="p-4">
                <div className="relative h-40 bg-slate-100 rounded-lg overflow-hidden mb-4 p-4">
                  <div className="flex items-end justify-center gap-2 h-full">
                    {selectedProductsData.slice(0, 3).map((product, idx) => (
                      <div
                        key={product.id}
                        className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-lg"
                        style={{
                          transform: `translateY(${idx * -6}px)`,
                          zIndex: selectedProductsData.length - idx,
                        }}
                      >
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className={`absolute top-2 right-2 px-2 py-1 ${active ? 'bg-orange-500' : 'bg-slate-500'} text-white rounded-full text-xs font-bold`}>
                    Save {discount}%
                  </div>
                  {!active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">INACTIVE</span>
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-foreground mb-2">{name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-green-600">
                    MAD {bundlePriceNum.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-500 line-through">
                    MAD {totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  <p>{selectedProductsData.length} products included</p>
                  <p>Save MAD {savings.toLocaleString()}</p>
                  <p>{bundle.sales} sales</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <div className="space-y-3">
              <button
                type="submit"
                disabled={selectedProductsData.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <Link
                href="/admin/bundles"
                className="w-full px-4 py-3 border border-border rounded-lg font-medium hover:bg-slate-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="button"
                className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                Delete Bundle
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
