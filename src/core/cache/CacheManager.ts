/**
 * Cache management for translations
 */

import { Storage } from '@plasmohq/storage';
import { CacheEntry, TranslationResult } from '../../types';
import { STORAGE_KEYS, CACHE_DURATION } from '../../lib/constants';

const storage = new Storage();

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private initialized = false;

  /**
   * Initialize cache from storage
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      const cachedData = await storage.get<CacheEntry[]>(STORAGE_KEYS.CACHE);
      if (cachedData && Array.isArray(cachedData)) {
        this.cache = new Map(
          cachedData
            .filter((entry) => Date.now() - entry.timestamp < CACHE_DURATION)
            .map((entry) => [entry.key, entry])
        );
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize cache:', error);
      this.initialized = true;
    }
  }

  /**
   * Generate cache key
   */
  generateKey(text: string, from: string, to: string): string {
    return `${from}-${to}-${text}`;
  }

  /**
   * Get translation from cache
   */
  async get(text: string, from: string, to: string): Promise<TranslationResult | null> {
    await this.init();
    const key = this.generateKey(text, from, to);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      await this.persist();
      return null;
    }

    return entry.result;
  }

  /**
   * Set translation in cache
   */
  async set(
    text: string,
    from: string,
    to: string,
    result: TranslationResult
  ): Promise<void> {
    await this.init();
    const key = this.generateKey(text, from, to);

    const entry: CacheEntry = {
      key,
      result,
      timestamp: Date.now(),
    };

    this.cache.set(key, entry);
    await this.persist();
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    await storage.remove(STORAGE_KEYS.CACHE);
  }

  /**
   * Get cache size
   */
  async size(): Promise<number> {
    await this.init();
    return this.cache.size;
  }

  /**
   * Persist cache to storage
   */
  private async persist(): Promise<void> {
    try {
      const entries = Array.from(this.cache.values());
      await storage.set(STORAGE_KEYS.CACHE, entries);
    } catch (error) {
      console.error('Failed to persist cache:', error);
    }
  }

  /**
   * Clean expired entries
   */
  async cleanExpired(): Promise<void> {
    await this.init();
    const now = Date.now();
    let hasChanges = false;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_DURATION) {
        this.cache.delete(key);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await this.persist();
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager();
