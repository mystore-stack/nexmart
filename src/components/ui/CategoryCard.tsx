import React from 'react';
import Card from './Card';

export const CategoryCard: React.FC<{ title: string; image: string; href?: string }> = ({ title, image, href = '#' }) => {
  return (
    <a href={href} className="block">
      <Card className="p-0 overflow-hidden">
        <div className="w-full h-40">
          <img src={image} alt={title} className="w-full h-full object-cover rounded-t-[var(--radius-sm)]" />
        </div>
        <div className="p-3">
          <div className="font-medium text-[var(--color-primary)]">{title}</div>
        </div>
      </Card>
    </a>
  );
};

export default CategoryCard;
