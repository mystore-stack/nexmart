import { useState, useEffect, useCallback } from "react";

const FAVORITES_KEY = "page-builder-favorites";
const RECENTLY_USED_KEY = "page-builder-recently-used";
const MAX_RECENTLY_USED = 10;

export function useSectionLibrary() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  }, []);

  // Load recently used from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_USED_KEY);
      if (stored) {
        setRecentlyUsed(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recently used:", error);
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  }, [favorites]);

  // Save recently used to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(recentlyUsed));
    } catch (error) {
      console.error("Failed to save recently used:", error);
    }
  }, [recentlyUsed]);

  const toggleFavorite = useCallback((sectionId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(sectionId)) {
        newFavorites.delete(sectionId);
      } else {
        newFavorites.add(sectionId);
      }
      return newFavorites;
    });
  }, []);

  const addToRecentlyUsed = useCallback((sectionId: string) => {
    setRecentlyUsed((prev) => {
      const filtered = prev.filter((id) => id !== sectionId);
      return [sectionId, ...filtered].slice(0, MAX_RECENTLY_USED);
    });
  }, []);

  const isFavorite = useCallback(
    (sectionId: string) => favorites.has(sectionId),
    [favorites]
  );

  return {
    favorites: Array.from(favorites),
    recentlyUsed,
    toggleFavorite,
    addToRecentlyUsed,
    isFavorite,
  };
}
