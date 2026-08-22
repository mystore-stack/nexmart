import React from "react";
import FlashDealsPremium from "../../components/homepage/sections/FlashDealsPremium";
import FeaturedProductsPremium from "../../components/homepage/sections/FeaturedProductsPremium";
import Grid from "../../components/ui/Grid";
import ProductCardPremium from "../../components/ui/ProductCardPremium";

interface Props { section?: any }

export function FlashDealsAdapter({ section }: Props) {
  const products = section?.payload?.products;
  if (Array.isArray(products) && products.length > 0) {
	return (
	  <section style={{ padding: "40px 0", background: "linear-gradient(180deg, rgba(13,122,94,0.02), transparent)" }}>
		<div className="luxury-container">
		  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
			<h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 22 }}>Offres Flash</h3>
			<div style={{ color: "var(--color-muted)" }}>Temps restant: 02:14:33</div>
		  </div>
		  <Grid columns={4}>
			{products.map((p: any) => (
			  <ProductCardPremium key={p.id || p.sku} product={{ id: p.id || p.sku, title: p.title || p.name, price: p.price || 0, oldPrice: p.oldPrice, img: p.image || '/assets/hero-fallback.svg', discount: p.discount }} />
			))}
		  </Grid>
		</div>
	  </section>
	);
  }

  return <FlashDealsPremium />;
}

export function FeaturedProductsAdapter({ section }: Props) {
  const products = section?.payload?.products;
  if (Array.isArray(products) && products.length > 0) {
	return (
	  <section style={{ padding: "44px 0" }}>
		<div className="luxury-container">
		  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
			<h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 22 }}>Produits en vedette</h3>
			<a href="/collections/featured" style={{ color: "var(--color-muted)" }}>Voir tout</a>
		  </div>
		  <Grid columns={4}>
			{products.map((p: any) => (
			  <ProductCardPremium key={p.id || p.sku} product={{ id: p.id || p.sku, title: p.title || p.name, price: p.price || 0, oldPrice: p.oldPrice, img: p.image || '/assets/hero-fallback.svg', discount: p.discount }} />
			))}
		  </Grid>
		</div>
	  </section>
	);
  }

  return <FeaturedProductsPremium />;
}

export default FlashDealsAdapter;
