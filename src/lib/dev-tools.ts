/**
 * 開発者向けデバッグツール
 * - レンダリング最適化のモニタリング
 * - パフォーマンス分析
 * - デバッグ用ログ出力
 * - 開発環境でのみ有効
 */
import { config } from './config';
import { logger } from './logger';

// 開発環境でのみ有効化
const isDevelopment = config.env.isDevelopment;

/**
 * React コンポーネントの再レンダリングを追跡
 */
export const useRenderTracker = (componentName: string) => {
  const renderCountRef = React.useRef<number>(0);
  const lastPropsRef = React.useRef<Record<string, unknown> | undefined>(undefined);
  
  renderCountRef.current += 1;

  React.useEffect(() => {
    if (!isDevelopment) return;
    
    logger.debug(`${componentName} rendered`, {
      renderCount: renderCountRef.current,
      timestamp: Date.now()
    }, { component: componentName, action: 'render' });
  });

  return isDevelopment ? {
    renderCount: renderCountRef.current,
    logPropsChange: (props: Record<string, unknown>) => {
      if (lastPropsRef.current) {
        const changedProps = Object.keys(props).filter(
          key => props[key] !== lastPropsRef.current?.[key]
        );
        
        if (changedProps.length > 0) {
          logger.debug(`${componentName} props changed`, {
            changedProps,
            oldProps: lastPropsRef.current,
            newProps: props
          }, { component: componentName, action: 'propsChange' });
        }
      }
      lastPropsRef.current = props;
    }
  } : { renderCount: 0, logPropsChange: () => {} };
};

/**
 * パフォーマンス測定ユーティリティ
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private measurements: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  private constructor() {
    if (!isDevelopment) return;
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    // LCP (Largest Contentful Paint) の監視
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      logger.info('LCP measured', { 
        value: lastEntry.startTime,
        url: window.location.pathname 
      }, { component: 'PerformanceMonitor', action: 'LCP' });
    });

    // FID (First Input Delay) の監視
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as (PerformanceEventTiming)[];
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        logger.info('FID measured', { 
          value: fid,
          url: window.location.pathname 
        }, { component: 'PerformanceMonitor', action: 'FID' });
      });
    });

    // CLS (Cumulative Layout Shift) の監視
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[];
      let clsValue = 0;
      
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      logger.info('CLS measured', { 
        value: clsValue,
        url: window.location.pathname 
      }, { component: 'PerformanceMonitor', action: 'CLS' });
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      fidObserver.observe({ type: 'first-input', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      
      this.observers.push(lcpObserver, fidObserver, clsObserver);
    } catch (error) {
      logger.warn('Performance observers not supported', { error: error instanceof Error ? error : new Error(String(error)) });
    }
  }

  /**
   * カスタム測定の開始
   */
  startMeasurement(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.measurements.has(name)) {
        this.measurements.set(name, []);
      }
      
      this.measurements.get(name)!.push(duration);
      
      logger.debug(`Performance: ${name}`, {
        duration: `${duration.toFixed(2)}ms`,
        startTime,
        endTime
      }, { component: 'PerformanceMonitor', action: 'measurement' });
    };
  }

  /**
   * 測定結果の統計情報を取得
   */
  getStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return { avg, min, max, count: measurements.length };
  }

  /**
   * すべての測定結果をログ出力
   */
  logAllStats(): void {
    this.measurements.forEach((measurements, name) => {
      const stats = this.getStats(name);
      if (stats) {
        logger.info(`Performance Stats: ${name}`, stats, { 
          component: 'PerformanceMonitor', 
          action: 'stats' 
        });
      }
    });
  }

  /**
   * 測定結果をクリア
   */
  clearMeasurements(): void {
    this.measurements.clear();
  }

  /**
   * オブザーバーを停止
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * React のレンダリング最適化チェッカー
 */
