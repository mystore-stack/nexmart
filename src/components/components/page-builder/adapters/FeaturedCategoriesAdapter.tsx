import React from "react";
import FeaturedCategories from "../../components/homepage/FeaturedCategories";
import ImageWithFallback from "../../components/ui/ImageWithFallback";

interface Props { section?: any }

export default function FeaturedCategoriesAdapter({ section }: Props) {
  const cats = section?.payload?.categories;
  if (Array.isArray(cats) && cats.length > 0) {
	return (
	  <section style={{ padding: "36px 0" }}>
		<div className="luxury-container">
		  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
			<h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px" }}>Catégories en vedette</h2>
			<a href="/collections" style={{ color: "var(--color-muted)" }}>Voir tout</a>
		  </div>
		  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
			{cats.map((c: any) => (
			  <div key={c.id || c.slug} className="card-luxury">
				<a href={c.href || `/collections/${c.slug || ''}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
				  <div style={{ height: 170, overflow: 'hidden' }}>
					<ImageWithFallback src={c.image || '/assets/hero-fallback.svg'} fallbackSrc={'/assets/hero-fallback.svg'} alt={c.name} />
				  </div>
				  <div style={{ padding: 16 }}>
					<div style={{ fontWeight: 700 }}>{c.name}</div>
					<div style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 6 }}>Curated selection</div>
				  </div>
				</a>
			  </div>
			))}
		  </div>
		</div>
	  </section>
	);
  }

  return <FeaturedCategories />;
}
