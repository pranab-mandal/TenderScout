import { SearchResponse } from '../schemas/tender.js';

interface CacheEntry {
  response: SearchResponse;
  expires_at: number;
}

export class MemoryCacheService {
  private cache = new Map<string, CacheEntry>();
  private defaultTtlMs: number;

  constructor(ttlMinutes: number = 10) {
    this.defaultTtlMs = ttlMinutes * 60 * 1000;
  }

  private generateKey(query: string, location?: string, category?: string, maxValue?: number): string {
    const parts = [
      query.toLowerCase().trim(),
      (location || '').toLowerCase().trim(),
      (category || '').toLowerCase().trim(),
      maxValue ? String(maxValue) : ''
    ];
    return parts.join('|');
  }

  public get(query: string, location?: string, category?: string, maxValue?: number): SearchResponse | null {
    const key = this.generateKey(query, location, category, maxValue);
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires_at) {
      this.cache.delete(key);
      return null;
    }

    return {
      ...entry.response,
      cached: true
    };
  }

  public set(query: string, response: SearchResponse, location?: string, category?: string, maxValue?: number, ttlMs?: number): void {
    const key = this.generateKey(query, location, category, maxValue);
    const expires_at = Date.now() + (ttlMs || this.defaultTtlMs);
    this.cache.set(key, {
      response: { ...response, cached: true },
      expires_at
    });
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

export const memoryCache = new MemoryCacheService(10);
