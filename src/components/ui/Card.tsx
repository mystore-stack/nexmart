import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...rest }) => {
  return (
    <div
      {...rest}
      className={`bg-[var(--color-surface)] rounded-[var(--radius-md)] shadow-[var(--shadow-md)] p-4 ${className}`}
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {children}
    </div>
  );
};

export default Card;
