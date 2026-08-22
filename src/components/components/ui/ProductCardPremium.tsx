"use client";

import React, { useState } from "react";
import "../../styles/design-tokens.css";
import Modal from "./Modal";
import Badge from "./badge";

interface Product {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  reviews?: number;
  stock?: number;
  img?: string;
  discount?: number;
}

export function ProductCardPremium({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
	<div className="card-luxury product-card-premium" style={{ borderRadius: 16, overflow: "hidden", transition: "transform .22s cubic-bezier(0.2,0.8,0.2,1)", cursor: "pointer" }}>
	  <div style={{ position: "relative" }}>
		<a href={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
		  <div style={{ position: "relative", height: 260, background: "#fbfbfb" }}>
			<img src={product.img || "/assets/hero-fallback.svg"} alt={product.title} className="img-cover" />
			{product.discount ? (
			  <div style={{ position: "absolute", left: 12, top: 12 }}>
				<Badge variant="gold">-{product.discount}%</Badge>
			  </div>
			) : null}
		  </div>
		</a>

		<div style={{ position: "absolute", right: 12, top: 12, display: "flex", gap: 8 }}>
		  <button aria-label="Ajouter aux favoris" className="btn-circle" style={{ background: "rgba(255,255,255,0.92)", border: "0", padding: 8, borderRadius: 10 }}>♡</button>
		  <button aria-label="Aperçu rapide" onClick={() => setOpen(true)} className="btn-circle" style={{ background: "rgba(255,255,255,0.92)", border: "0", padding: 8, borderRadius: 10 }}>👁</button>
		</div>
	  </div>

	  <div style={{ padding: 14 }}>
		<div style={{ fontWeight: 700, fontFamily: 'Playfair Display, serif', fontSize: '1.02rem' }}>{product.title}</div>
		<div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
		  <div style={{ fontWeight: 800 }}>{product.price} MAD</div>
		  {product.oldPrice ? <div style={{ textDecoration: "line-through", color: "var(--color-muted)", fontSize: 13 }}>{product.oldPrice} MAD</div> : null}
		</div>
		<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
		  <div style={{ color: "var(--color-muted)", fontSize: 13 }}>{product.rating || 4.8} ★ • {product.reviews || 24} avis</div>
		  <div>
			<button className="btn-premium" style={{ padding: '8px 14px', fontSize: 14 }}>Ajouter</button>
		  </div>
		</div>
	  </div>

	  <Modal open={open} onClose={() => setOpen(false)}>
		<div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
		  <div style={{ flex: "0 0 420px", height: 420, overflow: "hidden", borderRadius: 8 }}>
			<img src={product.img || "/assets/hero-fallback.svg"} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
		  </div>
		  <div style={{ flex: 1 }}>
			<h2 style={{ marginTop: 0 }}>{product.title}</h2>
			<div style={{ fontSize: 20, fontWeight: 800 }}>{product.price} MAD</div>
			{product.oldPrice ? <div style={{ color: "var(--color-muted)", textDecoration: "line-through" }}>{product.oldPrice} MAD</div> : null}
			<p style={{ color: "var(--color-muted)", marginTop: 12 }}>Une description concise et luxueuse du produit pour convaincre l'acheteur.</p>
			<div style={{ marginTop: 20 }}>
			  <button style={{ marginRight: 12 }} className="btn-premium">Ajouter au panier</button>
			  <button className="btn-ghost">Voir la page produit</button>
			</div>
		  </div>
		</div>
	  </Modal>
	</div>
  );
}

export default ProductCardPremium;
