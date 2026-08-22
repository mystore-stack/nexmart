import React from "react";
import "../../styles/design-tokens.css";

interface ProgressBarProps {
  value: number; // 0-100
}

export function ProgressBar({ value }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
	<div style={{ background: "rgba(0,0,0,0.06)", height: 8, borderRadius: 8, overflow: "hidden" }} aria-hidden>
	  <div style={{ width: `${pct}%`, height: "100%", background: "var(--color-accent)", transition: "width .3s ease" }} />
	</div>
  );
}

export default ProgressBar;
