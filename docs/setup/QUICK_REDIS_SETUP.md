# 🚀 Quick Redis Setup for Your Chatbot

## **Option 1: Redis Cloud (Free - Recommended)**

### **Step 1: Sign up for Redis Cloud**
1. Go to: https://redis.com/try-free/
2. Sign up with your email
3. Create a free database (30MB free)

### **Step 2: Get Connection Details**
After creating your database, you'll get:
- **Endpoint**: something like `redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com`
- **Port**: Usually `6379`
- **Password**: Your database password

### **Step 3: Update Environment Variables**
Add these to your `.env.local` file:
```env
REDIS_HOST=your-redis-cloud-endpoint
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

## **Option 2: Docker (If Docker Desktop is Running)**

### **Step 1: Start Docker Desktop**
Make sure Docker Desktop is running on your Windows machine.

### **Step 2: Run Redis Container**
```bash
docker run -d --name redis-chatbot -p 6379:6379 redis:alpine
```

### **Step 3: Test Connection**
```bash
docker exec -it redis-chatbot redis-cli ping
# Should return: PONG
```

## **Option 3: Windows Redis (Native)**

### **Step 1: Download Redis for Windows**
1. Go to: https://github.com/microsoftarchive/redis/releases
2. Download the latest Windows version
3. Extract and run `redis-server.exe`

### **Step 2: Test Connection**
```bash
redis-cli ping
# Should return: PONG
```

## **Testing Your Setup**

### **1. Check Environment Variables**
Make sure your `.env.local` has:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### **2. Test Chatbot**
1. Start your app: `npm run dev`
2. Open: http://localhost:3000
3. Click chatbot button
4. Ask: "Hello" or "Help"
5. Check console for: "✅ Redis connected successfully"

## **Expected Console Output**

### **✅ Success:**
```
✅ Redis connected successfully
POST /api/chatbot 200 in 500ms
```

### **❌ If Redis fails:**
```
Redis connection error: connect ECONNREFUSED 127.0.0.1:6379
POST /api/chatbot 200 in 500ms
```

## **Quick Commands**

```bash
# Test Redis connection
redis-cli ping

# Check if Redis is running
netstat -an | findstr :6379

# Start Redis with Docker
docker run -d --name redis-chatbot -p 6379:6379 redis:alpine

# Stop Redis container
docker stop redis-chatbot
```

## **Benefits of Redis**

- ✅ **Conversation History**: Remembers your chat context
- ✅ **Better Responses**: Context-aware answers
- ✅ **Performance**: Faster response times
- ✅ **Scalability**: Ready for production

Choose the option that works best for you! 🚀
