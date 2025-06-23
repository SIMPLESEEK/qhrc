// 简单的内存缓存实现
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // 生存时间（毫秒）
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 默认5分钟

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 清理过期的缓存项
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 全局缓存实例
export const cache = new MemoryCache();

// 定期清理过期缓存
setInterval(() => {
  cache.cleanup();
}, 60 * 1000); // 每分钟清理一次

// 缓存键生成器
export const CacheKeys = {
  calendarEvents: (userId: string) => `calendar_events_${userId}`,
  userInfo: (userId: string) => `user_info_${userId}`,
  customHolidays: () => 'custom_holidays',
} as const;
