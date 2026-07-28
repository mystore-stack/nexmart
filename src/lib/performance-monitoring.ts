// src/lib/performance-monitoring.ts - Core Web Vitals and performance monitoring

/**
 * Core Web Vitals (CWV) targets:
 * - LCP (Largest Contentful Paint): < 2.5s
 * - FID (First Input Delay): < 100ms
 * - CLS (Cumulative Layout Shift): < 0.1
 * 
 * Updated metrics (2024):
 * - INP (Interaction to Next Paint): < 200ms (replacement for FID)
 */

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  inp: number; // Interaction to Next Paint (ms)
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte (ms)
  fcp: number; // First Contentful Paint (ms)
}

export interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  inp: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  ttfb: { good: number; needsImprovement: number };
  fcp: { good: number; needsImprovement: number };
}

export const cwvThresholds: PerformanceThresholds = {
  lcp: { good: 2500, needsImprovement: 4000 }, // ms
  fid: { good: 100, needsImprovement: 300 }, // ms
  inp: { good: 200, needsImprovement: 500 }, // ms
  cls: { good: 0.1, needsImprovement: 0.25 }, // unitless
  ttfb: { good: 800, needsImprovement: 1800 }, // ms
  fcp: { good: 1800, needsImprovement: 3000 }, // ms
};

/**
 * Performance monitoring utility
 */
export function monitorCoreWebVitals(onReport: (metric: any) => void) {
  // Largest Contentful Paint
  if ("PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        onReport({
          name: "LCP",
          value: lastEntry.renderTime || lastEntry.loadTime,
          id: lastEntry.id,
        });
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      // Silently fail if observer not supported
    }

    // First Input Delay (for older browsers)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          onReport({
            name: "FID",
            value: (entry as any).processingDuration,
            id: entry.name,
          });
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      // Silently fail if observer not supported
    }

    // Interaction to Next Paint
    try {
      const inpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          onReport({
            name: "INP",
            value: (entry as any).duration,
            id: entry.name,
          });
        });
      });
      inpObserver.observe({ entryTypes: ["event"] });
    } catch (e) {
      // Silently fail if observer not supported
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            onReport({
              name: "CLS",
              value: clsValue,
              id: entry.name,
            });
          }
        });
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      // Silently fail if observer not supported
    }
  }
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics() {
  if (typeof window === "undefined") return null;

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domInteractive: navigation.domInteractive - navigation.fetchStart,
    domComplete: navigation.domComplete - navigation.fetchStart,
    loadComplete: navigation.loadEventEnd - navigation.fetchStart,
  };
}

/**
 * Measure function execution time
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (process.env.NODE_ENV === "development") {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Lazy load images and resources
 */
export function setupIntersectionObserver(
  callback: (element: Element) => void,
  options?: IntersectionObserverInit
) {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    return observer;
  }

  return null;
}

/**
 * Performance budget alerts
 */
export const performanceBudgets = {
  js: 170000, // bytes
  css: 50000, // bytes
  images: 500000, // bytes
  fonts: 100000, // bytes
  html: 100000, // bytes
};

export function checkPerformanceBudget(
  type: keyof typeof performanceBudgets,
  size: number
): {
  passed: boolean;
  ratio: number;
  message: string;
} {
  const budget = performanceBudgets[type];
  const ratio = size / budget;
  const passed = ratio <= 1;

  return {
    passed,
    ratio,
    message: `${type.toUpperCase()}: ${(size / 1024).toFixed(2)}KB / ${(budget / 1024).toFixed(2)}KB (${(ratio * 100).toFixed(1)}%)`,
  };
}

/**
 * Network information API
 */
export function getNetworkInformation() {
  if ("connection" in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType, // "4g", "3g", "2g"
      downlink: connection.downlink, // Mbps
      rtt: connection.rtt, // ms
      saveData: connection.saveData, // boolean
    };
  }
  return null;
}

/**
 * Adaptive loading based on network
 */
export function shouldLoadHighQuality(): boolean {
  const network = getNetworkInformation();
  if (!network) return true;

  return network.effectiveType === "4g" && !network.saveData;
}

/**
 * Time-to-Interactive (TTI) monitoring
 */
export function measureTimeToInteractive(
  callback: (tti: number) => void
) {
  if ("PerformanceObserver" in window) {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      const tti = lastEntry.startTime + (lastEntry as any).duration;
      callback(tti);
    });

    try {
      observer.observe({ entryTypes: ["longtask"] });
    } catch (e) {
      // Ignore if longTask not available
    }
  }
}
