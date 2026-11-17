'use client';

import React from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  QrCode,
  Star,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  Lock,
  Smartphone,
  BarChart3,
  CheckCircle,
  Store,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-orange-600 to-amber-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Taste<span className="text-orange-600">Pulse</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Owner Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/80 px-3 py-1 rounded-full text-xs font-bold text-orange-700 mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>Production-Ready Restaurant SaaS MVP</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.1]">
          Turn Dining Visits into <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
            Repeat Customers & 5-Star Reviews
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Allow diners to scan table QR codes, leave instant private feedback, and unlock exclusive return vouchers. Monitor sentiment in a live dashboard and fix issues before they ever reach Google or Yelp.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <Link
            href="/r/trattoria-bella"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-orange-600/25 active:scale-98 transition-all"
          >
            <Smartphone className="w-4 h-4 text-orange-100" />
            <span>Try Diner Form (Live Demo)</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 text-sm font-bold rounded-2xl border border-slate-200 shadow-sm active:scale-98 transition-all"
          >
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>View Owner Dashboard</span>
          </Link>
        </div>

        {/* Quick Demo Credentials Reminder */}
        <p className="mt-3 text-xs text-slate-400">
          Demo login: <span className="font-mono text-slate-600 font-semibold">owner@bistro.com</span> /{' '}
          <span className="font-mono text-slate-600 font-semibold">Password123!</span> (one-click autofill on login)
        </p>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Designed for Speed, Retention, and Simplicity
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Everything small and medium-sized restaurants need to delight diners and protect reputation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-xs">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                1. Table QR Code Scanners
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate dedicated QR codes per table or dining section. Diners open a lightweight, mobile-first feedback form in seconds without downloading any apps.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-xs">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                2. Automated Retention Vouchers
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When diners submit feedback, they are instantly rewarded with your custom incentive (e.g. 10% off dessert). Optional phone numbers capture loyal VIP leads.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-xs">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                3. Real-Time Sentiment Dashboard
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter positive ratings from negative ones. Contact unhappy guests immediately via WhatsApp or phone before negative reviews are posted on public sites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack & Security Highlights */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-orange-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Enterprise-Grade Security Architecture
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Built on Modern High-Performance Engineering
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Every request is strictly validated and protected:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Next.js + Tailwind:</strong> Fast App Router with mobile-first UI and zero layout shift.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">NestJS Backend:</strong> Modular TypeScript architecture with dependency injection and clean guards.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">PostgreSQL & Prisma:</strong> Strongly-typed queries, parameterized inputs, and database indexing.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Argon2 Password Hashing:</strong> Modern winner of the Password Hashing Competition.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">HTTP-Only JWT Cookies:</strong> Immune to cross-site scripting (XSS) token theft.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Zod Validation & Rate Limiting:</strong> Schema parsing with IP throttling to prevent spam submissions.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-orange-600" />
            <span className="font-bold text-slate-800">TastePulse Platform</span>
            <span>•</span>
            <span>Restaurant Customer Retention MVP</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/r/trattoria-bella" className="hover:text-orange-600 transition-colors">
              Customer Form
            </Link>
            <Link href="/dashboard" className="hover:text-orange-600 transition-colors">
              Owner Dashboard
            </Link>
            <Link href="/login" className="hover:text-orange-600 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
