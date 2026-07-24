import React from 'react';
import Card from './Card';
import Button from './Button';

export const ProductCard: React.FC<{
  id?: string | number;
  title: string;
  image: string;
  price: string;
  rating?: number;
  onAdd?: (id?: string | number) => void;
}> = ({ id, title, image, price, rating = 0, onAdd }) => {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="w-full h-56 bg-gray-100">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="text-base font-medium text-[var(--color-primary)] truncate">{title}</div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-lg font-semibold text-[var(--color-primary)]">{price}</div>
          <div className="text-sm text-[var(--color-muted)]">{rating.toFixed(1)} ★</div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="primary" onClick={() => onAdd?.(id)}>Add</Button>
          <Button variant="ghost">Wishlist</Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
