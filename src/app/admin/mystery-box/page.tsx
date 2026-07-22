// src/app/admin/mystery-box/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Gift, Percent, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const mockBoxes = [
  {
    id: '1',
    name: 'Bronze Box',
    tier: 'bronze',
    price: 2990,
    stock: 250,
    valueLabel: 'Worth up to 5000 MAD',
    rewards: [
      { name: 'Argan Oil', probability: 50, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=100' },
      { name: 'Rose Water', probability: 30, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=100' },
      { name: 'Soap Bar', probability: 20, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=100' },
    ],
    totalSales: 1240,
    active: true,
  },
  {
    id: '2',
    name: 'Silver Box',
    tier: 'silver',
    price: 5990,
    stock: 120,
    valueLabel: 'Worth up to 12000 MAD',
    rewards: [
      { name: 'Leather Bag', probability: 40, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100' },
      { name: 'Argan Oil + Rose Water', probability: 35, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=100' },
      { name: 'Silk Scarf', probability: 25, image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=100' },
    ],
    totalSales: 890,
    active: true,
  },
  {
    id: '3',
    name: 'Gold Box',
    tier: 'gold',
    price: 9990,
    stock: 45,
    valueLabel: 'Worth up to 25000 MAD',
    rewards: [
      { name: 'Premium Leather Bag', probability: 50, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100' },
      { name: 'Berber Carpet', probability: 30, image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=100' },
      { name: 'Luxury Gift Set', probability: 20, image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=100' },
    ],
    totalSales: 420,
    active: true,
  },
  {
    id: '4',
    name: 'Platinum Box',
    tier: 'platinum',
    price: 19990,
    stock: 15,
    valueLabel: 'Worth up to 50000 MAD',
    rewards: [
      { name: 'Luxury Carpet Set', probability: 45, image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=100' },
      { name: 'Premium Fashion Bundle', probability: 35, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100' },
      { name: 'Exclusive Art Piece', probability: 20, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=100' },
    ],
    totalSales: 85,
    active: false,
  },
];

const tierColors = {
  bronze: { bg: 'from-amber-700 to-amber-900', accent: 'amber-600', border: 'amber-500' },
  silver: { bg: 'from-slate-400 to-slate-600', accent: 'slate-500', border: 'slate-400' },
  gold: { bg: 'from-yellow-500 to-yellow-700', accent: 'yellow-600', border: 'yellow-500' },
  platinum: { bg: 'from-purple-500 to-purple-700', accent: 'purple-600', border: 'purple-500' },
};

export default function MysteryBoxPage() {
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoxes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/mystery-box');
      if (!response.ok) throw new Error('Failed to fetch mystery boxes');
      const data = await response.json();
      setBoxes(data.data || []);
    } catch (err) {
      setError('Failed to load mystery boxes');
      console.error('Error fetching mystery boxes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
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
          <button onClick={fetchBoxes} className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg">
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
          <h1 className="text-3xl font-bold text-foreground">MyStoreBox</h1>
          <p className="text-slate-600 mt-1">Manage mystery box offerings</p>
        </div>
        <Link
          href="/admin/mystery-box/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Box
        </Link>
      </div>

      {/* Boxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {boxes.map((box) => {
          const colors = tierColors[box.tier as keyof typeof tierColors];
          return (
            <div key={box.id} className={`bg-white rounded-lg border-2 border-${colors.border} shadow-sm overflow-hidden hover:shadow-lg transition-shadow ${
              !box.active ? 'opacity-60' : ''
            }`}>
              {/* Header with Tier Gradient */}
              <div className={`p-6 bg-gradient-to-r ${colors.bg} text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5" />
                    <h3 className="text-lg font-bold">{box.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold">MAD {box.price.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-white/80">{box.valueLabel}</p>
                  <p className="text-xs text-white/60 mt-1">{box.totalSales} sold</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Stock */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-700 uppercase">Stock</p>
                    <span className={`text-sm font-bold text-${colors.accent}`}>{box.stock} left</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${colors.accent}`}
                      style={{ width: `${Math.min((box.stock / 250) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Rewards Preview */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 uppercase mb-3">Possible Rewards</p>
                  <div className="space-y-2">
                    {box.rewards.slice(0, 3).map((reward, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded overflow-hidden bg-slate-200">
                            <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs text-slate-700 truncate max-w-20">{reward.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Percent className="w-3 h-3 text-slate-400" />
                          <span className="text-xs font-bold text-slate-900">{reward.probability}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className={`px-3 py-2 rounded-lg text-center text-xs font-bold ${
                  box.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {box.active ? 'Active' : 'Inactive'}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/admin/mystery-box/${box.id}/edit`}
                    className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors text-center text-sm flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Link>
                  <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
