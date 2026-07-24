import React from 'react';
import Card from './Card';

export const HeroCarousel: React.FC<{
  slides: { title?: string; subtitle?: string; image: string; cta?: { label: string; href: string } }[];
  interval?: number;
}> = ({ slides, interval = 5000 }) => {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [slides.length, interval]);

  if (!slides.length) return null;

  return (
    <div className="w-full overflow-hidden rounded-[var(--radius-lg)]">
      <div className="relative">
        {slides.map((s, i) => (
          <div
            key={i}
            aria-hidden={i !== index}
            className={`transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'} `}
            style={{ position: i === index ? 'relative' : 'absolute', inset: 0 }}
          >
            <img src={s.image} alt={s.title || `slide-${i}`} className="w-full h-64 object-cover rounded-[var(--radius-lg)]" />
            <Card className="absolute left-6 bottom-6 bg-white/85 backdrop-blur-sm p-4 max-w-sm">
              {s.title && <div className="text-xl font-semibold">{s.title}</div>}
              {s.subtitle && <div className="text-sm text-[var(--color-muted)] mt-1">{s.subtitle}</div>}
              {s.cta && (
                <a href={s.cta.href} className="inline-block mt-3 px-4 py-2 rounded-md bg-[var(--color-accent)] text-white">
                  {s.cta.label}
                </a>
              )}
            </Card>
          </div>
        ))}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`w-3 h-3 rounded-full ${i===index? 'bg-[var(--color-accent)]': 'bg-[var(--color-muted)]/40'}`} aria-label={`Go to slide ${i+1}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
