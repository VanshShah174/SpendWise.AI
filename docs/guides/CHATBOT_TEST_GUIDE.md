# 🧪 Chatbot Test Script

## **Quick Test Commands**

### **1. Test Database Connection**
```bash
# Test if your database is working
npx prisma db push
```

### **2. Test Chatbot API**
```bash
# Test the chatbot endpoint
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "How much did I spend today?"}'
```

### **3. Test in Browser**
1. Open: http://localhost:3000
2. Look for floating chatbot button (bottom-right)
3. Click it to open chat
4. Try these test messages:
   - "Hello"
   - "How much did I spend today?"
   - "Show me my categories"
   - "What's my total this month?"

## **Expected Behavior**

### **✅ Working Correctly:**
- Chatbot opens when you click the button
- Messages send and receive responses
- No Redis connection errors in console
- Database queries work (if you have expense data)

### **❌ Common Issues:**
- **"Unauthorized"**: You need to be logged in with Clerk
- **"Message is required"**: Empty message sent
- **Database errors**: Check your DATABASE_URL in .env.local

## **Debug Steps**

### **1. Check Console Logs**
```bash
# Look for these messages:
# ✅ "Redis disabled - chatbot will work without conversation history caching"
# ✅ "Chatbot API error:" (only if there's an actual error)
```

### **2. Check Database Connection**
```bash
# Test database
npx prisma studio
# Should open Prisma Studio in browser
```

### **3. Check Environment Variables**
```bash
# Check if .env.local exists
cat .env.local

# Should have:
# DATABASE_URL="your-database-url"
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-key"
# CLERK_SECRET_KEY="your-clerk-secret"
```

## **Sample Test Data**

If you don't have expense data, add some test records:

```sql
-- Add test expense records
INSERT INTO "Record" (id, text, amount, category, date, "userId", "createdAt", "updatedAt")
VALUES 
  ('test1', 'Coffee', 5.50, 'Food', NOW(), 'your-user-id', NOW(), NOW()),
  ('test2', 'Gas', 45.00, 'Transportation', NOW(), 'your-user-id', NOW(), NOW()),
  ('test3', 'Groceries', 120.00, 'Food', NOW(), 'your-user-id', NOW(), NOW());
```

## **Troubleshooting Commands**

```bash
# 1. Check if app is running
curl http://localhost:3000

# 2. Check chatbot endpoint
curl http://localhost:3000/api/chatbot

# 3. Check database connection
npx prisma db push

# 4. Restart development server
npm run dev
```

## **Success Indicators**

- ✅ No Redis connection errors
- ✅ Chatbot UI opens and responds
- ✅ Database queries work
- ✅ Natural language processing works
- ✅ Conversation flows smoothly

Your chatbot should now work perfectly without Redis! 🎉
