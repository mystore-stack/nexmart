import React from 'react';

export const H1: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...rest }) => (
  <h1 {...rest} className={`text-[var(--font-2xl)] font-semibold leading-tight ${className}`}>
    {children}
  </h1>
);

export const H2: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...rest }) => (
  <h2 {...rest} className={`text-[var(--font-xl)] font-semibold leading-snug ${className}`}>
    {children}
  </h2>
);

export const Body: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...rest }) => (
  <p {...rest} className={`text-[var(--font-md)] text-[var(--color-muted)] ${className}`}>
    {children}
  </p>
);

export default { H1, H2, Body };
