import React from "react";
import "../../styles/design-tokens.css";

export default function Footer() {
  return (
	<footer style={{ background: 'var(--color-footer-bg)', color: '#f6f6f6', padding: '48px 0' }}>
	  <div className="luxury-container" style={{ display: 'flex', gap: 32, justifyContent: 'space-between', flexWrap: 'wrap' }}>
		<div style={{ flex: '1 1 260px' }}>
		  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
			<div style={{ width: 44, height: 44, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			  <img src="/assets/logo-emerald.svg" alt="NexMart logo" style={{ width: 28, height: 28 }} loading="lazy" decoding="async" />
			</div>
			<div style={{ fontWeight: 700 }}>NexMart Morocco</div>
		  </div>
		  <p style={{ color: '#d0d0d0', marginTop: 16, maxWidth: 420 }}>Curated luxury from Morocco — artisan pieces, premium experience and sustainable sourcing.</p>
		</div>

		<div style={{ display: 'flex', gap: 40, flex: '2 1 420px', justifyContent: 'space-between' }}>
		  <div>
			<div style={{ fontWeight: 700, marginBottom: 12 }}>Acheter</div>
			<div style={{ color: '#cfcfcf' }}>
			  <div>Collections</div>
			  <div>Marques</div>
			  <div>Offres</div>
			</div>
		  </div>
		  <div>
			<div style={{ fontWeight: 700, marginBottom: 12 }}>Aide</div>
			<div style={{ color: '#cfcfcf' }}>
			  <div>Contact</div>
			  <div>Livraison</div>
			  <div>Retours</div>
			</div>
		  </div>
		  <div>
			<div style={{ fontWeight: 700, marginBottom: 12 }}>Entreprise</div>
			<div style={{ color: '#cfcfcf' }}>
			  <div>Carrières</div>
			  <div>Presse</div>
			  <div>Politique</div>
			</div>
		  </div>
		</div>
	  </div>
	  <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: 28, paddingTop: 20 }}>
		<div className="luxury-container" style={{ display: 'flex', justifyContent: 'space-between', color: '#9f9f9f', fontSize: 13 }}>
		  <div>© {new Date().getFullYear()} NexMart Morocco. Tous droits réservés.</div>
		  <div>Made with ♥ in Morocco</div>
		</div>
	  </div>
	</footer>
  );
}
