'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NavigationHeader from './NavigationHeader';

// Local Storage helper functions
export const saveToStorage = (key, data) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`ecalc_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }
};

export const loadFromStorage = (key) => {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(`ecalc_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      return null;
    }
  }
  return null;
};

export const clearStorage = (key) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`ecalc_${key}`);
  }
};

// Generate shareable URL with params
export const generateShareableUrl = (baseUrl, params) => {
  const url = new URL(baseUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value.toString());
    }
  });
  return url.toString();
};

// Parse URL params into object
export const parseUrlParams = (searchParams) => {
  const params = {};
  if (searchParams) {
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  }
  return params;
};

// Hook for managing calculator state with persistence
export const useCalculatorState = (calculatorId, initialState) => {
  const [state, setState] = useState(initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // First try to load from URL params
    const urlParams = parseUrlParams(searchParams);
    if (Object.keys(urlParams).length > 0) {
      setState(prev => ({ ...prev, ...urlParams }));
      setIsLoaded(true);
      return;
    }

    // Then try to load from localStorage
    const savedState = loadFromStorage(calculatorId);
    if (savedState) {
      setState(prev => ({ ...prev, ...savedState }));
    }
    setIsLoaded(true);
  }, [calculatorId, searchParams]);

  // Auto-save to localStorage when state changes
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(calculatorId, state);
    }
  }, [state, calculatorId, isLoaded]);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    clearStorage(calculatorId);
    setState(initialState);
  };

  const getShareableUrl = () => {
    return generateShareableUrl(window.location.pathname, state);
  };

  return { state, updateState, resetState, getShareableUrl, isLoaded };
};

// Calculator Layout Wrapper
export default function CalculatorLayout({ children }) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <NavigationHeader />
      {children}
    </div>
  );
}
