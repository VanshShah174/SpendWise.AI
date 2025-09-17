// In-memory fallback cache when Redis is unavailable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, { data: any; expires: number }>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setMemoryCache(key: string, data: any, ttlSeconds = 3600) {
  if (data === null) {
    cache.delete(key);
    return;
  }
  
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMemoryCache(key: string): any {
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