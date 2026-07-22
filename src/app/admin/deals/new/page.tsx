// src/app/admin/deals/new/page.tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

const mockProducts = [
  { id: '1', name: 'Argan Oil Premium 100ml', price: 2499, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200' },
  { id: '2', name: 'Moroccan Leather Bag', price: 8990, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200' },
  { id: '3', name: 'Rose Water 100ml', price: 499, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200' },
  { id: '4', name: 'Berber Carpet 2x3m', price: 45000, image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=200' },
  { id: '5', name: 'Tagine Pot Traditional', price: 3500, image: 'https://images.unsplash.com/photo-1585237672814-2f5bc7769a94?w=200' },
];

export default function NewDealPage() {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [discount, setDiscount] = useState(20);
  const [stockLimit, setStockLimit] = useState(100);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [urgent, setUrgent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log({
      productId: selectedProduct,
      discount,
      stockLimit,
      startTime,
      endTime,
      urgent,
    });
  };

  const selectedProductData = mockProducts.find((p) => p.id === selectedProduct);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/deals"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Deal</h1>
            <p className="text-slate-600 mt-1">Create a flash sale or limited-time offer</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Selection */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Select Product</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  <option value="">Select a product...</option>
                  {mockProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - MAD {product.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProductData && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200">
                    <img src={selectedProductData.image} alt={selectedProductData.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedProductData.name}</p>
                    <p className="text-sm text-slate-600">Regular Price: MAD {selectedProductData.price.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deal Settings */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Deal Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Discount Percentage
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="70"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="flex-1"
                  />
                  <div className="w-20 px-3 py-2 bg-slate-100 rounded-lg text-center font-bold text-brand-600">
                    {discount}%
                  </div>
                </div>
                {selectedProductData && (
                  <p className="text-sm text-slate-600 mt-2">
                    Sale Price: <span className="font-bold text-green-600">
                      MAD {Math.round(selectedProductData.price * (1 - discount / 100)).toLocaleString()}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stock Limit
                </label>
                <input
                  type="number"
                  value={stockLimit}
                  onChange={(e) => setStockLimit(Number(e.target.value))}
                  min="1"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="urgent" className="text-sm font-medium text-slate-700">
                  Mark as Urgent (will show urgent badge)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          {selectedProductData && (
            <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-foreground">Deal Preview</h3>
              </div>
              <div className="p-4">
                <div className="relative h-40 bg-slate-100 rounded-lg overflow-hidden mb-4">
                  <img src={selectedProductData.image} alt={selectedProductData.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg font-bold">
                    -{discount}%
                  </div>
                  {urgent && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                      Urgent
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-foreground mb-2">{selectedProductData.name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-green-600">
                    MAD {Math.round(selectedProductData.price * (1 - discount / 100)).toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-500 line-through">
                    MAD {selectedProductData.price.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  <p>Stock: {stockLimit}</p>
                  <p>Duration: {startTime && endTime ? `${new Date(endTime).getTime() - new Date(startTime).getTime()}ms` : 'Not set'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <div className="space-y-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Create Deal
              </button>
              <Link
                href="/admin/deals"
                className="w-full px-4 py-3 border border-border rounded-lg font-medium hover:bg-slate-50 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
