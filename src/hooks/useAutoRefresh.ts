import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  interval?: number; // 刷新间隔，默认5分钟
  enabled?: boolean; // 是否启用自动刷新
  onRefresh: () => void | Promise<void>; // 刷新回调函数
}

/**
 * 自动刷新Hook
 * 用于定期刷新数据，提高数据同步性
 */
export function useAutoRefresh({
  interval = 5 * 60 * 1000, // 默认5分钟
  enabled = true,
  onRefresh
}: UseAutoRefreshOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // 执行刷新
  const executeRefresh = useCallback(async () => {
    if (isRefreshingRef.current) {
      return; // 防止重复刷新
    }

    try {
      isRefreshingRef.current = true;
      await onRefresh();
    } catch (error) {
      console.error('自动刷新失败:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [onRefresh]);

  // 手动刷新
  const manualRefresh = useCallback(() => {
    executeRefresh();
  }, [executeRefresh]);

  // 重置定时器
  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (enabled) {
      intervalRef.current = setInterval(executeRefresh, interval);
    }
  }, [enabled, interval, executeRefresh]);

  // 启动/停止自动刷新
  useEffect(() => {
    resetTimer();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [resetTimer]);

  // 页面可见性变化时的处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        // 页面重新可见时立即刷新一次
        executeRefresh();
        resetTimer();
      } else {
        // 页面隐藏时停止定时器
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, executeRefresh, resetTimer]);

  return {
    manualRefresh,
    isRefreshing: isRefreshingRef.current
  };
}

/**
 * 页面级数据缓存
 * 用于缓存页面级别的数据，减少重复请求
 */
class PageCache {
  private cache = new Map<string, {
    data: any;
    timestamp: number;
    expiresAt: number;
  }>();
  
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10分钟缓存

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  clearExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // 获取缓存统计
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        isExpired: Date.now() > entry.expiresAt
      }))
    };
  }
}

// 创建全局页面缓存实例
export const pageCache = new PageCache();

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    pageCache.clearExpired();
  }, 60000); // 每分钟清理一次
}

/**
 * 数据版本管理
 * 用于防止并发冲突
 */
export class DataVersionManager {
  private versions = new Map<string, number>();

  // 获取数据版本
  getVersion(key: string): number {
    return this.versions.get(key) || 0;
  }

  // 更新数据版本
  updateVersion(key: string): number {
    const newVersion = this.getVersion(key) + 1;
    this.versions.set(key, newVersion);
    return newVersion;
  }

  // 检查版本冲突
  checkConflict(key: string, expectedVersion: number): boolean {
    const currentVersion = this.getVersion(key);
    return currentVersion !== expectedVersion;
  }

  // 清除版本信息
  clearVersion(key: string) {
    this.versions.delete(key);
  }
}

// 创建全局版本管理器
export const dataVersionManager = new DataVersionManager();

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();

  // 测量API调用时间
  async measureApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      
      // 如果响应时间超过3秒，记录警告
      if (duration > 3000) {
        console.warn(`API调用 ${name} 耗时过长: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }

  // 记录性能指标
  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // 只保留最近100次记录
    if (values.length > 100) {
      values.shift();
    }
  }

  // 获取性能统计
  getStats(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p90: sorted[Math.floor(sorted.length * 0.9)],
      p95: sorted[Math.floor(sorted.length * 0.95)]
    };
  }

  // 获取所有统计信息
  getAllStats() {
    const stats: Record<string, any> = {};
    for (const name of this.metrics.keys()) {
      stats[name] = this.getStats(name);
    }
    return stats;
  }
}

// 创建全局性能监控器
export const performanceMonitor = new PerformanceMonitor();
