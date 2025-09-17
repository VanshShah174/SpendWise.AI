const { Redis } = require('ioredis');
require('dotenv').config({ path: '.env' });

async function testRedis() {
  console.log('🔄 Testing Redis connections...\n');
  
  if (!process.env.REDIS_HOST) {
    console.log('❌ REDIS_HOST not set');
    return;
  }

  // Test without TLS first
  console.log('Testing WITHOUT TLS...');
  let redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    connectTimeout: 5000,
    lazyConnect: true,
    enableOfflineQueue: false,
  });

  try {
    await redis.connect();
    const pong = await redis.ping();
    console.log('✅ Non-TLS connected:', pong);
    await redis.disconnect();
    return;
  } catch (error) {
    console.log('❌ Non-TLS failed:', error.message);
    redis.disconnect();
  }

  // Test with TLS
  console.log('\nTesting WITH TLS...');
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: { rejectUnauthorized: false },
    connectTimeout: 5000,
    lazyConnect: true,
    enableOfflineQueue: false,
  });

  try {
    await redis.connect();
    const pong = await redis.ping();
    console.log('✅ TLS connected:', pong);
  } catch (error) {
    console.log('❌ TLS failed:', error.message);
  } finally {
    redis.disconnect();
  }
}

testRedis();