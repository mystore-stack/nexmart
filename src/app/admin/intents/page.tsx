// src/app/admin/intents/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Lightbulb, Link2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const mockIntents = [
  {
    id: '1',
    title: 'Gaming Setup',
    icon: '🎮',
    description: 'Complete gaming equipment bundle',
    categories: ['Electronics', 'Accessories'],
    suggestedProducts: 8,
    autoBundles: 3,
    createdAt: '2024-01-10',
    active: true,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: '2',
    title: 'Home Office',
    icon: '💼',
    description: 'Workspace essentials for remote workers',
    categories: ['Home', 'Electronics'],
    suggestedProducts: 12,
    autoBundles: 5,
    createdAt: '2024-01-12',
    active: true,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: '3',
    title: 'Self-Care Box',
    icon: '🧖',
    description: 'Relaxation and beauty products',
    categories: ['Beauty', 'Home'],
    suggestedProducts: 15,
    autoBundles: 4,
    createdAt: '2024-01-08',
    active: true,
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: '4',
    title: 'Travel Essentials',
    icon: '✈️',
    description: 'Must-have items for travelers',
    categories: ['Fashion', 'Accessories'],
    suggestedProducts: 10,
    autoBundles: 2,
    createdAt: '2024-01-14',
    active: false,
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: '5',
    title: 'Gift Finder',
    icon: '🎁',
    description: 'Curated gift suggestions for any occasion',
    categories: ['Fashion', 'Home', 'Beauty'],
    suggestedProducts: 20,
    autoBundles: 6,
    createdAt: '2024-01-15',
    active: true,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: '6',
    title: 'Fitness Starter',
    icon: '💪',
    description: 'Beginner fitness equipment and gear',
    categories: ['Sports', 'Home'],
    suggestedProducts: 9,
    autoBundles: 3,
    createdAt: '2024-01-16',
    active: true,
    color: 'from-red-500 to-orange-600',
  },
];

export default function IntentsPage() {
  const [intents, setIntents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/intents');
      if (!response.ok) throw new Error('Failed to fetch intents');
      const data = await response.json();
      setIntents(data.data || []);
    } catch (err) {
      setError('Failed to load intents');
      console.error('Error fetching intents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntents();
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
          <button onClick={fetchIntents} className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg">
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
          <h1 className="text-3xl font-bold text-foreground">Smart Intent System</h1>
          <p className="text-slate-600 mt-1">Create bundle suggestions based on customer intents</p>
        </div>
        <Link
          href="/admin/intents/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Intent
        </Link>
      </div>

      {/* Intents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {intents.map((intent) => (
          <div key={intent.id} className={`bg-white rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-lg transition-shadow ${
            !intent.active ? 'opacity-60' : ''
          }`}>
            {/* Header with Gradient */}
            <div className={`p-5 bg-gradient-to-r ${intent.color} text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl">{intent.icon}</div>
                  <div className="flex gap-1">
                    <Link
                      href={`/admin/intents/${intent.id}/edit`}
                      className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-lg">{intent.title}</h3>
                <p className="text-sm text-white/80 mt-1">{intent.description}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Categories */}
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2 flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  Linked Categories
                </p>
                <div className="flex flex-wrap gap-1">
                  {intent.categories.map((cat) => (
                    <span key={cat} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600">Products</p>
                  <p className="text-lg font-bold text-slate-900">{intent.suggestedProducts}</p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${intent.color} bg-opacity-10 rounded-lg`}>
                  <p className="text-xs text-slate-600">Auto Bundles</p>
                  <p className="text-lg font-bold text-slate-900">{intent.autoBundles}</p>
                </div>
              </div>

              {/* Status */}
              <div className={`px-3 py-2 rounded-lg text-center text-xs font-bold ${
                intent.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {intent.active ? 'Active' : 'Inactive'}
              </div>

              {/* Action */}
              <Link
                href={`/admin/intents/${intent.id}/edit`}
                className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors text-center flex items-center justify-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                Manage Intent
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
