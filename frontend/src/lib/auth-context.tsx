'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Restaurant } from './types';
import { apiFetch, ApiError } from './api';

interface AuthContextType {
  user: User | null;
  restaurants: Restaurant[];
  activeRestaurant: Restaurant | null;
  loading: boolean;
  setActiveRestaurant: (r: Restaurant) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (fullName: string, email: string, pass: string, restaurantName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateActiveRestaurant: (updated: Partial<Restaurant>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiFetch<User>('/auth/me');
      setUser(data);
      if (data.restaurants && data.restaurants.length > 0) {
        setRestaurants(data.restaurants);
        setActiveRestaurant((prev) => {
          if (!prev) return data.restaurants![0];
          const found = data.restaurants!.find((r) => r.id === prev.id);
          return found || data.restaurants![0];
        });
      }
    } catch {
      setUser(null);
      setRestaurants([]);
      setActiveRestaurant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, pass: string) => {
    const data = await apiFetch<{
      user: User;
      restaurants: Restaurant[];
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });

    setUser(data.user);
    setRestaurants(data.restaurants || []);
    if (data.restaurants && data.restaurants.length > 0) {
      setActiveRestaurant(data.restaurants[0]);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    pass: string,
    restaurantName?: string,
  ) => {
    const data = await apiFetch<{
      user: User;
      restaurants: Restaurant[];
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        email,
        password: pass,
        restaurantName: restaurantName || undefined,
      }),
    });

    setUser(data.user);
    setRestaurants(data.restaurants || []);
    if (data.restaurants && data.restaurants.length > 0) {
      setActiveRestaurant(data.restaurants[0]);
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setRestaurants([]);
      setActiveRestaurant(null);
    }
  };

  const updateActiveRestaurant = (updated: Partial<Restaurant>) => {
    if (!activeRestaurant) return;
    const next = { ...activeRestaurant, ...updated };
    setActiveRestaurant(next);
    setRestaurants((prev) =>
      prev.map((r) => (r.id === activeRestaurant.id ? next : r)),
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurants,
        activeRestaurant,
        loading,
        setActiveRestaurant,
        login,
        register,
        logout,
        refreshUser,
        updateActiveRestaurant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
