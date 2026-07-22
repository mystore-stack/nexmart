// src/app/admin/deals/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, AlertCircle, Zap, Pause, Play, Loader2 } from 'lucide-react';
import Link from 'next/link';

function CountdownTimer({ endTime, paused }: { endTime: string | Date; paused: boolean }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (paused) return;
    
    const calculateTimeLeft = () => {
      const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
      const difference = end.getTime() - new Date().getTime();
      return Math.max(0, difference);
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, paused]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  if (timeLeft <= 0) {
    return <span className="text-slate-500 font-mono">Expired</span>;
  }

  return (
    <div className={`font-mono font-bold ${
      hours < 2 ? 'text-red-600' : hours < 6 ? 'text-orange-600' : 'text-green-600'
    }`}>
      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'scheduled' | 'expired'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/deals');
      if (!response.ok) throw new Error('Failed to fetch deals');
      const data = await response.json();
      setDeals(data.data || []);
    } catch (err) {
      setError('Failed to load deals');
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const togglePause = (id: string) => {
    setDeals((prev) =>
      prev.map((deal) => (deal.id === id ? { ...deal, paused: !deal.paused } : deal))
    );
  };

  const filteredDeals = deals.filter((deal) => {
    if (filter === 'all') return true;
    return deal.status === filter;
  });

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
          <button onClick={fetchDeals} className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg">
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
          <h1 className="text-3xl font-bold text-foreground">Super Deals</h1>
          <p className="text-slate-600 mt-1">Manage flash sales & limited-time offers</p>
        </div>
        <Link
          href="/admin/deals/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Deal
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-border p-4 shadow-sm">
        <div className="flex gap-4">
          {(['all', 'active', 'scheduled', 'expired'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === tab
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'active' && ` (${deals.filter((d) => d.status === 'active').length})`}
              {tab === 'scheduled' && ` (${deals.filter((d) => d.status === 'scheduled').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => (
          <div
            key={deal.id}
            className={`bg-white rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
              deal.urgent ? 'ring-2 ring-orange-500' : ''
            }`}
          >
            {/* Product Image */}
            <div className="relative h-48 bg-slate-100">
              <img src={deal.productImage} alt={deal.product} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg">
                  <Zap className="w-4 h-4" />
                  <span className="font-bold">-{deal.discount}%</span>
                </div>
              </div>
              {deal.urgent && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    <span>Urgent</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Ends in:</span>
                  </div>
                  <CountdownTimer endTime={deal.endTime} paused={deal.paused} />
                </div>
              </div>
            </div>
            
            {/* Card Body */}
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-2">{deal.product}</h3>
              
              {/* Price */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-bold text-foreground">
                  MAD {Math.round(deal.originalPrice * (1 - deal.discount / 100)).toLocaleString()}
                </span>
                <span className="text-sm text-slate-500 line-through">
                  MAD {deal.originalPrice.toLocaleString()}
                </span>
              </div>
              
              {/* Stock Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>Stock: {deal.stockRemaining} / {deal.stockLimit}</span>
                  <span>{Math.round((deal.stockRemaining / deal.stockLimit) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      deal.stockRemaining / deal.stockLimit > 0.3
                        ? 'bg-green-500'
                        : deal.stockRemaining / deal.stockLimit > 0.1
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(deal.stockRemaining / deal.stockLimit) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    deal.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : deal.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                  {deal.paused && ' (Paused)'}
                </span>
                {deal.status === 'active' && (
                  <button
                    onClick={() => togglePause(deal.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border border-border hover:bg-slate-50"
                  >
                    {deal.paused ? (
                      <>
                        <Play className="w-3 h-3" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="w-3 h-3" />
                        Pause
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/deals/${deal.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Link>
                <button className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
