/**
 * API Cache and Rate Limiting Utility
 * Prevents excessive API calls by caching responses and implementing rate limiting
 */

interface CacheEntry {
  data: any
  timestamp: number
  expiresAt: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

class ApiCache {
  private cache: Map<string, CacheEntry> = new Map()
  private rateLimits: Map<string, RateLimitEntry> = new Map()
  
  // Default cache duration: 5 minutes
  private defaultCacheDuration = 5 * 60 * 1000
  
  // Rate limit: max 10 requests per minute per endpoint
  private maxRequestsPerMinute = 10
  private rateLimitWindow = 60 * 1000

  /**
   * Get cached data if valid
   */
  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    // Check if cache is still valid
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  /**
   * Set cache data
   */
  set(key: string, data: any, duration?: number): void {
    const cacheDuration = duration || this.defaultCacheDuration
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheDuration
    })
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear()
  }

  /**
   * Clear cache entries matching a pattern
   */
  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern)
    Array.from(this.cache.keys()).forEach(key => {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    })
  }

  /**
   * Check if request is rate limited
   */
  isRateLimited(endpoint: string): boolean {
    const entry = this.rateLimits.get(endpoint)
    
    if (!entry) {
      // First request
      this.rateLimits.set(endpoint, {
        count: 1,
        resetAt: Date.now() + this.rateLimitWindow
      })
      return false
    }
    
    // Check if window has reset
    if (Date.now() > entry.resetAt) {
      this.rateLimits.set(endpoint, {
        count: 1,
        resetAt: Date.now() + this.rateLimitWindow
      })
      return false
    }
    
    // Increment count
    entry.count++
    
    // Check if rate limit exceeded
    if (entry.count > this.maxRequestsPerMinute) {
      console.warn(`Rate limit exceeded for ${endpoint}`)
      return true
    }
    
    return false
  }

  /**
   * Get time until rate limit resets
   */
  getRateLimitReset(endpoint: string): number {
    const entry = this.rateLimits.get(endpoint)
    if (!entry) return 0
    return Math.max(0, entry.resetAt - Date.now())
  }
}

// Singleton instance
export const apiCache = new ApiCache()

/**
 * Cached API wrapper
 * Usage: const data = await cachedRequest('key', () => api.someMethod(), 60000)
 */
export async function cachedRequest<T>(
  cacheKey: string,
  requestFn: () => Promise<T>,
  cacheDuration?: number,
  skipCache = false
): Promise<T> {
  // Check cache first (unless skipCache is true)
  if (!skipCache) {
    const cached = apiCache.get(cacheKey)
    if (cached !== null) {
      console.log(`[Cache] Hit: ${cacheKey}`, cached)
      return cached
    }
  }
  
  // Check rate limit
  if (apiCache.isRateLimited(cacheKey)) {
    const resetTime = apiCache.getRateLimitReset(cacheKey)
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(resetTime / 1000)}s`)
  }
  
  console.log(`[Cache] Miss: ${cacheKey}`)
  
  // Make the actual request
  const data = await requestFn()
  console.log(`[Cache] Caching data for ${cacheKey}:`, data)
  
  // Cache the result
  apiCache.set(cacheKey, data, cacheDuration)
  
  return data
}

/**
 * Invalidate cache on mutations
 */
export function invalidateCache(patterns: string | string[]): void {
  const patternArray = Array.isArray(patterns) ? patterns : [patterns]
  patternArray.forEach(pattern => {
    apiCache.clearPattern(pattern)
  })
}

