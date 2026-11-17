'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  UtensilsCrossed,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';

export default function QrCodeGeneratorPage() {
  const { activeRestaurant } = useAuth();
  const [tableNumber, setTableNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [batchCount, setBatchCount] = useState(6);

  if (!activeRestaurant) {
    return null;
  }

  // App Base URL for customer link
  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const tableParam = tableNumber.trim() ? `?table=${encodeURIComponent(tableNumber.trim())}` : '';
  const feedbackUrl = `${appBaseUrl}/r/${activeRestaurant.slug}${tableParam}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(feedbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSvg = () => {
    const svg = document.getElementById('main-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${activeRestaurant.slug}-table-${tableNumber || 'generic'}-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Table QR Code Generator
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Place these QR codes on dining tables, bar counters, or receipts to capture instant diner feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Table Tents</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Customize QR Code
            </h2>

            {/* Table Number Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assign to Table (Optional)
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. 4, Patio 2, Bar A (leave empty for generic)"
                className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Specifying a table lets you track feedback by exact seating location!
              </p>
            </div>

            {/* Direct Feedback Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Direct URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={feedbackUrl}
                  className="flex-1 text-xs bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 text-slate-600 font-mono select-all truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Export Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={handleDownloadSvg}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-xs font-bold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Vector SVG</span>
              </button>
              <a
                href={feedbackUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Test Live Link in New Tab</span>
              </a>
            </div>
          </div>

          {/* Quick tips card */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-3xl p-5 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Pro Tip for Maximum Diner Scans
            </div>
            <p className="leading-relaxed text-amber-800">
              Tables with an attractive incentive (like 10% off dessert or coffee) see a 4.2x higher feedback response rate than plain feedback surveys.
            </p>
          </div>
        </div>

        {/* Live Table Tent Preview Column */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Table Tent Print Preview
          </div>

          {/* Table Tent Display Card (also used in print mode) */}
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-xl text-center space-y-6 relative overflow-hidden">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>{activeRestaurant.name}</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                Scan to Rate Your Meal
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your direct opinion shapes our kitchen & service!
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-inner inline-block">
              <QRCodeSVG
                id="main-qr-code"
                value={feedbackUrl}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#0f172a"
              />
            </div>

            {/* Table Number callout */}
            {tableNumber ? (
              <div className="inline-block bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-lg">
                {tableNumber.toLowerCase().includes('table') ? tableNumber : `Table ${tableNumber}`}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                All Tables
              </div>
            )}

            {/* Reward incentive callout */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-950 font-semibold leading-snug">
              🎁 Complete in 30 seconds to unlock an exclusive reward on your bill!
            </div>
          </div>
        </div>
      </div>

      {/* Printable Sheet (visible on print) */}
      <div className="hidden print-only">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black">{activeRestaurant.name}</h1>
          <p className="text-sm text-gray-500">Table Feedback Standees</p>
        </div>

        <div className="grid grid-cols-2 gap-8 p-4">
          {[1, 2, 3, 4].map((num) => {
            const tableStr = tableNumber ? `${tableNumber}` : `Table ${num}`;
            const printUrl = `${appBaseUrl}/r/${activeRestaurant.slug}?table=${encodeURIComponent(tableStr)}`;
            return (
              <div
                key={num}
                className="border-2 border-dashed border-gray-400 p-6 rounded-2xl text-center flex flex-col items-center justify-between h-[360px]"
              >
                <div>
                  <h2 className="text-lg font-bold">{activeRestaurant.name}</h2>
                  <p className="text-xs text-gray-600 mt-0.5">Scan to Rate & Unlock Perk</p>
                </div>

                <div className="my-2">
                  <QRCodeSVG value={printUrl} size={150} level="H" />
                </div>

                <div className="w-full">
                  <span className="font-bold text-sm bg-gray-100 px-3 py-1 rounded-md inline-block mb-1">
                    {tableStr}
                  </span>
                  <p className="text-[10px] text-gray-500">
                    Takes 30 seconds • Instant reward
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
