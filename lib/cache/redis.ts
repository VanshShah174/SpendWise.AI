import { Redis } from "ioredis";
import { setMemoryCache, getMemoryCache } from "./memory-cache";

let redis: Redis | null = null;
let connectionAttempted = false;
let useMemoryFallback = false;

function buildRedisClient(): Redis {
  const opts: any = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    username: process.env.REDIS_USERNAME || "default",
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    connectTimeout: 10000,
    commandTimeout: 5000,
    enableOfflineQueue: true,
    retryStrategy: (times: number) => {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  };

  // 🚫 No opts.tls for non-TLS
  if ((process.env.REDIS_TLS || "").toLowerCase() === "true") {
    opts.tls = {}; // only if you ever switch to a TLS port later
  }

  return new Redis(opts);
}

export function getRedisClient(): Redis | null {
  if (connectionAttempted) return redis;
  connectionAttempted = true;

  if (!process.env.REDIS_HOST) {
    console.log("Redis not configured");
    return null;
  }

  try {
    redis = buildRedisClient();
    redis.on("connect", () => console.log("✅ Redis connected"));
    redis.on("error", (err) => console.warn("Redis error:", err?.message || err));
    redis.on("end", () => console.warn("🔌 Redis connection closed"));
    return redis;
  } catch (error: unknown) {
    console.warn("Redis init failed:", error instanceof Error ? error.message : error);
    redis = null;
    return null;
  }
}

async function isRedisConnected(client: Redis): Promise<boolean> {
  try {
    if (client.status !== 'ready') return false;
    await client.ping();
    return true;
  } catch {
    return false;
  }
}

export async function cacheConversation(key: string, messages: any[], ttl = 86400) {
  const client = getRedisClient();
  if (!client || useMemoryFallback || !(await isRedisConnected(client))) {
    setMemoryCache(key, messages, ttl);
    return true;
  }
  try {
    await client.setex(key, ttl, JSON.stringify(messages));
    return true;
  } catch (error: unknown) {
    console.warn("Redis cache failed, using memory:", error instanceof Error ? error.message : error);
    useMemoryFallback = true;
    setMemoryCache(key, messages, ttl);
    return true;
  }
}

export async function getConversation(key: string): Promise<any[] | null> {
  const client = getRedisClient();
  if (!client || useMemoryFallback || !(await isRedisConnected(client))) {
    return getMemoryCache(key);
  }
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error: unknown) {
    console.warn("Redis read failed, using memory:", error instanceof Error ? error.message : error);
    useMemoryFallback = true;
    return getMemoryCache(key);
  }
}
