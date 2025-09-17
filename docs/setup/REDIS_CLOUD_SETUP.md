# 🚀 Redis Cloud Setup (2 Minutes)

## Step 1: Get Free Redis Cloud Account

1. Go to: https://redis.com/try-free/
2. Sign up (free - no credit card needed)
3. Create new database
4. Copy connection details

## Step 2: Update Your .env File

Replace these lines in your `.env`:

```env
REDIS_HOST=your-actual-redis-host.redis.cloud.redislabs.com
REDIS_PORT=your-actual-port
REDIS_PASSWORD=your-actual-password
REDIS_TLS=true
```

## Step 3: Test Connection

```bash
npm run dev
```

Open chatbot and ask: "How much did I spend today?"

✅ No more Redis connection errors!  
✅ Conversation memory enabled!  
✅ Smarter responses!

## Example Redis Cloud Details:

After creating database, you'll see:
- **Host**: `redis-12345.c123.us-east-1-2.ec2.cloud.redislabs.com`
- **Port**: `12345`
- **Password**: `your-generated-password`

Copy these exact values to your `.env` file.

## Benefits:

- ✅ No Docker needed
- ✅ Always available
- ✅ Free tier (30MB)
- ✅ Conversation memory
- ✅ Better chatbot responses