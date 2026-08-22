"use client";

import React, { useState, useEffect } from "react";
import "../../styles/design-tokens.css";

interface Props {
  message?: string;
  href?: string;
}

const PremiumAnnouncementBar: React.FC<Props> = ({ 
  message = "Livraison offerte au Maroc pour toute commande supérieure à 999 MAD", 
  href = "/collections/top" 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [aiInsight, setAiInsight] = useState("");

  useEffect(() => {
    // Simulate AI-powered personalized message
    const aiMessages = [
      "✨ AI-Powered: 3 produits recommandés pour vous basés sur vos préférences",
      "🤖 Smart Shopping: Économisez 15% avec nos offres personnalisées",
      "⚡ Intelligence: Nouveaux produits correspondant à votre style détectés"
    ];
    setAiInsight(aiMessages[Math.floor(Math.random() * aiMessages.length)]);
  }, []);

  if (!isVisible) return null;

  return (
	<div style={{ 
	  background: "linear-gradient(135deg, #0D7A5E 0%, #0a634d 100%)", 
	  borderBottom: "1px solid rgba(200,155,60,0.3)",
	  position: "relative",
	  overflow: "hidden"
	}}>
	  {/* AI Sparkle Effect */}
	  <div style={{
	    position: "absolute",
	    top: -10,
	    right: 100,
	    width: 60,
	    height: 60,
	    background: "radial-gradient(circle, rgba(200,155,60,0.4) 0%, transparent 70%)",
	    borderRadius: "50%",
	    animation: "pulse 2s ease-in-out infinite"
	  }} />
	  
	  <div className="luxury-container" style={{ 
	    display: "flex", 
	    alignItems: "center", 
	    justifyContent: "space-between", 
	    padding: "12px 0",
	    position: "relative",
	    zIndex: 1
	  }}>
		<div style={{ display: "flex", gap: 16, alignItems: "center", flex: 1 }}>
		  {/* AI Badge */}
		  <div style={{
		    display: "flex",
		    alignItems: "center",
		    gap: 8,
		    background: "rgba(200,155,60,0.2)",
		    padding: "6px 12px",
		    borderRadius: 20,
		    border: "1px solid rgba(200,155,60,0.4)"
		  }}>
		    <span style={{ fontSize: 16 }}>🧠</span>
		    <span style={{ 
		      color: "#C89B3C", 
		      fontWeight: 700, 
		      fontSize: 12,
		      letterSpacing: 0.5,
		      textTransform: "uppercase"
		    }}>
		      AI Powered
		    </span>
		  </div>
		  
		  {/* Main Message */}
		  <div style={{ 
		    color: "#ffffff", 
		    fontWeight: 500, 
		    fontSize: 14,
		    letterSpacing: 0.3
		  }}>
		    {message}
		  </div>
		  
		  {/* AI Insight */}
		  <div style={{
		    display: "flex",
		    alignItems: "center",
		    gap: 6,
		    background: "rgba(255,255,255,0.1)",
		    padding: "4px 10px",
		    borderRadius: 12,
		    fontSize: 12,
		    color: "rgba(255,255,255,0.9)"
		  }}>
		    <span style={{ animation: "sparkle 1.5s ease-in-out infinite" }}>✨</span>
		    {aiInsight}
		  </div>
		</div>
		
		<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
		  <a href={href} aria-label="Voir l'offre" title="Voir l'offre">
			<button style={{
			  background: "#C89B3C",
			  color: "#ffffff",
			  border: "none",
			  padding: "8px 20px",
			  borderRadius: 8,
			  fontWeight: 600,
			  fontSize: 13,
			  cursor: "pointer",
			  transition: "all 0.3s ease",
			  boxShadow: "0 2px 8px rgba(200,155,60,0.3)"
			}}
			onMouseEnter={(e) => {
			  e.currentTarget.style.transform = "translateY(-2px)";
			  e.currentTarget.style.boxShadow = "0 4px 12px rgba(200,155,60,0.4)";
			}}
			onMouseLeave={(e) => {
			  e.currentTarget.style.transform = "translateY(0)";
			  e.currentTarget.style.boxShadow = "0 2px 8px rgba(200,155,60,0.3)";
			}}>
			  Découvrir
			</button>
		  </a>
		  
		  {/* Close Button */}
		  <button 
		    onClick={() => setIsVisible(false)}
		    aria-label="Fermer"
		    style={{
		      background: "transparent",
		      border: "none",
		      color: "rgba(255,255,255,0.7)",
		      cursor: "pointer",
		      fontSize: 18,
		      padding: 4,
		      transition: "color 0.2s"
		    }}
		    onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
		    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
		  >
		    ×
		  </button>
		</div>
	  </div>
	  
	  <style jsx>{`
	    @keyframes pulse {
	      0%, 100% { opacity: 0.4; transform: scale(1); }
  	      50% { opacity: 0.7; transform: scale(1.1); }
	    }
	    @keyframes sparkle {
	      0%, 100% { opacity: 1; }
	      50% { opacity: 0.5; }
	    }
	  `}</style>
	</div>
  );
};

PremiumAnnouncementBar.displayName = "PremiumAnnouncementBar";

export default React.memo(PremiumAnnouncementBar);
