'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  LayoutDashboard,
  QrCode,
  Settings,
  ExternalLink,
  LogOut,
  ChevronDown,
  Store,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, restaurants, activeRestaurant, setActiveRestaurant, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Loading restaurant dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    {
      name: 'Feedback & Analytics',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      name: 'QR Code Generator',
      href: '/dashboard/qr',
      icon: QrCode,
      active: pathname === '/dashboard/qr',
    },
    {
      name: 'Settings & Retention',
      href: '/dashboard/settings',
      icon: Settings,
      active: pathname === '/dashboard/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Restaurant Switcher */}
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-tr from-orange-600 to-amber-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 hidden sm:inline">
                  Taste<span className="text-orange-600">Pulse</span>
                </span>
              </Link>

              {/* Restaurant Selector */}
              {restaurants.length > 0 && activeRestaurant && (
                <div className="relative group">
                  <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800 transition-colors cursor-pointer border border-slate-200">
                    <Store className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span className="max-w-[130px] sm:max-w-[200px] truncate">
                      {activeRestaurant.name}
                    </span>
                    {restaurants.length > 1 && (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>

                  {restaurants.length > 1 && (
                    <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 hidden group-hover:block z-40">
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Switch Location
                      </div>
                      {restaurants.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setActiveRestaurant(r)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-orange-50 hover:text-orange-700 transition-colors ${
                            r.id === activeRestaurant.id
                              ? 'bg-orange-50/60 font-bold text-orange-600'
                              : 'text-slate-700'
                          }`}
                        >
                          <span className="truncate">{r.name}</span>
                          {r.id === activeRestaurant.id && (
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Middle: Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      item.active
                        ? 'bg-orange-50 text-orange-600 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Public View Link & User Logout */}
            <div className="flex items-center gap-3">
              {activeRestaurant && (
                <a
                  href={`/r/${activeRestaurant.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-3 py-1.5 rounded-xl transition-colors border border-slate-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Public Form</span>
                </a>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user.fullName}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">Owner</p>
                </div>

                <button
                  onClick={async () => {
                    await logout();
                    router.push('/login');
                  }}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Sub-nav */}
          <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-bold ${
                    item.active ? 'text-orange-600' : 'text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name.split(' ')[0]}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
