import React from "react";
import "../../styles/design-tokens.css";

interface GridProps {
  columns?: 2 | 3 | 4;
  gap?: number;
  children: React.ReactNode;
  className?: string;
}

export function Grid({ columns = 3, children, className = "" }: GridProps) {
  const cls = columns === 4 ? "grid-4" : columns === 2 ? "grid-2" : "grid-3";
  return <div className={`${cls} ${className}`}>{children}</div>;
}

export default Grid;
