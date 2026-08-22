"use client";

import React from "react";
import "../../styles/design-tokens.css";
import ImageWithFallback from "../ui/ImageWithFallback";

export function PremiumFooter() {
  return (
	<footer style={{ 
	  background: 'linear-gradient(135deg, #0a1f1a 0%, #0d2a22 100%)', 
	  color: 'white', 
	  padding: '80px 0 40px 0',
	  position: 'relative',
	  overflow: 'hidden'
	}}>
	  {/* AI Background Pattern */}
	  <div style={{
	    position: 'absolute',
	    top: -100,
	    right: -100,
	    width: 400,
	    height: 400,
	    background: 'radial-gradient(circle, rgba(200,155,60,0.08) 0%, transparent 70%)',
	    borderRadius: '50%',
	    filter: 'blur(80px)'
	  }} />
	  
	  <div className="luxury-container" style={{ position: 'relative', zIndex: 1 }}>
		<div style={{ display: 'flex', gap: 60, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
		  {/* Brand Section */}
		  <div style={{ maxWidth: 380 }}>
		    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
			  <div style={{ 
			    width: 56, 
			    height: 56, 
			    borderRadius: 14, 
			    background: 'linear-gradient(135deg, #0D7A5E 0%, #0a634d 100%)', 
			    display: 'flex', 
			    alignItems: 'center', 
			    justifyContent: 'center',
			    boxShadow: '0 4px 15px rgba(13, 122, 94, 0.3)'
			  }}>
			    <ImageWithFallback src="/assets/logo-emerald.png" fallbackSrc="/assets/hero-fallback.svg" alt="NexMart logo" loading="lazy" decoding="async" style={{ width: 32, height: 32 }} />
			  </div>
			  <div>
			    <div style={{ fontWeight: 800, fontSize: 22, color: '#C89B3C' }}>NexMart Morocco</div>
			    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' }}>Luxury E-commerce</div>
			  </div>
			</div>
			<p style={{ 
			  marginTop: 16, 
			  color: 'rgba(255,255,255,0.8)', 
			  fontSize: 15,
			  lineHeight: 1.6
			 }}>
			  Sélection de pièces de luxe et artisanales du Maroc, livrées avec soin. Propulsé par l'intelligence artificielle pour une expérience d'achat personnalisée.
			</p>
			
			{/* AI Badge */}
			<div style={{
			  display: 'inline-flex',
			  alignItems: 'center',
			  gap: 8,
			  background: 'rgba(200,155,60,0.15)',
			  padding: '8px 16px',
			  borderRadius: 20,
			  border: '1px solid rgba(200,155,60,0.3)',
			  marginTop: 20
			}}>
			  <span style={{ fontSize: 16 }}>🧠</span>
			  <span style={{ 
			    color: '#C89B3C', 
			    fontWeight: 700, 
			    fontSize: 12,
			    letterSpacing: 0.5,
			    textTransform: 'uppercase'
			  }}>
			    AI Powered
			  </span>
			</div>
		  </div>

		  {/* Navigation Links */}
		  <div style={{ display: 'flex', gap: 60 }}>
			  <div>
			    <div style={{ fontWeight: 800, marginBottom: 20, fontSize: 16, color: '#C89B3C' }}>Entreprise</div>
			    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'rgba(255,255,255,0.85)' }}>
			      <li style={{ marginBottom: 12 }}><a href="/about" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#C89B3C'} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'}>À propos</a></li>
			      <li style={{ marginBottom: 12 }}><a href="/careers" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#C89B3C'} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'}>Carrières</a></li>
			      <li style={{ marginBottom: 12 }}><a href="/press" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#C89B3C'} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'}>Presse</a></li>
			      <li><a href="/blog" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#C89B3C'} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'}>Blog</a></li>
			    </ul>
			  </div>
			  <div>
			    <div style={{ fontWeight: 800, marginBottom: 20, fontSize: 16, color: '#C89B3C' }}>Support</div>
			    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'rgba(255,255,255,0.85)' }}>
			      <li style={{ marginBottom: 12 }}><a href="/help" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#C89B3C'} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'}>Aide</a></li>
			      <li style={{ marginBottom: 12 }}><a href="/shipping" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#C89B3C'} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'}>Livraison</a></li>
			      <li style={{ marginBottom: 12 }}><a href="/returns" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#C89B3C'} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'}>Retours</a></li>
			      <li><a href="/faq" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#C89B3C'} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'}>FAQ</a></li>
			    </ul>
			  </div>
			  <div>
			    <div style={{ fontWeight: 800, marginBottom: 20, fontSize: 16, color: '#C89B3C' }}>Légal</div>
			    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'rgba(255,255,255,0.85)' }}>
			      <li style={{ marginBottom: 12 }}><a href="/privacy" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#C89B3C'} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'}>Confidentialité</a></li>
			      <li style={{ marginBottom: 12 }}><a href="/terms" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#C89B3C'} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'}>Conditions</a></li>
			      <li><a href="/cookies" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#C89B3C'} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'}>Cookies</a></li>
			    </ul>
			  </div>
		  </div>

		  {/* Contact & Social */}
		  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
		    <div style={{ fontWeight: 800, fontSize: 16, color: '#C89B3C', marginBottom: 4 }}>Contact</div>
		    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, marginBottom: 4 }}>contact@nexmart.ma</div>
		    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>+212 522 123 456</div>
		    
		    <div style={{ fontWeight: 800, fontSize: 16, color: '#C89B3C', marginTop: 16, marginBottom: 12 }}>Suivez-nous</div>
		    <div style={{ display: 'flex', gap: 12 }}>
		      <a href="#" style={{ 
		        width: 44, 
		        height: 44, 
		        borderRadius: 12, 
		        background: 'rgba(255,255,255,0.1)', 
		        display: 'flex', 
		        alignItems: 'center', 
		        justifyContent: 'center',
		        transition: 'all 0.3s ease',
		        textDecoration: 'none'
		      }}
		      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
		        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(200,155,60,0.3)';
		        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px)';
		      }}
		      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
		        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.1)';
		        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
		      }}>
		        <span style={{ fontSize: 20 }}>📸</span>
		      </a>
		      <a href="#" style={{ 
		        width: 44, 
		        height: 44, 
		        borderRadius: 12, 
		        background: 'rgba(255,255,255,0.1)', 
		        display: 'flex', 
		        alignItems: 'center', 
		        justifyContent: 'center',
		        transition: 'all 0.3s ease',
		        textDecoration: 'none'
		      }}
		      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
		        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(200,155,60,0.3)';
		        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px)';
		      }}
		      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
		        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.1)';
		        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
		      }}>
		        <span style={{ fontSize: 20 }}>📘</span>
		      </a>
		      <a href="#" style={{ 
		        width: 44, 
		        height: 44, 
		        borderRadius: 12, 
		        background: 'rgba(255,255,255,0.1)', 
		        display: 'flex', 
		        alignItems: 'center', 
		        justifyContent: 'center',
		        transition: 'all 0.3s ease',
		        textDecoration: 'none'
		      }}
		      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
		        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(200,155,60,0.3)';
		        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px)';
		      }}
		      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
		        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.1)';
		        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
		      }}>
		        <span style={{ fontSize: 20 }}>🐦</span>
		      </a>
		    </div>
		    
		    {/* AI Insight */}
		    <div style={{
		      marginTop: 20,
		      padding: '12px 16px',
		      background: 'rgba(200,155,60,0.1)',
		      borderRadius: 12,
		      border: '1px solid rgba(200,155,60,0.2)',
		      fontSize: 13,
		      color: 'rgba(255,255,255,0.9)'
		    }}>
		      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
		        <span style={{ fontSize: 16 }}>🧠</span>
		        <span style={{ fontWeight: 600 }}>IA Active 24/7</span>
		      </div>
		      <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
		        Support intelligent disponible
		      </div>
		    </div>
		  </div>
		</div>
		
		{/* AI Stats Banner */}
		<div style={{
		  marginTop: 60,
		  padding: '24px 32px',
		  background: 'rgba(13, 122, 94, 0.15)',
		  borderRadius: 16,
		  border: '1px solid rgba(13, 122, 94, 0.3)',
		  display: 'flex',
		  alignItems: 'center',
		  justifyContent: 'space-between',
		  flexWrap: 'wrap',
		  gap: 20
		}}>
		  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
		    <span style={{ fontSize: 32 }}>🧠</span>
		    <div>
		      <div style={{ fontWeight: 800, color: '#C89B3C', fontSize: 16 }}>Intelligence Artificielle</div>
		      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Notre IA améliore continuellement votre expérience</div>
		    </div>
		  </div>
		  
		  <div style={{ display: 'flex', gap: 32 }}>
		    <div style={{ textAlign: 'center' }}>
		      <div style={{ fontSize: 24, fontWeight: 800, color: '#C89B3C' }}>99.9%</div>
		      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>Précision</div>
		    </div>
		    <div style={{ textAlign: 'center' }}>
		      <div style={{ fontSize: 24, fontWeight: 800, color: '#C89B3C' }}>0.3s</div>
		      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>Réponse</div>
		    </div>
		    <div style={{ textAlign: 'center' }}>
		      <div style={{ fontSize: 24, fontWeight: 800, color: '#C89B3C' }}>24/7</div>
		      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>Disponible</div>
		    </div>
		  </div>
		</div>
		
		{/* Bottom Bar */}
		<div style={{ 
		  borderTop: '1px solid rgba(255,255,255,0.08)', 
		  marginTop: 40, 
		  paddingTop: 24,
		  display: 'flex',
		  justifyContent: 'space-between',
		  alignItems: 'center',
		  flexWrap: 'wrap',
		  gap: 16
		}}>
		  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
		    © {new Date().getFullYear()} NexMart Morocco. Tous droits réservés.
		  </div>
		  <div style={{ 
		    display: 'flex', 
		    alignItems: 'center', 
		    gap: 8,
		    color: 'rgba(255,255,255,0.7)',
		    fontSize: 14
		  }}>
		    <span>Made with</span>
		    <span style={{ color: '#C89B3C' }}>🧠 AI</span>
		    <span>in Morocco</span>
		  </div>
		</div>
	  </div>
	</footer>
  );
}

export default PremiumFooter;
