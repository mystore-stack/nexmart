// src/hooks/useEventTracking.ts
import { useEffect, useCallback } from 'react';
import { EventType } from '@prisma/client';
import { eventTracker } from '@/lib/event-tracking/client';

export function useEventTracking() {
  useEffect(() => {
    // Track page view on mount
    eventTracker.track(EventType.PAGE_VIEW, {
      path: window.location.pathname,
      title: document.title,
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollDepth > maxScrollDepth && scrollDepth > 0) {
        maxScrollDepth = scrollDepth;
        eventTracker.track(EventType.SCROLL_DEPTH, { depth: scrollDepth });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track time on page on unmount
    const startTime = Date.now();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      const duration = Math.round((Date.now() - startTime) / 1000);
      if (duration > 0) {
        eventTracker.track(EventType.TIME_ON_PAGE, { duration });
      }
    };
  }, []);

  const trackProductView = useCallback((productId: string, productName: string) => {
    eventTracker.track(EventType.PRODUCT_VIEW, {
      productId,
      productName,
    });
  }, []);

  const trackAddToCart = useCallback((productId: string, productName: string, price: number) => {
    eventTracker.track(EventType.ADD_TO_CART, {
      productId,
      productName,
      price,
    });
  }, []);

  const trackRemoveFromCart = useCallback((productId: string, productName: string) => {
    eventTracker.track(EventType.REMOVE_FROM_CART, {
      productId,
      productName,
    });
  }, []);

  const trackCheckoutStarted = useCallback((cartValue: number, itemCount: number) => {
    eventTracker.track(EventType.CHECKOUT_STARTED, {
      cartValue,
      itemCount,
    });
  }, []);

  const trackCheckoutCompleted = useCallback((orderId: string, orderValue: number) => {
    eventTracker.track(EventType.CHECKOUT_COMPLETED, {
      orderId,
      orderValue,
    });
  }, []);

  const trackPurchase = useCallback((orderId: string, orderValue: number, itemCount: number) => {
    eventTracker.track(EventType.PURCHASE, {
      orderId,
      orderValue,
      itemCount,
    });
  }, []);

  const trackSearch = useCallback((query: string, resultCount: number) => {
    eventTracker.track(EventType.SEARCH_QUERY, {
      searchQuery: query,
      resultCount,
    });
  }, []);

  const trackCategoryView = useCallback((categoryId: string, categoryName: string) => {
    eventTracker.track(EventType.CATEGORY_VIEW, {
      categoryId,
      categoryName,
    });
  }, []);

  const trackRecommendationClick = useCallback((productId: string, recommendationType: string) => {
    eventTracker.track(EventType.RECOMMENDATION_CLICKED, {
      productId,
      recommendationType,
    });
  }, []);

  const trackWishlistAdd = useCallback((productId: string, productName: string) => {
    eventTracker.track(EventType.WISHLIST_ADD, {
      productId,
      productName,
    });
  }, []);

  const trackLogin = useCallback((userId: string) => {
    eventTracker.track(EventType.LOGIN, { userId });
  }, []);

  const trackSignup = useCallback((userId: string) => {
    eventTracker.track(EventType.SIGNUP, { userId });
  }, []);

  return {
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckoutStarted,
    trackCheckoutCompleted,
    trackPurchase,
    trackSearch,
    trackCategoryView,
    trackRecommendationClick,
    trackWishlistAdd,
    trackLogin,
    trackSignup,
  };
}
