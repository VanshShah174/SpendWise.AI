# 🚀 Quick Redis Setup Guide for Local Development

## **Option 1: Docker (Recommended - Easiest)**

### **1. Install Docker Desktop**
- Download from: https://www.docker.com/products/docker-desktop/
- Install and start Docker Desktop

### **2. Run Redis with Docker**
```bash
# Run Redis container
docker run -d --name redis-chatbot -p 6379:6379 redis:alpine

# Check if it's running
docker ps

# Test connection
docker exec -it redis-chatbot redis-cli ping
```

### **3. Update Environment Variables**
Create or update `.env.local`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## **Option 2: Windows Redis (Native)**

### **1. Download Redis for Windows**
```bash
# Using Chocolatey
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases
```

### **2. Start Redis Server**
```bash
# Start Redis server
redis-server

# In another terminal, test connection
redis-cli ping
```

## **Option 3: WSL2 (Windows Subsystem for Linux)**

### **1. Install WSL2**
```bash
# Install WSL2
wsl --install

# Install Ubuntu
wsl --install -d Ubuntu
```

### **2. Install Redis in WSL2**
```bash
# Update packages
sudo apt update

# Install Redis
sudo apt install redis-server

# Start Redis
sudo service redis-server start

# Test connection
redis-cli ping
```

## **Option 4: Cloud Redis (Production Ready)**

### **1. Redis Cloud (Free Tier)**
- Go to: https://redis.com/try-free/
- Sign up for free account
- Create a database
- Get connection details

### **2. Update Environment Variables**
```env
REDIS_HOST=your-redis-cloud-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

## **Testing Your Setup**

### **1. Test Redis Connection**
```bash
# Test with redis-cli
redis-cli ping
# Should return: PONG

# Test with Node.js
node -e "const Redis = require('ioredis'); const redis = new Redis(); redis.ping().then(console.log);"
```

### **2. Test Chatbot**
1. Start your Next.js app: `npm run dev`
2. Open: http://localhost:3000
3. Click the chatbot button
4. Ask: "How much did I spend today?"
5. Check console for Redis connection status

## **Troubleshooting**

### **Common Issues:**

1. **Port 6379 already in use**
   ```bash
   # Find what's using port 6379
   netstat -ano | findstr :6379
   
   # Kill the process
   taskkill /PID <process_id> /F
   ```

2. **Docker not running**
   ```bash
   # Start Docker Desktop
   # Or restart Docker service
   ```

3. **Redis connection refused**
   ```bash
   # Check if Redis is running
   docker ps
   
   # Or check Windows services
   services.msc
   ```

4. **Permission denied**
   ```bash
   # Run as administrator
   # Or check Docker permissions
   ```

## **Environment Variables Reference**

```env
# Local Development
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Production (AWS ElastiCache)
REDIS_HOST=your-elasticache-endpoint.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your-password

# Production (Redis Cloud)
REDIS_HOST=your-redis-cloud-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

## **Quick Start Commands**

```bash
# 1. Start Redis with Docker
docker run -d --name redis-chatbot -p 6379:6379 redis:alpine

# 2. Test connection
docker exec -it redis-chatbot redis-cli ping

# 3. Start your app
npm run dev

# 4. Test chatbot
# Open http://localhost:3000 and click chatbot button
```

## **Benefits of Each Option**

- **Docker**: Easy setup, isolated, works on any OS
- **Native Windows**: Fastest, no Docker overhead
- **WSL2**: Linux environment, more Redis features
- **Cloud**: Production ready, managed service

Choose the option that works best for your setup! 🚀
