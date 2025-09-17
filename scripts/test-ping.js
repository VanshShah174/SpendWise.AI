// test-ping.js
const Redis = require("ioredis");

const HOST = "redis-15384.c281.us-east-1-2.ec2.redns.redis-cloud.com";
const PORT = 15384;
const USER = "default";
const PASS = 'EbhXR0vVb2uIBWfu1InpwGr7zeIu7C1U'; // <-- paste from Redis Cloud

(async () => {
  try {
    // Use rediss:// so TLS is unambiguous
    const url = `rediss://${encodeURIComponent(USER)}:${encodeURIComponent(PASS)}@${HOST}:${PORT}`;
    const client = new Redis(url, {
      // no extra TLS options needed
      enableOfflineQueue: false,
      connectTimeout: 10000,
      maxRetriesPerRequest: 1,
    });
    const pong = await client.ping();
    console.log("✅ TLS PING:", pong);
    await client.quit();
  } catch (e) {
    console.error("❌ TLS failed:", e.message);
  }
})();
