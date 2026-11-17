'use client';

import React, { useState } from 'react';
import { Store, Gift, MapPin, Phone, FileText, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { apiFetch } from '../../../lib/api';

export default function SettingsPage() {
  const { activeRestaurant, updateActiveRestaurant } = useAuth();

  const [name, setName] = useState(activeRestaurant?.name || '');
  const [slug, setSlug] = useState(activeRestaurant?.slug || '');
  const [description, setDescription] = useState(activeRestaurant?.description || '');
  const [address, setAddress] = useState(activeRestaurant?.address || '');
  const [phone, setPhone] = useState(activeRestaurant?.phone || '');
  const [retentionOffer, setRetentionOffer] = useState(
    activeRestaurant?.retentionOffer ||
      'Thank you for dining with us! Show this screen to your server for 10% off your next visit.',
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!activeRestaurant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Restaurant name cannot be empty.');
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const updated = await apiFetch<any>(`/restaurants/${activeRestaurant.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
          retentionOffer: retentionOffer.trim() || undefined,
        }),
      });

      updateActiveRestaurant(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Restaurant & Retention Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure your restaurant details and diner retention incentive.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-orange-600" />
            Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                URL Slug (Feedback Link)
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full text-xs font-mono rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description / Cuisine Type
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Authentic Neapolitan pizzeria & Italian craft cocktails."
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City"
                  className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Retention Offer Setting */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Gift className="w-4 h-4 text-orange-600" />
            Customer Retention Perk
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This voucher message appears on the customer's phone immediately after they submit their feedback. Use it to reward diners and drive repeat visits!
          </p>

          <textarea
            rows={3}
            value={retentionOffer}
            onChange={(e) => setRetentionOffer(e.target.value)}
            placeholder="e.g. Show this screen to your server for 10% off your next visit or a complimentary house dessert!"
            className="w-full text-xs rounded-xl border border-slate-200 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-orange-600/20 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
