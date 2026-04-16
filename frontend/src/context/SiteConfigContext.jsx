'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSiteConfig } from '@/lib/api';
import { DEFAULT_SITE_CONFIG } from '@/lib/defaultConfig';

// Converte hex #RRGGBB para string "R, G, B" usada em rgba(var(...), 0.x)
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return `${r}, ${g}, ${b}`;
}

// Aplica as cores da marca como CSS custom properties no :root
function applyCssVars(cores) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const primaria   = cores?.primaria   || '#820AD1';
  const secundaria = cores?.segundaria || '#4b047d';
  root.style.setProperty('--cor-primaria',       primaria);
  root.style.setProperty('--cor-secundaria',     secundaria);
  const rgbP = hexToRgb(primaria);
  const rgbS = hexToRgb(secundaria);
  if (rgbP) root.style.setProperty('--cor-primaria-rgb',   rgbP);
  if (rgbS) root.style.setProperty('--cor-secundaria-rgb', rgbS);
}

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
    // Aplica as cores padrão imediatamente (antes da API responder)
    applyCssVars(DEFAULT_SITE_CONFIG.cores);

    getSiteConfig()
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          const merged = deepMerge(DEFAULT_SITE_CONFIG, data);
          setConfig(merged);
          applyCssVars(merged.cores);
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
