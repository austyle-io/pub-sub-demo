import { LRUCache } from 'lru-cache';
import { documentEvents } from './event-consistency';

/**
 * Intelligent Permission Caching System
 *
 * This system provides fast permission lookups while maintaining consistency
 * by automatically invalidating cached permissions when documents change.
 *
 * Key features:
 * - LRU cache with configurable size and TTL
 * - Automatic invalidation on document/permission changes
 * - Hierarchical cache keys for granular invalidation
 * - Metrics and monitoring support
 * - Memory-efficient storage
 */

/**
 * Type definition for cached permission.
 * @since 1.0.0
 */
export interface CachedPermission {
  userId: string;
  docId: string;
  collection: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  cachedAt: number;
  ttl: number;
}

/**
 * Type definition for cache metrics.
 * @since 1.0.0
 */
export interface CacheMetrics {
  hits: number;
  misses: number;
  invalidations: number;
  size: number;
  hitRate: number;
}

class PermissionCache {
  private cache: LRUCache<string, CachedPermission>;
  private metrics = {
    hits: 0,
    misses: 0,
    invalidations: 0,
  };

  constructor(
    options: {
      maxSize?: number;
      ttlMs?: number;
    } = {},
  ) {
    const { maxSize = 1000, ttlMs = 5 * 60 * 1000 } = options; // 5 minute default TTL

    this.cache = new LRUCache({
      max: maxSize,
      ttl: ttlMs,
      // Update access time on get
      updateAgeOnGet: true,
      // Clean up expired entries
      ttlAutopurge: true,
    });

    // Set up automatic invalidation on document changes
    this.setupInvalidationHandlers();
  }

  /**
   * Generate cache key for permission lookup
   */
  private getCacheKey(
    collection: string,
    docId: string,
    userId: string,
  ): string {
    return `${collection}:${docId}:${userId}`;
  }

  /**
   * Generate pattern for document-level invalidation
   */
  private getDocumentPattern(collection: string, docId: string): string {
    return `${collection}:${docId}:`;
  }

  /**
   * Set up automatic cache invalidation
   */
  private setupInvalidationHandlers(): void {
    // Invalidate on any document change
    documentEvents.onDocumentChange((event) => {
      this.invalidateDocument(event.collection, event.docId);
    });

    // Invalidate on permission changes (more specific)
    documentEvents.on('permission:change', (event) => {
      this.invalidateDocument(event.collection, event.docId);
    });
  }

  /**
   * Get cached permission if available and not expired
   */
  get(
    collection: string,
    docId: string,
    userId: string,
  ): CachedPermission | null {
    const key = this.getCacheKey(collection, docId, userId);
    const cached = this.cache.get(key);

    if (cached) {
      this.metrics.hits++;
      return cached;
    }

    this.metrics.misses++;
    return null;
  }

  /**
   * Cache permission result
   */
  set(
    collection: string,
    docId: string,
    userId: string,
    permissions: {
      canRead: boolean;
      canWrite: boolean;
      canDelete: boolean;
    },
    customTtl?: number,
  ): void {
    const key = this.getCacheKey(collection, docId, userId);
    const cached: CachedPermission = {
      userId,
      docId,
      collection,
      ...permissions,
      cachedAt: Date.now(),
      ttl: customTtl || this.cache.ttl || 300000, // 5 minutes default
    };

    this.cache.set(key, cached, { ttl: customTtl });
  }

  /**
   * Invalidate all permissions for a specific document
   */
  invalidateDocument(collection: string, docId: string): void {
    const pattern = this.getDocumentPattern(collection, docId);
    const keysToDelete: string[] = [];

    // Find all keys that match the document pattern
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        keysToDelete.push(key);
      }
    }

    // Delete matching keys
    for (const key of keysToDelete) {
      this.cache.delete(key);
      this.metrics.invalidations++;
    }

    console.log(
      `Invalidated ${keysToDelete.length} cached permissions for ${collection}:${docId}`,
    );
  }

  /**
   * Invalidate all permissions for a specific user
   */
  invalidateUser(userId: string): void {
    const keysToDelete: string[] = [];

    // Find all keys that end with the user ID
    for (const [key, value] of this.cache.entries()) {
      if (value.userId === userId) {
        keysToDelete.push(key);
      }
    }

    // Delete matching keys
    for (const key of keysToDelete) {
      this.cache.delete(key);
      this.metrics.invalidations++;
    }

    console.log(
      `Invalidated ${keysToDelete.length} cached permissions for user ${userId}`,
    );
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.metrics.invalidations += size;
    console.log(`Cleared entire permission cache (${size} entries)`);
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      ...this.metrics,
      size: this.cache.size,
      hitRate: total > 0 ? this.metrics.hits / total : 0,
    };
  }

  /**
   * Get cache status for monitoring
   */
  getStatus(): {
    size: number;
    maxSize: number;
    ttl: number;
    memory: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      ttl: this.cache.ttl || 0,
      memory: this.cache.calculatedSize || 0,
    };
  }
}

// Singleton instance
/**
 * permission Cache.
 * @since 1.0.0
 */
export const permissionCache = new PermissionCache({
  maxSize: 2000, // Cache up to 2000 permission entries
  ttlMs: 10 * 60 * 1000, // 10 minute TTL
});

/**
 * Helper function to get or compute permissions with caching
 */
export async function getCachedPermissions(
  collection: string,
  docId: string,
  userId: string,
  computeFn: () => Promise<{
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
  }>,
): Promise<{
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  fromCache: boolean;
}> {
  // Try cache first
  const cached = permissionCache.get(collection, docId, userId);
  if (cached) {
    return {
      canRead: cached.canRead,
      canWrite: cached.canWrite,
      canDelete: cached.canDelete,
      fromCache: true,
    };
  }

  // Compute permissions
  const permissions = await computeFn();

  // Cache the result
  permissionCache.set(collection, docId, userId, permissions);

  return {
    ...permissions,
    fromCache: false,
  };
}
