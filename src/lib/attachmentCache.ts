interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  cosUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface ActivityLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  displayOrder: number;
  createdAt: string;
  createdBy: string;
}

interface CacheEntry {
  data: Attachment[];
  timestamp: number;
  expiresAt: number;
}

interface LinkCacheEntry {
  data: ActivityLink[];
  timestamp: number;
  expiresAt: number;
}

class AttachmentCache {
  private cache = new Map<string, CacheEntry>();
  private linkCache = new Map<string, LinkCacheEntry>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存

  private getCacheKey(activityId: string, userId: string): string {
    return `${activityId}-${userId}`;
  }

  // 获取缓存的附件列表
  get(activityId: string, userId: string): Attachment[] | null {
    const key = this.getCacheKey(activityId, userId);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // 设置缓存
  set(activityId: string, userId: string, attachments: Attachment[]): void {
    const key = this.getCacheKey(activityId, userId);
    const now = Date.now();

    // 去重处理
    const uniqueAttachments = attachments.filter((attachment, index, array) => {
      return array.findIndex(a => a.id === attachment.id) === index;
    });

    this.cache.set(key, {
      data: uniqueAttachments,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    });
  }

  // 添加新附件到缓存
  addAttachment(activityId: string, userId: string, attachment: Attachment): void {
    const key = this.getCacheKey(activityId, userId);
    const entry = this.cache.get(key);

    if (entry && Date.now() <= entry.expiresAt) {
      // 检查是否已存在相同ID的附件
      const exists = entry.data.some(att => att.id === attachment.id);
      if (!exists) {
        // 将新附件添加到列表开头（按上传时间倒序）
        entry.data.unshift(attachment);
      }
    }
  }

  // 从缓存中删除附件
  removeAttachment(activityId: string, userId: string, attachmentId: string): void {
    const key = this.getCacheKey(activityId, userId);
    const entry = this.cache.get(key);

    if (entry && Date.now() <= entry.expiresAt) {
      entry.data = entry.data.filter(att => att.id !== attachmentId);
    }
  }

  // 清除指定缓存
  clear(activityId: string, userId: string): void {
    const key = this.getCacheKey(activityId, userId);
    this.cache.delete(key);
  }

  // 链接缓存方法
  getLinks(activityId: string, userId: string): ActivityLink[] | null {
    const key = this.getCacheKey(activityId, userId);
    const entry = this.linkCache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.linkCache.delete(key);
      return null;
    }

    return entry.data;
  }

  setLinks(activityId: string, userId: string, links: ActivityLink[]): void {
    const key = this.getCacheKey(activityId, userId);
    const now = Date.now();

    this.linkCache.set(key, {
      data: links,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    });
  }

  addLink(activityId: string, userId: string, link: ActivityLink): void {
    const key = this.getCacheKey(activityId, userId);
    const entry = this.linkCache.get(key);

    if (entry && Date.now() <= entry.expiresAt) {
      // 按显示顺序插入
      const insertIndex = entry.data.findIndex(l => l.displayOrder > link.displayOrder);
      if (insertIndex === -1) {
        entry.data.push(link);
      } else {
        entry.data.splice(insertIndex, 0, link);
      }
    }
  }

  updateLink(activityId: string, userId: string, updatedLink: ActivityLink): void {
    const key = this.getCacheKey(activityId, userId);
    const entry = this.linkCache.get(key);

    if (entry && Date.now() <= entry.expiresAt) {
      const index = entry.data.findIndex(l => l.id === updatedLink.id);
      if (index !== -1) {
        entry.data[index] = updatedLink;
      }
    }
  }

  removeLink(activityId: string, userId: string, linkId: string): void {
    const key = this.getCacheKey(activityId, userId);
    const entry = this.linkCache.get(key);

    if (entry && Date.now() <= entry.expiresAt) {
      entry.data = entry.data.filter(l => l.id !== linkId);
    }
  }

  clearLinks(activityId: string, userId: string): void {
    const key = this.getCacheKey(activityId, userId);
    this.linkCache.delete(key);
  }

  // 清除所有缓存
  clearAll(): void {
    this.cache.clear();
    this.linkCache.clear();
  }

  // 清除过期缓存
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
    for (const [key, entry] of this.linkCache.entries()) {
      if (now > entry.expiresAt) {
        this.linkCache.delete(key);
      }
    }
  }

  // 获取缓存统计信息
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        itemCount: entry.data.length,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        isExpired: Date.now() > entry.expiresAt
      }))
    };
  }
}

// 创建全局缓存实例
export const attachmentCache = new AttachmentCache();

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    attachmentCache.clearExpired();
  }, 60000); // 每分钟清理一次
}
