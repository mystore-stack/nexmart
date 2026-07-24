import React from 'react';
import { Navbar, HeroCarousel, CategoryCard, ProductCard, PromotionBanner } from './index';

const sampleProducts = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  title: `Elegant Product ${i + 1}`,
  image: `https://picsum.photos/seed/p${i}/600/400`,
  price: `$${(99 + i * 10).toFixed(2)}`,
  rating: 4.5 - i * 0.2,
}));

const sampleCategories = [
  { title: 'Women', image: 'https://picsum.photos/seed/c1/400/300' },
  { title: 'Men', image: 'https://picsum.photos/seed/c2/400/300' },
  { title: 'Home', image: 'https://picsum.photos/seed/c3/400/300' },
  { title: 'Brands', image: 'https://picsum.photos/seed/c4/400/300' },
];

export const Showcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-primary)]">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <HeroCarousel
          slides={[
            { image: 'https://picsum.photos/1200/400?1', title: 'Summer Collection', subtitle: 'Curated luxury pieces', cta: { label: 'Shop Now', href: '#' } },
            { image: 'https://picsum.photos/1200/400?2', title: 'Designer Bags', subtitle: 'Exclusive offers', cta: { label: 'Explore', href: '#' } },
          ]}
        />

        <section>
          <h2 className="text-2xl font-semibold mb-4">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sampleCategories.map((c) => (
              <CategoryCard key={c.title} title={c.title} image={c.image} />
            ))}
          </div>
        </section>

        <PromotionBanner image="https://picsum.photos/1200/300?promo" title="Flash Super Deals" subtitle="Limited time only" cta={{ label: 'See Deals', href: '#' }} />

        <section>
          <h2 className="text-2xl font-semibold mb-4">Popular Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {sampleProducts.map((p) => (
              <ProductCard key={p.id} id={p.id} title={p.title} image={p.image} price={p.price} rating={p.rating} onAdd={() => alert(`Added ${p.title}`)} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Showcase;
