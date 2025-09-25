import { Redis } from "ioredis";
import { setMemoryCache, getMemoryCache } from "./memory-cache";

let redis: Redis | null = null;
let connectionAttempted = false;
let useMemoryFallback = false;

function buildRedisClient(): Redis {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // TLS configuration for Redis Cloud
  if ((process.env.REDIS_TLS || "").toLowerCase() === "true") {
    opts.tls = {
      rejectUnauthorized: false,
      requestCert: true,
      agent: false
    };
    opts.family = 4; // Force IPv4
  }

  return new Redis(opts);
}

export function getRedisClient(): Redis | null {
  if (connectionAttempted) return redis;
  connectionAttempted = true;

  // console.log("🔍 REDIS DEBUG:", {
  //   host: process.env.REDIS_HOST,
  //   port: process.env.REDIS_PORT,
  //   hasPassword: !!process.env.REDIS_PASSWORD,
  //   tls: process.env.REDIS_TLS
  // });

  if (!process.env.REDIS_HOST) {
    // console.log("❌ Redis not configured");
    return null;
  }

  try {
    // console.log("🔄 Creating Redis client...");
    redis = buildRedisClient();
    // redis.on("connect", () => console.log("✅ Redis connected"));
    // redis.on("ready", () => console.log("🚀 Redis ready"));
    redis.on("error", (err) => console.error("Redis error:", err?.message || err));
    // redis.on("end", () => console.warn("🔌 Redis connection closed"));
    // redis.on("reconnecting", () => console.log("🔄 Redis reconnecting..."));
    // console.log("✅ Redis client created, status:", redis.status);
    return redis;
  } catch (error: unknown) {
    console.warn("❌ Redis init failed:", error instanceof Error ? error.message : error);
    redis = null;
    return null;
  }
}

async function isRedisConnected(client: Redis): Promise<boolean> {
  try {
    // console.log("🔍 Checking Redis status:", client.status);
    if (client.status !== 'ready') {
      // console.log("⏳ Redis not ready, attempting connection...");
      await client.connect();
    }
    const result = await client.ping();
    // console.log("🏓 Redis ping result:", result);
    return true;
  } catch (error) {
    // console.log("❌ Redis connection failed:", error instanceof Error ? error.message : error);
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function cacheConversation(key: string, messages: any[] | null, ttl = 86400) {
  // console.log("💾 Caching conversation:", key);
  const client = getRedisClient();
  if (!client || useMemoryFallback || !(await isRedisConnected(client))) {
    // console.log("🧠 Using memory cache for:", key);
    setMemoryCache(key, messages, ttl);
    return true;
  }
  try {
    if (messages === null) {
      await client.del(key);
    } else {
      await client.setex(key, ttl, JSON.stringify(messages));
    }
    return true;
  } catch (error: unknown) {
    console.warn("Redis cache failed, using memory:", error instanceof Error ? error.message : error);
    useMemoryFallback = true;
    setMemoryCache(key, messages, ttl);
    return true;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
