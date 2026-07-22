// src/app/admin/mystery-box/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Gift, Percent, Package, PieChart } from 'lucide-react';
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

const tierColors = {
  bronze: { bg: 'from-amber-700 to-amber-900', accent: 'amber-600', border: 'amber-500' },
  silver: { bg: 'from-slate-400 to-slate-600', accent: 'slate-500', border: 'slate-400' },
  gold: { bg: 'from-yellow-500 to-yellow-700', accent: 'yellow-600', border: 'yellow-500' },
  platinum: { bg: 'from-purple-500 to-purple-700', accent: 'purple-600', border: 'purple-500' },
};

const mockBoxes: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Bronze Box',
    tier: 'bronze',
    price: 2990,
    stock: 250,
    valueLabel: 'Worth up to 5000 MAD',
    rewards: [
      { productId: '1', probability: 50 },
      { productId: '3', probability: 30 },
      { productId: '5', probability: 20 },
    ],
    totalSales: 1240,
    active: true,
  },
  '2': {
    id: '2',
    name: 'Silver Box',
    tier: 'silver',
    price: 5990,
    stock: 120,
    valueLabel: 'Worth up to 12000 MAD',
    rewards: [
      { productId: '2', probability: 40 },
      { productId: '1', probability: 35 },
      { productId: '6', probability: 25 },
    ],
    totalSales: 890,
    active: true,
  },
  '3': {
    id: '3',
    name: 'Gold Box',
    tier: 'gold',
    price: 9990,
    stock: 45,
    valueLabel: 'Worth up to 25000 MAD',
    rewards: [
      { productId: '2', probability: 50 },
      { productId: '4', probability: 30 },
      { productId: '5', probability: 20 },
    ],
    totalSales: 420,
    active: true,
  },
  '4': {
    id: '4',
    name: 'Platinum Box',
    tier: 'platinum',
    price: 19990,
    stock: 15,
    valueLabel: 'Worth up to 50000 MAD',
    rewards: [
      { productId: '4', probability: 45 },
      { productId: '2', probability: 35 },
      { productId: '6', probability: 20 },
    ],
    totalSales: 85,
    active: false,
  },
};

interface Reward {
  productId: string;
  probability: number;
}

export default function EditMysteryBoxPage() {
  const params = useParams();
  const boxId = params.id as string;
  
  const [box, setBox] = useState(mockBoxes[boxId] || mockBoxes['1']);
  const [name, setName] = useState(box.name);
  const [tier, setTier] = useState<keyof typeof tierColors>(box.tier);
  const [price, setPrice] = useState(box.price.toString());
  const [stock, setStock] = useState(box.stock.toString());
  const [valueLabel, setValueLabel] = useState(box.valueLabel);
  const [rewards, setRewards] = useState<Reward[]>(box.rewards);
  const [active, setActive] = useState(box.active);

  const addReward = (productId: string) => {
    if (!rewards.find((r) => r.productId === productId)) {
      setRewards([...rewards, { productId, probability: 10 }]);
    }
  };

  const removeReward = (productId: string) => {
    setRewards(rewards.filter((r) => r.productId !== productId));
  };

  const updateProbability = (productId: string, probability: number) => {
    setRewards(rewards.map((r) => (r.productId === productId ? { ...r, probability } : r)));
  };

  const totalProbability = rewards.reduce((sum, r) => sum + r.probability, 0);

  const rewardsData = rewards.map((r) => mockProducts.find((p) => p.id === r.productId)).filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log({
      id: boxId,
      name,
      tier,
      price: Number(price),
      stock: Number(stock),
      valueLabel,
      rewards,
      active,
    });
  };

  const colors = tierColors[tier];

  // Probability chart colors
  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/mystery-box"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Mystery Box #{boxId}</h1>
            <p className="text-slate-600 mt-1">Modify mystery box offering</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Box Info */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Box Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Box Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tier
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(tierColors) as Array<keyof typeof tierColors>).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                        tier === t
                          ? `bg-gradient-to-r ${tierColors[t].bg} text-white`
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price (MAD)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Value Label
                </label>
                <input
                  type="text"
                  value={valueLabel}
                  onChange={(e) => setValueLabel(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
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

          {/* Rewards */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Possible Rewards</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Add Products as Rewards
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockProducts
                    .filter((p) => !rewards.find((r) => r.productId === p.id))
                    .map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addReward(product.id)}
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

              {/* Selected Rewards */}
              {rewardsData.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Selected Rewards ({rewardsData.length})
                    </label>
                    <span className={`text-sm font-bold ${totalProbability === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                      Total: {totalProbability}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    {rewards.map((reward) => {
                      const product = mockProducts.find((p) => p.id === reward.productId);
                      if (!product) return null;
                      return (
                        <div key={reward.productId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{product.name}</p>
                            <p className="text-xs text-slate-600">MAD {product.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4 text-slate-400" />
                            <input
                              type="number"
                              value={reward.probability}
                              onChange={(e) => updateProbability(reward.productId, Number(e.target.value))}
                              min="0"
                              max="100"
                              className="w-16 px-2 py-1 border border-border rounded text-center text-sm"
                            />
                            <span className="text-sm text-slate-600">%</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeReward(reward.productId)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {totalProbability !== 100 && (
                    <p className="text-sm text-orange-600 mt-2">
                      ⚠️ Probabilities should sum to 100% (currently {totalProbability}%)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Probability Chart */}
          {rewardsData.length > 0 && (
            <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Probability Distribution
              </h2>
              <div className="space-y-3">
                {rewards.map((reward, idx) => {
                  const product = mockProducts.find((p) => p.id === reward.productId);
                  if (!product) return null;
                  const color = chartColors[idx % chartColors.length];
                  return (
                    <div key={reward.productId}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-700">{product.name}</span>
                        <span className="text-sm font-bold text-slate-900">{reward.probability}%</span>
                      </div>
                      <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${reward.probability}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <div className={`bg-white rounded-lg border-2 border-${colors.border} shadow-sm overflow-hidden`}>
            <div className={`p-5 bg-gradient-to-r ${colors.bg} text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5" />
                  <h3 className="font-bold text-lg">{name}</h3>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold">MAD {Number(price).toLocaleString()}</span>
                </div>
                <p className="text-xs text-white/80">{valueLabel}</p>
                <p className="text-xs text-white/60 mt-1">{box.totalSales} sold</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Rewards ({rewardsData.length})</p>
                <div className="space-y-2">
                  {rewardsData.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded overflow-hidden bg-slate-200">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs text-slate-700 truncate max-w-20">{product.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {rewards.find((r) => r.productId === product.id)?.probability}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`px-3 py-2 rounded-lg text-center text-xs font-bold ${
                active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <div className="space-y-3">
              <button
                type="submit"
                disabled={rewards.length === 0 || totalProbability !== 100}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <Link
                href="/admin/mystery-box"
                className="w-full px-4 py-3 border border-border rounded-lg font-medium hover:bg-slate-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="button"
                className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                Delete Box
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
