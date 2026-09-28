/**
 * In-Memory Provenance & Weather Cache Layer
 * Tracks LIVE, CACHED, and SAMPLE provenance badges, timestamps, and TTL invalidations.
 * Provides fallback data with age notices when upstream external APIs experience transient failures.
 */

export type ProvenanceBadge = "LIVE" | "CACHED" | "SAMPLE";

export interface CacheEntry<T> {
  data: T;
  fetchedAt: string;
  source: string;
  modelOrRunTime?: string;
  expiresAt: number;
}

export interface ProvenanceMeta {
  badge: ProvenanceBadge;
  source: string;
  fetchedAt: string;
  modelOrRunTime: string;
  isStale: boolean;
  ageSeconds: number;
  notice?: string;
}

class WeatherCacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

  public set<T>(
    key: string,
    data: T,
    source: string,
    modelOrRunTime: string = "Operational Run",
    ttlMs: number = this.DEFAULT_TTL_MS
  ): CacheEntry<T> {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      fetchedAt: new Date(now).toISOString(),
      source,
      modelOrRunTime,
      expiresAt: now + ttlMs,
    };
    this.cache.set(key, entry);
    return entry;
  }

  public get<T>(key: string): { entry: CacheEntry<T> | null; meta: ProvenanceMeta | null } {
    const entry = this.cache.get(key);
    if (!entry) {
      return { entry: null, meta: null };
    }

    const now = Date.now();
    const ageSeconds = Math.max(0, Math.floor((now - new Date(entry.fetchedAt).getTime()) / 1000));
    const isStale = now > entry.expiresAt;

    const meta: ProvenanceMeta = {
      badge: isStale ? "CACHED" : "LIVE",
      source: entry.source,
      fetchedAt: entry.fetchedAt,
      modelOrRunTime: entry.modelOrRunTime || "GFS 0.25° NWP",
      isStale,
      ageSeconds,
      notice: isStale
        ? `Serving cached data from ${Math.round(ageSeconds / 60)} minutes ago due to upstream network latency.`
        : undefined,
    };

    return { entry, meta };
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const weatherCache = new WeatherCacheManager();
