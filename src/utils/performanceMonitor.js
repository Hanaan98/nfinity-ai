/**
 * Performance Monitoring Utility
 * Track and log performance metrics for the application
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.enabled =
      import.meta.env.MODE !== "production" ||
      import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === "true";
  }

  /**
   * Start a performance measurement
   */
  start(label) {
    if (!this.enabled) return;

    this.metrics.set(label, {
      startTime: performance.now(),
      startMark: `${label}-start`,
    });

    if (typeof performance.mark === "function") {
      performance.mark(`${label}-start`);
    }
  }

  /**
   * End a performance measurement and log the result
   */
  end(label) {
    if (!this.enabled) return;

    const metric = this.metrics.get(label);
    if (!metric) {
      console.warn(`Performance metric "${label}" was not started`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    if (typeof performance.mark === "function") {
      performance.mark(`${label}-end`);
    }

    if (typeof performance.measure === "function") {
      try {
        performance.measure(label, `${label}-start`, `${label}-end`);
      } catch {
        // Ignore errors in measurement
      }
    }

    // Log slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation: ${label} took ${duration.toFixed(2)}ms`);
    } else if (duration > 100) {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }

    this.metrics.delete(label);

    return duration;
  }

  /**
   * Measure a function execution time
   */
  async measureAsync(label, fn) {
    this.start(label);
    try {
      const result = await fn();
      return result;
    } finally {
      this.end(label);
    }
  }

  /**
   * Measure synchronous function execution
   */
  measure(label, fn) {
    this.start(label);
    try {
      return fn();
    } finally {
      this.end(label);
    }
  }

  /**
   * Get navigation timing information
   */
  getNavigationTiming() {
    if (!this.enabled || typeof performance.getEntriesByType !== "function") {
      return null;
    }

    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length === 0) return null;

    const nav = navEntries[0];
    return {
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      tcp: nav.connectEnd - nav.connectStart,
      ttfb: nav.responseStart - nav.requestStart,
      download: nav.responseEnd - nav.responseStart,
      domInteractive: nav.domInteractive,
      domComplete: nav.domComplete,
      loadComplete: nav.loadEventEnd,
    };
  }

  /**
   * Log navigation timing
   */
  logNavigationTiming() {
    if (!this.enabled) return;

    const timing = this.getNavigationTiming();
    if (!timing) return;

    console.group("📊 Navigation Timing");
    console.log(`DNS Lookup: ${timing.dns.toFixed(2)}ms`);
    console.log(`TCP Connection: ${timing.tcp.toFixed(2)}ms`);
    console.log(`Time to First Byte: ${timing.ttfb.toFixed(2)}ms`);
    console.log(`Download: ${timing.download.toFixed(2)}ms`);
    console.log(`DOM Interactive: ${timing.domInteractive.toFixed(2)}ms`);
    console.log(`DOM Complete: ${timing.domComplete.toFixed(2)}ms`);
    console.log(`Load Complete: ${timing.loadComplete.toFixed(2)}ms`);
    console.groupEnd();
  }

  /**
   * Monitor component render time
   */
  logComponentRender(componentName, duration) {
    if (!this.enabled) return;

    if (duration > 16) {
      // Warn about components that take longer than one frame (16ms at 60fps)
      console.warn(
        `🐌 Slow render: ${componentName} took ${duration.toFixed(2)}ms`
      );
    }
  }

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        usedJSHeapSize:
          (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + " MB",
        totalJSHeapSize:
          (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + " MB",
        jsHeapSizeLimit:
          (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + " MB",
      };
    }
    return null;
  }

  /**
   * Log memory usage
   */
  logMemoryUsage() {
    if (!this.enabled) return;

    const memory = this.getMemoryUsage();
    if (!memory) {
      console.log("Memory information not available");
      return;
    }

    console.group("💾 Memory Usage");
    console.log(`Used Heap: ${memory.usedJSHeapSize}`);
    console.log(`Total Heap: ${memory.totalJSHeapSize}`);
    console.log(`Heap Limit: ${memory.jsHeapSizeLimit}`);
    console.groupEnd();
  }

  /**
   * Clear all performance marks and measures
   */
  clearMarks() {
    if (typeof performance.clearMarks === "function") {
      performance.clearMarks();
    }
    if (typeof performance.clearMeasures === "function") {
      performance.clearMeasures();
    }
    this.metrics.clear();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Expose to window for debugging in development
if (import.meta.env.MODE !== "production") {
  window.performanceMonitor = performanceMonitor;
}

export default performanceMonitor;

/**
 * React Hook for measuring component render time
 */
export function usePerformanceMonitor(componentName) {
  if (import.meta.env.MODE === "production") {
    return { start: () => {}, end: () => {} };
  }

  return {
    start: () => performanceMonitor.start(componentName),
    end: () => performanceMonitor.end(componentName),
  };
}
