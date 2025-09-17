// In-memory fallback cache when Redis is unavailable
const cache = new Map<string, { data: any; expires: number }>();

export function setMemoryCache(key: string, data: any, ttlSeconds = 3600) {
  const expires = Date.now() + (ttlSeconds * 1000);
  cache.set(key, { data, expires });
  
  // Clean expired entries
  setTimeout(() => {
    const entry = cache.get(key);
    if (entry && Date.now() > entry.expires) {
      cache.delete(key);
    }
  }, ttlSeconds * 1000);
}

export function getMemoryCache(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

export function clearMemoryCache() {
  cache.clear();
}