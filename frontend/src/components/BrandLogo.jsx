'use client';
import { useSiteConfig } from '@/context/SiteConfigContext';

export default function BrandLogo({ className = '', textClass = '' }) {
  const cfg = useSiteConfig();
  const logoUrl = cfg?.banners?.navbar;
  const name = cfg?.brand?.name || 'CreditoFácil';

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={className}
        style={{ height: 38, width: 'auto', maxWidth: 160, objectFit: 'contain', display: 'block' }}
      />
    );
  }

  return (
    <span className={`font-black text-lg gradient-text font-display ${textClass}`}>
      {name}
    </span>
  );
}
