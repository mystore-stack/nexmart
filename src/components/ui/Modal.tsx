import React from "react";
import "../../styles/design-tokens.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
	<div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
	  <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
	  <div style={{ position: "relative", background: "white", borderRadius: 12, boxShadow: "var(--shadow-strong)", maxWidth: 900, width: "100%", margin: "0 16px", overflow: "hidden" }}>
		<div style={{ padding: 20 }}>
		  <button onClick={onClose} aria-label="Fermer" style={{ position: "absolute", right: 14, top: 14, background: "transparent", border: 0, fontSize: 18 }}>✕</button>
		  {children}
		</div>
	  </div>
	</div>
  );
}

export default Modal;
