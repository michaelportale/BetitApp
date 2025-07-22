// React import for the HOC and hook
import React from 'react';
import { InteractionManager } from 'react-native';

// Stub file - Performance monitoring not used in simplified app

export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  static endTimer(name: string, shouldTrack: boolean = true): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      return 0;
    }
    const duration = Date.now() - startTime;
    this.timers.delete(name);
    console.log(`Timer ${name}: ${duration}ms`);
    return duration;
  }

  static initialize() {
    console.log('Performance monitoring initialized (stub)');
  }

  static async monitorAsyncOperation<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    return operation();
  }
}

// HOC for monitoring component render performance
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return function PerformanceMonitoredComponent(props: P) {
    React.useEffect(() => {
      PerformanceMonitor.startTimer(`${componentName}-mount`);
      
      return () => {
        const mountTime = PerformanceMonitor.endTimer(`${componentName}-mount`, false);
        if (mountTime > 100) { // Log slow mounting components
          console.warn(`Slow component mount: ${componentName} took ${mountTime}ms`);
        }
      };
    }, []);
    
    return React.createElement(WrappedComponent, props);
  };
};

// Hook for monitoring component performance
export const usePerformanceMonitoring = (componentName: string) => {
  React.useEffect(() => {
    PerformanceMonitor.startTimer(`${componentName}-render`);
    
    // Use InteractionManager to measure after animations
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      const renderTime = PerformanceMonitor.endTimer(`${componentName}-render`, false);
      if (renderTime > 50) {
        console.log(`${componentName} render time: ${renderTime}ms`);
      }
    });
    
    return () => {
      interactionPromise.cancel();
    };
  });
};