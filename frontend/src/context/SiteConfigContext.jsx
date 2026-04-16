'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSiteConfig } from '@/lib/api';
import { DEFAULT_SITE_CONFIG } from '@/lib/defaultConfig';

function deepMerge(defaults, overrides) {
  if (!overrides || typeof overrides !== 'object') return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(overrides)) {
    if (Array.isArray(overrides[key])) {
      result[key] = overrides[key];
    } else if (typeof overrides[key] === 'object' && typeof defaults[key] === 'object') {
      result[key] = deepMerge(defaults[key], overrides[key]);
    } else if (overrides[key] !== undefined && overrides[key] !== null && overrides[key] !== '') {
      result[key] = overrides[key];
    }
  }
  return result;
}

const SiteConfigContext = createContext(DEFAULT_SITE_CONFIG);

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_SITE_CONFIG);

  useEffect(() => {
    getSiteConfig()
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          const merged = deepMerge(DEFAULT_SITE_CONFIG, data);
          setConfig(merged);
          if (typeof document !== 'undefined' && merged.brand?.name) {
            document.title = merged.brand.name;
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export const useSiteConfig = () => useContext(SiteConfigContext);
