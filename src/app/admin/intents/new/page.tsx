// src/app/admin/intents/new/page.tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Lightbulb, Link2, Sparkles } from 'lucide-react';
import Link from 'next/link';

const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics' },
  { id: '2', name: 'Fashion', slug: 'fashion' },
  { id: '3', name: 'Home & Garden', slug: 'home' },
  { id: '4', name: 'Beauty & Personal Care', slug: 'beauty' },
  { id: '5', name: 'Sports & Outdoors', slug: 'sports' },
  { id: '6', name: 'Books & Media', slug: 'books' },
];

const mockProducts = [
  { id: '1', name: 'Argan Oil Premium 100ml', categoryId: '4', price: 2499, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200' },
  { id: '2', name: 'Moroccan Leather Bag', categoryId: '2', price: 8990, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200' },
  { id: '3', name: 'Rose Water 100ml', categoryId: '4', price: 499, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200' },
  { id: '4', name: 'Berber Carpet 2x3m', categoryId: '3', price: 45000, image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=200' },
  { id: '5', name: 'Tagine Pot Traditional', categoryId: '3', price: 3500, image: 'https://images.unsplash.com/photo-1585237672814-2f5bc7769a94?w=200' },
  { id: '6', name: 'Moroccan Tea Set', categoryId: '3', price: 5990, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200' },
];

const intentColors = [
  'from-purple-500 to-indigo-600',
  'from-blue-500 to-cyan-600',
  'from-pink-500 to-rose-600',
  'from-orange-500 to-amber-600',
  'from-green-500 to-emerald-600',
  'from-red-500 to-orange-600',
];

const intentIcons = ['🎮', '💼', '🧖', '✈️', '🎁', '💪'];

export default function NewIntentPage() {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState(intentIcons[0]);
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [color, setColor] = useState(intentColors[0]);
  const [active, setActive] = useState(true);

  const addCategory = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
  };

  const addProduct = (productId: string) => {
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((id) => id !== productId));
  };

  const selectedCategoriesData = selectedCategories.map((id) => mockCategories.find((c) => c.id === id)).filter(Boolean);
  const selectedProductsData = selectedProducts.map((id) => mockProducts.find((p) => p.id === id)).filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log({
      title,
      icon,
      description,
      categories: selectedCategories,
      products: selectedProducts,
      color,
      active,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/intents"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create Smart Intent</h1>
            <p className="text-slate-600 mt-1">Create an intent for auto bundle generation</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Intent Info */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Intent Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Intent Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Gaming Setup"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Icon
                </label>
                <div className="flex gap-2 flex-wrap">
                  {intentIcons.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`w-12 h-12 text-2xl rounded-lg border-2 transition-colors ${
                        icon === emoji ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-slate-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this intent is for..."
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Color Theme
                </label>
                <div className="flex gap-2">
                  {intentColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c} transition-transform ${
                        color === c ? 'ring-2 ring-brand-500 scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
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
                  Active (will generate bundles)
                </label>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Linked Categories
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Categories
                </label>
                <div className="flex gap-2 flex-wrap">
                  {mockCategories
                    .filter((c) => !selectedCategories.includes(c.id))
                    .map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => addCategory(category.id)}
                        className="px-3 py-2 border border-border rounded-lg hover:bg-slate-50 transition-colors text-sm"
                      >
                        {category.name}
                      </button>
                    ))}
                </div>
              </div>

              {selectedCategoriesData.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Selected Categories
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedCategoriesData.map((category) => (
                      <span
                        key={category.id}
                        className="px-3 py-2 bg-brand-100 text-brand-700 rounded-lg text-sm flex items-center gap-2"
                      >
                        {category.name}
                        <button
                          type="button"
                          onClick={() => removeCategory(category.id)}
                          className="hover:text-brand-900"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Suggested Products
            </h2>
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          {title && (
            <div className={`bg-white rounded-lg border border-border shadow-sm overflow-hidden ${!active ? 'opacity-60' : ''}`}>
              <div className={`p-5 bg-gradient-to-r ${color} text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-4xl">{icon}</div>
                  </div>
                  <h3 className="font-bold text-lg">{title}</h3>
                  <p className="text-sm text-white/80 mt-1">{description || 'Smart Intent'}</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-700 uppercase mb-2 flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCategoriesData.map((cat) => (
                      <span key={cat.id} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">Products</p>
                    <p className="text-lg font-bold text-slate-900">{selectedProductsData.length}</p>
                  </div>
                  <div className={`p-3 bg-gradient-to-br ${color} bg-opacity-10 rounded-lg`}>
                    <p className="text-xs text-slate-600">Auto Bundles</p>
                    <p className="text-lg font-bold text-slate-900">0</p>
                  </div>
                </div>
                <div className={`px-3 py-2 rounded-lg text-center text-xs font-bold ${
                  active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <div className="space-y-3">
              <button
                type="submit"
                disabled={selectedCategories.length === 0 || selectedProducts.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Create Intent
              </button>
              <Link
                href="/admin/intents"
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
