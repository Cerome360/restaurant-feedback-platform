'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Star,
  UtensilsCrossed,
  CheckCircle2,
  Sparkles,
  Phone,
  User as UserIcon,
  MessageSquare,
  Gift,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiFetch, ApiError } from '../../../lib/api';

interface RestaurantPublic {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  retentionOffer?: string | null;
}

const RATING_DESCRIPTIONS: Record<number, { label: string; color: string }> = {
  1: { label: 'Disappointing', color: 'text-red-500' },
  2: { label: 'Needs Improvement', color: 'text-amber-500' },
  3: { label: 'Fair / Okay', color: 'text-yellow-600' },
  4: { label: 'Very Good', color: 'text-emerald-500' },
  5: { label: 'Outstanding!', color: 'text-amber-500' },
};

export default function CustomerFeedbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const initialTable = searchParams?.get('table') || '';

  const [restaurant, setRestaurant] = useState<RestaurantPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form State
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [positiveFeedback, setPositiveFeedback] = useState('');
  const [improvementFeedback, setImprovementFeedback] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState(initialTable);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [voucherId, setVoucherId] = useState<string>('');

  useEffect(() => {
    async function fetchRestaurant() {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await apiFetch<RestaurantPublic>(`/restaurants/public/${slug}`);
        setRestaurant(data);
      } catch (err: any) {
        setFetchError(err.message || 'Restaurant not found');
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitError('Please select a star rating between 1 and 5');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await apiFetch<{
        success: boolean;
        id: string;
        retentionOffer?: string;
        message: string;
      }>('/feedback/submit', {
        method: 'POST',
        body: JSON.stringify({
          restaurantSlug: slug,
          rating,
          positiveFeedback: positiveFeedback.trim() || undefined,
          improvementFeedback: improvementFeedback.trim() || undefined,
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          tableNumber: tableNumber.trim() || undefined,
        }),
      });

      setVoucherId(`PASS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
      setSubmitted(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ea580c', '#f59e0b', '#10b981', '#3b82f6'],
        });
      } catch {
        // ignore confetti errors in unsupported environments
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium text-sm">Loading dining experience...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Restaurant Not Found</h2>
          <p className="text-slate-600 text-sm mb-6">
            We couldn't locate a restaurant matching "{slug}". Please check the QR code or link you scanned.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            Go to TastePulse Home <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // Confirmation / Retention screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-orange-100 p-6 md:p-8 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
            Thank You!
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            Your feedback means the world to our kitchen and service team at{' '}
            <span className="font-semibold text-slate-800">{restaurant.name}</span>.
          </p>

          {/* Retention Offer Voucher Card */}
          {restaurant.retentionOffer && (
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl p-6 text-left relative overflow-hidden shadow-lg shadow-orange-500/20 mb-6">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 text-orange-100 text-xs font-bold uppercase tracking-wider mb-2">
                <Gift className="w-4 h-4 text-amber-200" />
                Exclusive Dining Perk
              </div>
              <p className="text-base font-semibold leading-snug mb-4">
                {restaurant.retentionOffer}
              </p>

              <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 flex items-center justify-between border border-white/20">
                <div>
                  <span className="text-[11px] text-orange-100 uppercase tracking-wider block">
                    Voucher Pass
                  </span>
                  <span className="font-mono font-bold text-sm tracking-wider">
                    {voucherId}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-white text-orange-800 font-bold px-2 py-0.5 rounded-full">
                    Active Now
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-orange-100/90 mt-2 text-center">
                Show this digital card to your server before requesting the check.
              </p>
            </div>
          )}

          {rating === 5 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left mb-6">
              <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" /> Loved your visit?
              </div>
              <p className="text-xs text-slate-600">
                A quick 5-star review helps our small family team thrive!
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setSubmitted(false);
                setRating(0);
                setPositiveFeedback('');
                setImprovementFeedback('');
                setCustomerName('');
                setCustomerPhone('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium py-1"
            >
              Submit another response
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Powered by TastePulse Secure Feedback
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeStar = hoverRating || rating;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto">
        {/* Restaurant Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl shadow-sm mb-3">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto line-clamp-2">
              {restaurant.description}
            </p>
          )}

          {tableNumber && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-200/70 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
              <span>{tableNumber.toLowerCase().includes('table') ? tableNumber : `Table ${tableNumber}`}</span>
            </div>
          )}
        </div>

        {/* Feedback Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/70 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating Section */}
            <div className="text-center">
              <label className="block text-sm font-bold text-slate-800 mb-1">
                How was your dining experience? <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-4">
                Tap a star to rate your meal and service
              </p>

              <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors duration-200 ${
                        star <= activeStar
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'fill-slate-100 text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {activeStar > 0 && (
                <p
                  className={`text-sm font-semibold mt-1 transition-all duration-200 ${
                    RATING_DESCRIPTIONS[activeStar]?.color || 'text-slate-700'
                  }`}
                >
                  {RATING_DESCRIPTIONS[activeStar]?.label}
                </p>
              )}
            </div>

            {/* Positive Feedback */}
            <div>
              <label
                htmlFor="positive"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                What did you enjoy most?
              </label>
              <div className="relative">
                <textarea
                  id="positive"
                  rows={2}
                  value={positiveFeedback}
                  onChange={(e) => setPositiveFeedback(e.target.value)}
                  placeholder="e.g. Delicious steak, friendly server Sarah, warm atmosphere..."
                  className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Constructive / Improvement Feedback */}
            <div>
              <label
                htmlFor="improvement"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Any suggestions for next time?
              </label>
              <textarea
                id="improvement"
                rows={2}
                value={improvementFeedback}
                onChange={(e) => setImprovementFeedback(e.target.value)}
                placeholder="e.g. Bread could be warmer, music was slightly loud..."
                className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
              />
            </div>

            {/* Optional Customer Contact info */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-orange-600 font-bold text-xs uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5" />
                Optional: VIP Perks & Rewards
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Leave your details to receive private invitations, birthday treats, and future specials.
              </p>

              <div>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className="w-full text-sm bg-white rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone Number (Optional)"
                    className="w-full text-sm bg-white rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              {!initialTable && (
                <div>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Table Number (e.g. Table 4)"
                    className="w-full text-sm bg-white rounded-xl border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              )}
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3">
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Feedback...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Send Feedback & Unlock Reward</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Direct to owner • Never shared publicly</span>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 mt-6">
        Powered by{' '}
        <a href="/" className="font-semibold text-slate-600 hover:text-orange-600 transition-colors">
          TastePulse Platform
        </a>
      </footer>
    </div>
  );
}
