"use client";

import React, { useState, useEffect } from "react";
import "../../styles/design-tokens.css";
import ImageWithFallback from "../ui/ImageWithFallback";

export function PremiumHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAiBadge, setShowAiBadge] = useState(true);

  useEffect(() => {
    // Simulate AI-powered search suggestions
    if (searchQuery.length > 2) {
      const suggestions = [
        `🧠 AI: "${searchQuery}" - 3 produits correspondants trouvés`,
        `✨ Smart: Meilleur prix pour "${searchQuery}" détecté`,
        `⚡ Intelligence: Offres spéciales sur "${searchQuery}" disponibles`
      ];
      setAiSuggestions(suggestions.slice(0, 1));
    } else {
      setAiSuggestions([]);
    }
  }, [searchQuery]);

  return (
	<header style={{ 
	  position: "sticky", 
	  top: 0, 
	  zIndex: 60, 
	  backdropFilter: "saturate(120%) blur(20px)", 
	  background: "rgba(255, 255, 255, 0.95)",
	  borderBottom: "1px solid rgba(13, 122, 94, 0.1)",
	  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)"
	}}>
	  <div className="luxury-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "16px 0" }}>
		{/* Logo Section */}
		<div style={{ display: "flex", alignItems: "center", gap: 20 }}>
		  <a href="/" aria-label="NexMart Morocco" style={{ textDecoration: "none" }}>
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
			  <div style={{ 
			    width: 48, 
			    height: 48, 
			    borderRadius: 12, 
			    overflow: "hidden", 
			    background: "linear-gradient(135deg, #0D7A5E 0%, #0a634d 100%)", 
			    boxShadow: "0 4px 15px rgba(13, 122, 94, 0.3)", 
			    display: "flex", 
			    alignItems: "center", 
			    justifyContent: "center" 
			  }}>
				<ImageWithFallback src="/assets/logo-emerald.svg" fallbackSrc="/assets/hero-fallback.svg" alt="NexMart" style={{ width: 32, height: 32 }} />
			  </div>
			  <div>
			    <div style={{ fontWeight: 800, fontSize: 20, color: "#0D7A5E", letterSpacing: -0.5 }}>NexMart</div>
			    <div style={{ fontSize: 11, color: "#C89B3C", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Morocco</div>
			  </div>
			</div>
		  </a>
		  
		  {/* AI Feature Badge */}
		  {showAiBadge && (
		    <div style={{
		      display: "flex",
		      alignItems: "center",
		      gap: 6,
		      background: "linear-gradient(135deg, rgba(200,155,60,0.15) 0%, rgba(200,155,60,0.05) 100%)",
		      padding: "6px 12px",
		      borderRadius: 20,
		      border: "1px solid rgba(200,155,60,0.3)",
		      cursor: "pointer"
		    }}
		    onClick={() => setShowAiBadge(false)}
		    >
		      <span style={{ fontSize: 14 }}>🧠</span>
		      <span style={{ 
		        color: "#C89B3C", 
		        fontWeight: 700, 
		        fontSize: 11,
		        letterSpacing: 0.5,
		        textTransform: "uppercase"
		      }}>
		        AI Shopping
		      </span>
		      <span style={{ fontSize: 12, color: "#C89B3C", marginLeft: 4 }}>×</span>
		    </div>
		  )}
		</div>

		{/* AI-Powered Search */}
		<div style={{ flex: 1, maxWidth: 600, position: "relative" }}>
		  <div style={{ position: "relative" }}>
		    <input 
		      aria-label="Rechercher avec AI" 
		      placeholder="🧠 Recherche intelligente: produits, styles, tendances..." 
		      value={searchQuery}
		      onChange={(e) => setSearchQuery(e.target.value)}
		      style={{ 
		        width: "100%", 
		        padding: "14px 20px 14px 50px", 
		        borderRadius: 14, 
		        border: "2px solid rgba(13, 122, 94, 0.1)", 
		        background: "rgba(255, 255, 255, 0.8)",
		        fontSize: 14,
		        fontWeight: 500,
		        color: "#1a1a1a",
		        transition: "all 0.3s ease",
		        outline: "none"
		      }}
		      onFocus={(e) => {
		        e.currentTarget.style.borderColor = "#0D7A5E";
		        e.currentTarget.style.boxShadow = "0 0 0 4px rgba(13, 122, 94, 0.1)";
		      }}
		      onBlur={(e) => {
		        e.currentTarget.style.borderColor = "rgba(13, 122, 94, 0.1)";
		        e.currentTarget.style.boxShadow = "none";
		      }}
		    />
		    <div style={{
		      position: "absolute",
		      left: 16,
		      top: "50%",
		      transform: "translateY(-50%)",
		      fontSize: 18
		    }}>
		      🔍
		    </div>
		    
		    {/* AI Suggestions Dropdown */}
		    {aiSuggestions.length > 0 && (
		      <div style={{
		        position: "absolute",
		        top: "100%",
		        left: 0,
		        right: 0,
		        background: "white",
		        borderRadius: 12,
		        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
	            border: "1px solid rgba(13, 122, 94, 0.1)",
	            marginTop: 8,
	            padding: 12,
	            zIndex: 100
	          }}>
	            {aiSuggestions.map((suggestion, index) => (
	              <div 
	                key={index}
	                style={{
	                  padding: "10px 12px",
	                  borderRadius: 8,
	                  fontSize: 13,
	                  color: "#1a1a1a",
	                  cursor: "pointer",
	                  transition: "background 0.2s"
	                }}
	                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget as HTMLDivElement).style.background = "rgba(13, 122, 94, 0.05)"}
	              >
	                {suggestion}
	              </div>
	            ))}
	          </div>
	        )}
	      </div>
	    </div>

		{/* Navigation & Actions */}
		<nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
		  <a href="/collections" aria-label="Collections" style={{ 
		    color: "#1a1a1a", 
		    fontWeight: 600, 
		    fontSize: 14, 
		    textDecoration: "none",
		    padding: "8px 16px",
		    borderRadius: 8,
		    transition: "all 0.2s"
		  }}
		  onMouseEnter={(e) => {
		    e.currentTarget.style.background = "rgba(13, 122, 94, 0.05)";
		    e.currentTarget.style.color = "#0D7A5E";
		  }}
		  onMouseLeave={(e) => {
		    e.currentTarget.style.background = "transparent";
		    e.currentTarget.style.color = "#1a1a1a";
		  }}>
		    Collections
		  </a>
		  
		  <a href="/brands" aria-label="Marques" style={{ 
		    color: "#1a1a1a", 
		    fontWeight: 600, 
		    fontSize: 14, 
		    textDecoration: "none",
		    padding: "8px 16px",
		    borderRadius: 8,
		    transition: "all 0.2s"
		  }}
		  onMouseEnter={(e) => {
		    e.currentTarget.style.background = "rgba(13, 122, 94, 0.05)";
		    e.currentTarget.style.color = "#0D7A5E";
		  }}
		  onMouseLeave={(e) => {
		    e.currentTarget.style.background = "transparent";
		    e.currentTarget.style.color = "#1a1a1a";
		  }}>
		    Marques
		  </a>
		  
		  {/* AI Recommendations Button */}
		  <a href="/ai-recommendations" aria-label="AI Recommendations" style={{
		    display: "flex",
		    alignItems: "center",
		    gap: 6,
		    background: "linear-gradient(135deg, #0D7A5E 0%, #0a634d 100%)",
		    color: "white",
		    fontWeight: 700,
		    fontSize: 13,
		    padding: "10px 16px",
		    borderRadius: 10,
		    textDecoration: "none",
		    boxShadow: "0 4px 15px rgba(13, 122, 94, 0.3)",
		    transition: "all 0.3s ease"
		  }}
		  onMouseEnter={(e) => {
		    e.currentTarget.style.transform = "translateY(-2px)";
		    e.currentTarget.style.boxShadow = "0 6px 20px rgba(13, 122, 94, 0.4)";
		  }}
		  onMouseLeave={(e) => {
		    e.currentTarget.style.transform = "translateY(0)";
		    e.currentTarget.style.boxShadow = "0 4px 15px rgba(13, 122, 94, 0.3)";
		  }}>
		    <span>🧠</span>
		    <span>Pour Vous</span>
		  </a>
		  
		  <a href="/cart" aria-label="Panier">
			<div style={{ 
			  width: 52, 
			  height: 52, 
			  borderRadius: 12, 
			  display: "flex", 
			  alignItems: "center", 
			  justifyContent: "center", 
			  background: "white", 
			  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
			  border: "2px solid rgba(13, 122, 94, 0.1)",
			  position: "relative",
			  cursor: "pointer",
			  transition: "all 0.3s ease"
			}}
			onMouseEnter={(e) => {
			  e.currentTarget.style.borderColor = "#0D7A5E";
			  e.currentTarget.style.transform = "translateY(-2px)";
			}}
			onMouseLeave={(e) => {
			  e.currentTarget.style.borderColor = "rgba(13, 122, 94, 0.1)";
			  e.currentTarget.style.transform = "translateY(0)";
			}}>
				<ImageWithFallback src="/assets/icons/cart.svg" fallbackSrc="/assets/hero-fallback.svg" alt="Panier" style={{ width: 24, height: 24 }} />
				<div style={{
				  position: "absolute",
				  top: -4,
				  right: -4,
				  background: "#C89B3C",
				  color: "white",
				  width: 22,
				  height: 22,
				  borderRadius: "50%",
				  display: "flex",
				  alignItems: "center",
				  justifyContent: "center",
				  fontSize: 11,
				  fontWeight: 700,
				  boxShadow: "0 2px 8px rgba(200, 155, 60, 0.4)"
				}}>
				  3
				</div>
			</div>
		  </a>
		</nav>
	  </div>
	</header>
  );
}

export default PremiumHeader;
