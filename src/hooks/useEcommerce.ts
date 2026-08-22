// src/hooks/useEcommerce.ts
'use client';

import { useState, useCallback } from 'react';

// Hook for cart management
export const useCart = () => {
  const [items, setItems] = useState<any[]>([]);

  const addToCart = useCallback((product: any) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, quantity } : p
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    count: items.length,
  };
};

// Hook for wishlist management
export const useWishlist = () => {
  const [items, setItems] = useState<string[]>([]);

  const addToWishlist = useCallback((productId: string) => {
    setItems((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems((prev) => prev.filter((id) => id !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => items.includes(productId),
    [items]
  );

  return {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    count: items.length,
  };
};

// Hook for filter management
export const useFilters = (initialFilters: any = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    filters,
    updateFilter,
    removeFilter,
    clearFilters,
  };
};

// Hook for pagination
export const usePagination = (totalItems: number, itemsPerPage: number = 20) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const goToPage = useCallback((page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
  };
};

// Hook for product sorting
export const useSorting = (initialSort: string = 'featured') => {
  const [sortBy, setSortBy] = useState(initialSort);

  const sorts = [
    { id: 'featured', label: 'Featured' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Top Rated' },
    { id: 'newest', label: 'Newest' },
    { id: 'trending', label: 'Trending' },
  ];

  return {
    sortBy,
    setSortBy,
    sorts,
  };
};

// Hook for API calls with loading state
export const useFetch = <T,>(
  url: string,
  options: any = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch_data = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  return {
    data,
    loading,
    error,
    fetch: fetch_data,
  };
};

// Hook for debounced search
export const useDebounce = <T,>(value: T, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
