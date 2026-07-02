"use client";

import React from "react";
import { Clock } from "lucide-react";

interface FlashDealsSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function FlashDealsSection({ section, products = [], isLoading = false }: FlashDealsSectionProps) {
  const config = section.config || {};
  const content = config.content || {};
  const design = config.design || {};
  const { title = "Flash Deals", subtitle = "Limited-time offers", endTime } = content as any;
  const { background = "#fef3c7", radius = "16px", shadow = "md", color = "#dc2626" } = design as any;

  const shadowClass: string = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  }[shadow as string] || "shadow-md";

  // Calculate countdown
  const [timeLeft, setTimeLeft] = React.useState({ hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    if (endTime) {
      const interval = setInterval(() => {
        const end = new Date(endTime).getTime();
        const now = new Date().getTime();
        const diff = end - now;

        if (diff > 0) {
          setTimeLeft({
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
          });
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [endTime]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section 
      className="container mx-auto px-4 py-12"
      style={{ backgroundColor: background }}
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="w-6 h-6" style={{ color }} />
          <h2 className="text-3xl font-bold" style={{ color }}>{title}</h2>
        </div>
        <p className="text-muted-foreground mb-4">{subtitle}</p>
        
        {endTime && (
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="text-2xl font-bold" style={{ color }}>{timeLeft.hours}</span>
              <span className="text-xs text-muted-foreground block">Hours</span>
            </div>
            <span className="text-2xl font-bold">:</span>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="text-2xl font-bold" style={{ color }}>{timeLeft.minutes}</span>
              <span className="text-xs text-muted-foreground block">Minutes</span>
            </div>
            <span className="text-2xl font-bold">:</span>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="text-2xl font-bold" style={{ color }}>{timeLeft.seconds}</span>
              <span className="text-xs text-muted-foreground block">Seconds</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div 
              key={product.id} 
              className={`bg-white rounded-lg p-4 ${shadowClass} relative`}
              style={{ borderRadius: typeof radius === 'number' ? `${radius}px` : radius }}
            >
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                {product.discount ? `-${product.discount}%` : 'Hot'}
              </div>
              <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-red-600">
                  {product.price ? `${product.price} MAD` : 'Price not available'}
                </p>
                {product.originalPrice && (
                  <p className="text-sm text-gray-400 line-through">
                    {product.originalPrice} MAD
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No flash deals available
          </div>
        )}
      </div>
    </section>
  );
}
