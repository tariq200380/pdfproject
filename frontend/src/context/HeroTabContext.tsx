'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type HeroTabId = 'convert' | 'merge' | 'edit' | 'sign' | 'compress' | 'office' | 'media';

interface HeroTabContextType {
  activeTab: HeroTabId;
  setActiveTab: (tab: HeroTabId) => void;
  selectTab: (tab: HeroTabId) => void;
}

const HeroTabContext = createContext<HeroTabContextType | undefined>(undefined);

export const HeroTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<HeroTabId>('convert');

  const setActiveTab = useCallback((tab: HeroTabId) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      (window as any).__ACTIVE_HERO_TAB = tab;
    }
  }, []);

  const selectTab = useCallback((tab: HeroTabId) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      (window as any).__ACTIVE_HERO_TAB = tab;

      // Update URL search query without reloading
      const url = new URL(window.location.href);
      url.searchParams.set('category', tab);
      window.history.replaceState(null, '', url.pathname + url.search);

      // Smooth scroll to hero section
      const hero = document.getElementById('creed-hero-section');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Also dispatch event for external listeners
      window.dispatchEvent(new CustomEvent('creed-switch-hero', { detail: { category: tab } }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const validTabs: HeroTabId[] = ['convert', 'merge', 'edit', 'sign', 'compress', 'office', 'media'];

    // Attach global helper so Header or any script can trigger it reliably
    (window as any).__CREED_SET_HERO_TAB = (tab: HeroTabId) => {
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
      }
    };

    // Custom event listener
    const handleSwitchEvent = (e: Event) => {
      const ce = e as CustomEvent<{ category?: string; toolId?: string }>;
      const cat = ce.detail?.category as HeroTabId | undefined;
      if (cat && validTabs.includes(cat)) {
        setActiveTab(cat);
      }
    };

    window.addEventListener('creed-switch-hero', handleSwitchEvent);

    // Initial check from query params
    const params = new URLSearchParams(window.location.search);
    const initialCategory = (params.get('category') || params.get('tab')) as HeroTabId | null;
    if (initialCategory && validTabs.includes(initialCategory)) {
      setActiveTab(initialCategory);
    }

    return () => {
      window.removeEventListener('creed-switch-hero', handleSwitchEvent);
    };
  }, [setActiveTab]);

  return (
    <HeroTabContext.Provider value={{ activeTab, setActiveTab, selectTab }}>
      {children}
    </HeroTabContext.Provider>
  );
};

export const useHeroTab = () => {
  const ctx = useContext(HeroTabContext);
  if (!ctx) {
    throw new Error('useHeroTab must be used within a HeroTabProvider');
  }
  return ctx;
};
