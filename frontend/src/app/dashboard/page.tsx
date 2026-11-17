'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Star,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  Phone,
  User as UserIcon,
  Search,
  Filter,
  CheckCircle,
  Clock,
  QrCode,
  Sparkles,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { apiFetch } from '../../lib/api';
import { Feedback, FeedbackStats, FeedbackFilterParams } from '../../lib/types';

export default function DashboardPage() {
  const { activeRestaurant } = useAuth();

  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [sentiment, setSentiment] = useState<'ALL' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'>('ALL');
  const [status, setStatus] = useState<'ALL' | 'NEW' | 'REVIEWED' | 'CONTACTED' | 'RESOLVED'>('ALL');
  const [hasContactInfo, setHasContactInfo] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async (isRefresh = false) => {
    if (!activeRestaurant) return;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch Stats
      const statsData = await apiFetch<FeedbackStats>(
        `/feedback/restaurant/${activeRestaurant.id}/stats`,
      );
      setStats(statsData);

      // 2. Fetch Feedbacks with applied filters
      const queryParams = new URLSearchParams();
      if (sentiment !== 'ALL') queryParams.append('sentiment', sentiment);
      if (status !== 'ALL') queryParams.append('status', status);
      if (hasContactInfo) queryParams.append('hasContactInfo', 'true');
      if (searchTerm.trim()) queryParams.append('search', searchTerm.trim());

      const feedbackData = await apiFetch<{
        items: Feedback[];
        pagination: any;
      }>(`/feedback/restaurant/${activeRestaurant.id}?${queryParams.toString()}`);

      setFeedbacks(feedbackData.items || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeRestaurant, sentiment, status, hasContactInfo, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (feedbackId: string, newStatus: string) => {
    try {
      // Optimistic update
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, status: newStatus as any } : f)),
      );

      await apiFetch(`/feedback/${feedbackId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update status', err);
      // Revert if error
      loadData();
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  if (!activeRestaurant) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">No Restaurant Selected</h3>
        <p className="text-sm text-slate-500 mt-1">
          Create or select a restaurant from the top menu to view feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeRestaurant.name}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Live MVP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time customer feedback, NPS sentiment analytics, and diner retention
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/dashboard/qr"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-orange-600/20"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Get Table QRs</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Feedbacks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Responses</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalFeedbacks ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Customer submissions</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Average Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
          </div>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(stats?.averageRating || 0)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Positive Sentiment */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Positive Reviews</span>
            <Smile className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600">
              {stats?.positiveRate ?? 0}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({stats?.positiveCount ?? 0})
            </span>
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1">Ratings 4 & 5 stars</p>
        </div>

        {/* Needs Attention / Negative */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Needs Attention</span>
            <Frown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-600">
              {stats?.negativeRate ?? 0}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({stats?.negativeCount ?? 0})
            </span>
          </div>
          <p className="text-[11px] text-rose-700/80 mt-1">Ratings 1 & 2 stars</p>
        </div>

        {/* Retention Leads Captured */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-orange-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Customer Leads</span>
            <Phone className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-orange-600">
              {stats?.leadsCount ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({stats?.leadCaptureRate ?? 0}%)
            </span>
          </div>
          <p className="text-[11px] text-orange-700/80 mt-1">Provided phone/name</p>
        </div>
      </div>

      {/* Analytics Breakdown: Star Distribution & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Star Rating Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Rating Distribution
          </h3>
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats?.starDistribution?.[stars as 1 | 2 | 3 | 4 | 5] || 0;
              const total = stats?.totalFeedbacks || 1;
              const percentage = Math.round((count / total) * 100);

              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <div className="w-12 flex items-center gap-1 font-bold text-slate-700">
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stars >= 4
                          ? 'bg-emerald-500'
                          : stars === 3
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-10 text-right font-medium text-slate-500">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Trend Timeline */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              7-Day Feedback Activity
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Daily submissions</span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4 items-end h-36">
            {stats?.timeline?.map((day, idx) => {
              const maxCount = Math.max(...(stats.timeline.map((t) => t.count) || [1]), 4);
              const heightPercent = Math.max((day.count / maxCount) * 100, 8);
              const dateLabel = new Date(day.date).toLocaleDateString('en-US', {
                weekday: 'short',
              });

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[11px] font-bold text-slate-700">
                    {day.count > 0 ? day.count : ''}
                  </span>
                  <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-24">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        day.count > 0 ? 'bg-orange-500' : 'bg-transparent'
                      }`}
                      style={{ height: `${day.count > 0 ? heightPercent : 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase">
                    {dateLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Sentiment Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'ALL', label: 'All Reviews' },
              { id: 'POSITIVE', label: 'Positive (4-5★)' },
              { id: 'NEUTRAL', label: 'Neutral (3★)' },
              { id: 'NEGATIVE', label: 'Needs Attention (1-2★)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSentiment(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sentiment === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Filters: Contact Info Checkbox & Status */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasContactInfo}
                onChange={(e) => setHasContactInfo(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
              />
              <span>Has Contact Info</span>
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="CONTACTED">Contacted</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone number, table number, or feedback text..."
            className="w-full text-xs bg-slate-50 rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Feedbacks Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Feedback Feed ({feedbacks.length})
          </h2>
          <span className="text-xs text-slate-400">Sorted by most recent</span>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading reviews...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-8">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Feedback Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No responses match your current filter settings. Try clearing the filter or scan a table QR code to submit a test review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {feedbacks.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header row: Stars, Table, Time, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    {/* Stars */}
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
                      <span className="font-black text-amber-700 text-sm">{item.rating}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    </div>

                    {/* Sentiment Chip */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.sentiment === 'POSITIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.sentiment === 'NEGATIVE'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.sentiment === 'POSITIVE'
                        ? 'Positive'
                        : item.sentiment === 'NEGATIVE'
                        ? 'Needs Attention'
                        : 'Neutral'}
                    </span>

                    {/* Table # */}
                    {item.tableNumber && (
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.tableNumber.toLowerCase().includes('table')
                          ? item.tableNumber
                          : `Table ${item.tableNumber}`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(item.createdAt)}
                    </span>

                    {/* Status Dropdown */}
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`text-[11px] font-bold rounded-lg px-2 py-1 border transition-colors ${
                        item.status === 'NEW'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : item.status === 'CONTACTED'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : item.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="NEW">New</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Feedback Quotes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {item.positiveFeedback && (
                    <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-3">
                      <span className="font-bold text-emerald-800 uppercase text-[10px] tracking-wider block mb-1">
                        Liked Most
                      </span>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        "{item.positiveFeedback}"
                      </p>
                    </div>
                  )}

                  {item.improvementFeedback && (
                    <div className="bg-amber-50/50 border border-amber-100/80 rounded-xl p-3">
                      <span className="font-bold text-amber-800 uppercase text-[10px] tracking-wider block mb-1">
                        Suggested Improvement
                      </span>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        "{item.improvementFeedback}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Customer Contact Details (Retention Outreach) */}
                {(item.customerName || item.customerPhone) && (
                  <div className="bg-slate-50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 border border-slate-100">
                    <div className="flex items-center gap-4 text-xs">
                      {item.customerName && (
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.customerName}</span>
                        </div>
                      )}

                      {item.customerPhone && (
                        <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.customerPhone}</span>
                        </div>
                      )}
                    </div>

                    {item.customerPhone && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${item.customerPhone.replace(/[^0-9+]/g, '')}`}
                          className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                        >
                          Call
                        </a>
                        <a
                          href={`https://wa.me/${item.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