export const renderOptimizationChecker = {
  /**
   * 不要な再レンダリングを検出
   */
  checkUnnecessaryRerenders<T extends Record<string, unknown>>(
    componentName: string,
    props: T,
    prevProps?: T
  ): void {
    if (!isDevelopment || !prevProps) return;

    const changedProps: string[] = [];
    const shallowChanges: string[] = [];

    Object.keys(props).forEach(key => {
      const currentValue = props[key];
      const previousValue = prevProps[key];

      if (currentValue !== previousValue) {
        changedProps.push(key);

        // 浅い比較で同じかチェック
        if (JSON.stringify(currentValue) === JSON.stringify(previousValue)) {
          shallowChanges.push(key);
        }
      }
    });

    if (shallowChanges.length > 0) {
      logger.warn(`${componentName}: 参照の変更による不要な再レンダリングが発生している可能性があります`, {
        shallowChangedProps: shallowChanges,
        suggestion: 'useMemo, useCallback, React.memoの使用を検討してください'
      }, { component: componentName, action: 'renderOptimizationWarning' });
    }
  },

  /**
   * メモ化されていないコールバックを検出
   */
  checkUnmemoizedCallbacks(componentName: string, callbacks: Record<string, (...args: unknown[]) => unknown>): void {
    if (!isDevelopment) return;

    Object.entries(callbacks).forEach(([name, callback]) => {
      // 関数の toString() でメモ化されているかどうかを大まかに判定
      const funcString = callback.toString();
      if (!funcString.includes('useCallback') && !funcString.includes('useMemo')) {
        logger.warn(`${componentName}: ${name} がメモ化されていない可能性があります`, {
          callbackName: name,
          suggestion: 'useCallbackの使用を検討してください'
        }, { component: componentName, action: 'callbackOptimizationWarning' });
      }
    });
  }
};

/**
 * デバッグ用のReact DevTools風の情報表示
 */
export const debugInfo = {
  /**
   * コンポーネント情報をコンソールに表示
   */
  logComponentInfo(componentName: string, props: Record<string, unknown>, state?: Record<string, unknown>): void {
    if (!isDevelopment) return;

    console.group(`🔍 ${componentName}`);
    console.log('Props:', props);
    if (state) {
      console.log('State:', state);
    }
    console.trace('Render stack');
    console.groupEnd();
  },

  /**
   * パフォーマンス情報を可視化
   */
  visualizePerformance(): void {
    if (!isDevelopment || typeof window === 'undefined') return;

    const monitor = PerformanceMonitor.getInstance();
    
    // パフォーマンス情報を画面に表示するための簡単なUI
    const createPerformanceOverlay = () => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        max-width: 300px;
        pointer-events: none;
      `;

      const updateOverlay = () => {
        const stats: Record<string, ReturnType<typeof monitor.getStats>> = {};
        (monitor as any).measurements.forEach((values: number[], name: string) => {
          stats[name] = monitor.getStats(name);
        });

        overlay.innerHTML = `
          <div><strong>Performance Monitor</strong></div>
          ${Object.entries(stats).map(([name, stat]) => 
            stat ? `<div>${name}: ${stat.avg.toFixed(2)}ms (avg)</div>` : ''
          ).join('')}
        `;
      };

      document.body.appendChild(overlay);
      
      // 定期的に更新
      const interval = setInterval(updateOverlay, 1000);
      
      // 5秒後に自動削除
      setTimeout(() => {
        document.body.removeChild(overlay);
        clearInterval(interval);
      }, 5000);
    };

    createPerformanceOverlay();
  }
};

/**
 * 開発環境でのみ使用可能な機能をまとめたオブジェクト
 */
export const devTools = isDevelopment ? {
  useRenderTracker,
  performanceMonitor: PerformanceMonitor.getInstance(),
  renderOptimizationChecker,
  debugInfo,
  
  // グローバルに devTools を追加（ブラウザのコンソールからアクセス可能）
  attachToWindow: () => {
    if (typeof window !== 'undefined') {
      (window as any).devTools = devTools;
      logger.info('Dev tools attached to window.devTools');
    }
  }
} : null;

// 開発環境では自動的にグローバルに追加
if (isDevelopment && typeof window !== 'undefined') {
  devTools?.attachToWindow();
}

import React from 'react';

export default devTools;