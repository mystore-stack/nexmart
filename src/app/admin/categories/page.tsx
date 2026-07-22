// src/app/admin/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const categoryIcons: Record<string, string> = {
  'electronics': '📱',
  'fashion': '👗',
  'home': '🏠',
  'beauty': '💄',
  'sports': '⚽',
  'books': '📚',
  'food': '🍎',
  'toys': '🎮',
  'default': '📦',
};

const categoryImages: Record<string, string> = {
  'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300',
  'fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300',
  'home': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300',
  'beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300',
  'sports': 'https://images.unsplash.com/photo-1461896836934- voices-1?w=300',
  'books': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300',
  'food': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
  'toys': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300',
  'default': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleActive = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, active: !cat.active } : cat))
    );
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId) return;
    
    const draggedIdx = categories.findIndex((c) => c.id === draggedId);
    const targetIdx = categories.findIndex((c) => c.id === targetId);
    
    if (draggedIdx === -1 || targetIdx === -1) return;

    const newCategories = [...categories];
    [newCategories[draggedIdx], newCategories[targetIdx]] = [newCategories[targetIdx], newCategories[draggedIdx]];
    
    setCategories(newCategories);
    setDraggedId(null);
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
          <button onClick={fetchCategories} className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg">
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
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-slate-600 mt-1">{categories.length} categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            draggable
            onDragStart={() => handleDragStart(category.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(category.id)}
            className={`bg-white rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-move ${
              draggedId === category.id ? 'opacity-50 ring-2 ring-brand-500' : ''
            }`}
          >
            {/* Card Header with Image */}
            <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200">
              <img src={category.image || categoryImages[category.slug] || categoryImages.default} alt={category.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 text-3xl">{categoryIcons[category.slug] || categoryIcons.default}</div>
              <div className="absolute top-2 right-2">
                {category.active ? (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-slate-700 text-white text-xs font-bold rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <div className="absolute bottom-2 left-2">
                <GripVertical className="w-5 h-5 text-slate-400" />
              </div>
            </div>
            
            {/* Card Body */}
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
              <p className="text-xs text-slate-600 mb-3 font-mono">/{category.slug}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">{category._count?.products || 0}</span>
                  <span className="text-xs text-slate-500">products</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(category.id)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {category.active ? (
                      <Eye className="w-4 h-4 text-slate-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-slate-600" />
                  </Link>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
