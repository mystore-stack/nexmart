// src/app/admin/ads/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, AlertCircle, Loader2, Calendar, DollarSign, Target } from 'lucide-react';
import Link from 'next/link';

interface Ad {
  id: string;
  title: string;
  type: string;
  status: string;
  imageUrl: string;
  targetUrl: string;
  startDate: string;
  endDate: string | null;
  budget: number;
  impressions: number;
  clicks: number;
  ctr: number;
  productId: string;
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'draft' | 'ended'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filter !== 'all') params.append('status', filter);
      
      const response = await fetch(`/api/admin/ads?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch ads');
      const data = await response.json();
      // Ensure ads is always an array
      const adsData = Array.isArray(data.data) ? data.data : [];
      setAds(adsData);
    } catch (err) {
      setError('Failed to load ads');
      console.error('Error fetching ads:', err);
      setAds([]); // Ensure ads is always an array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [searchTerm, filter]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'PAUSED' : 'ACTIVE';
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error('Failed to update ad status');
      
      setAds((prev) =>
        prev.map((ad) => (ad.id === id ? { ...ad, status: newStatus.toLowerCase() } : ad))
      );
    } catch (err) {
      console.error('Error toggling ad status:', err);
    }
  };

  const deleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    
    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete ad');
      
      setAds((prev) => prev.filter((ad) => ad.id !== id));
    } catch (err) {
      console.error('Error deleting ad:', err);
    }
  };

  const filteredAds = ads.filter((ad) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || ad.status === filter;
    return matchesSearch && matchesFilter;
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
          <button onClick={fetchAds} className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg">
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
          <h1 className="text-3xl font-bold text-foreground">Advertisements</h1>
          <p className="text-slate-600 mt-1">{ads.length} ads in your marketplace</p>
        </div>
        <Link
          href="/admin/ads/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Ad
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Impressions</p>
              <p className="text-2xl font-bold text-foreground">
                {ads.reduce((sum, ad) => sum + ad.impressions, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Clicks</p>
              <p className="text-2xl font-bold text-foreground">
                {ads.reduce((sum, ad) => sum + ad.clicks, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Budget</p>
              <p className="text-2xl font-bold text-foreground">
                MAD {ads.reduce((sum, ad) => sum + ad.budget, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Ads</p>
              <p className="text-2xl font-bold text-foreground">
                {ads.filter((ad) => ad.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-border p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2 flex-1">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent flex-1 outline-none text-foreground placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'active', 'paused', 'draft', 'ended'] as const).map((tab) => (
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
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Ad</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Date Range</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100">
                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{ad.title}</p>
                        <p className="text-xs text-slate-600 truncate max-w-xs">{ad.targetUrl}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded capitalize">
                      {ad.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${
                        ad.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : ad.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-700'
                          : ad.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Eye className="w-3 h-3" />
                        <span>{ad.impressions.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Target className="w-3 h-3" />
                        <span>{ad.clicks.toLocaleString()} clicks</span>
                      </div>
                      <div className="text-xs font-medium text-slate-900">CTR: {ad.ctr.toFixed(2)}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">MAD {ad.budget.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-600">
                      <p>{new Date(ad.startDate).toLocaleDateString()}</p>
                      <p className="text-slate-400">to {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'No end date'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(ad.id, ad.status)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title={ad.status === 'active' ? 'Pause ad' : 'Activate ad'}
                      >
                        {ad.status === 'active' ? (
                          <EyeOff className="w-4 h-4 text-slate-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                      <Link
                        href={`/admin/ads/${ad.id}/edit`}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </Link>
                      <button
                        onClick={() => deleteAd(ad.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No ads found</p>
            <Link
              href="/admin/ads/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first ad
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
