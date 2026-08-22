import React from "react";
import LuxuryCollections from "../../components/homepage/LuxuryCollections";
import ImageWithFallback from "../../components/ui/ImageWithFallback";

interface Props { section?: any }

export default function CollectionsAdapter({ section }: Props) {
  const cols = section?.payload?.collections;
  if (Array.isArray(cols) && cols.length > 0) {
	return (
	  <section style={{ padding: '44px 0' }}>
		<div className="luxury-container">
		  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
			<h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 22 }}>Collections de luxe</h3>
			<a href="/collections" style={{ color: 'var(--color-muted)' }}>Voir tout</a>
		  </div>
		  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
			{cols.map((c: any) => (
			  <div key={c.id || c.slug} className="card-luxury">
				<a href={c.href || `/collections/${c.slug || ''}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
				  <div style={{ height: 240, overflow: 'hidden' }}>
					<ImageWithFallback src={c.image || '/assets/hero-fallback.svg'} fallbackSrc={'/assets/hero-fallback.svg'} alt={c.title || c.name} />
				  </div>
				  <div style={{ padding: 16 }}>
					<div style={{ fontWeight: 800 }}>{c.title || c.name}</div>
					<div style={{ color: 'var(--color-muted)', marginTop: 8 }}>Sélection exclusive</div>
				  </div>
				</a>
			  </div>
			))}
		  </div>
		</div>
	  </section>
	);
  }

  return <LuxuryCollections />;
}
