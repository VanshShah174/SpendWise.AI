const { exec } = require('child_process');
const Redis = require('ioredis');

async function setupRedis() {
  console.log('🚀 Setting up Redis for SpendWise.AI chatbot...\n');

  // Check if Docker is available
  console.log('1. Checking Docker availability...');
  
  return new Promise((resolve) => {
    exec('docker --version', (error) => {
      if (error) {
        console.log('❌ Docker not found. Please install Docker Desktop first.');
        console.log('Download from: https://www.docker.com/products/docker-desktop/\n');
        resolve(false);
        return;
      }

      console.log('✅ Docker found!\n');

      // Start Redis container
      console.log('2. Starting Redis container...');
      exec('docker run -d --name expense-tracker-redis -p 6379:6379 redis:alpine', (error, stdout, stderr) => {
        if (error && !error.message.includes('already in use')) {
          console.log('❌ Failed to start Redis container:', error.message);
          
          // Try to start existing container
          console.log('3. Trying to start existing container...');
          exec('docker start expense-tracker-redis', (startError) => {
            if (startError) {
              console.log('❌ Failed to start existing container. Please run manually:');
              console.log('   docker run -d --name expense-tracker-redis -p 6379:6379 redis:alpine\n');
              resolve(false);
              return;
            }
            testRedisConnection();
          });
          return;
        }

        console.log('✅ Redis container started!\n');
        
        // Wait a moment for Redis to start
        setTimeout(testRedisConnection, 2000);
      });
    });
  });

  async function testRedisConnection() {
    console.log('3. Testing Redis connection...');
    
    try {
      const redis = new Redis({
        host: 'localhost',
        port: 6379,
        connectTimeout: 5000,
        lazyConnect: true,
      });

      await redis.ping();
      console.log('✅ Redis connection successful!\n');
      
      console.log('🎉 Setup complete! Your chatbot is ready to use.');
      console.log('📝 Next steps:');
      console.log('   1. Run: npm run dev');
      console.log('   2. Open: http://localhost:3000');
      console.log('   3. Click the chatbot button and start asking about your expenses!\n');
      
      await redis.disconnect();
      resolve(true);
    } catch (error) {
      console.log('❌ Redis connection failed:', error.message);
      console.log('💡 Try running: docker restart expense-tracker-redis\n');
      resolve(false);
    }
  }
}

if (require.main === module) {
  setupRedis();
}

module.exports = { setupRedis };