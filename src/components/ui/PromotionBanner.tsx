import React from 'react';

export const PromotionBanner: React.FC<{ image?: string; title?: string; subtitle?: string; cta?: { label: string; href: string } }> = ({ image, title, subtitle, cta }) => {
  return (
    <div className="w-full rounded-[var(--radius-md)] overflow-hidden relative">
      {image ? <img src={image} alt={title || 'promotion'} className="w-full h-48 object-cover" /> : <div className="w-full h-48 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent200)]" />}
      <div className="absolute left-6 top-6 text-white">
        {title && <div className="text-2xl font-bold">{title}</div>}
        {subtitle && <div className="mt-1 text-sm opacity-90">{subtitle}</div>}
        {cta && (
          <a href={cta.href} className="inline-block mt-4 bg-white text-[var(--color-accent)] px-4 py-2 rounded-md font-semibold">
            {cta.label}
          </a>
        )}
      </div>
    </div>
  );
};

export default PromotionBanner;
