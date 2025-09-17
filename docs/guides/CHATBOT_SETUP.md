# 🤖 Expense Tracker Chatbot Setup Guide

## AWS Infrastructure Setup

### 1. AWS Aurora Database Setup

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
```

**Aurora PostgreSQL Setup:**
```bash
# Create Aurora cluster
aws rds create-db-cluster \
  --db-cluster-identifier expense-tracker-cluster \
  --engine aurora-postgresql \
  --engine-version 13.7 \
  --master-username admin \
  --master-user-password YourPassword123! \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name default \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00"
```

### 2. AWS ElastiCache Redis Setup

```bash
# Create ElastiCache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name expense-tracker-subnet-group \
  --cache-subnet-group-description "Subnet group for expense tracker cache" \
  --subnet-ids subnet-xxxxxxxxx subnet-yyyyyyyyy

# Create ElastiCache cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id expense-tracker-cache \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --cache-subnet-group-name expense-tracker-subnet-group \
  --security-group-ids sg-xxxxxxxxx
```

### 3. Environment Variables

Create a `.env.local` file in your project root:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Redis/ElastiCache Configuration
REDIS_HOST=your-elasticache-endpoint.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here

# Database Configuration
DATABASE_URL="postgresql://admin:YourPassword123!@your-aurora-cluster.cluster-xyz.us-east-1.rds.amazonaws.com:5432/expense_tracker"
```

### 4. Install Required Dependencies

```bash
npm install ioredis @aws-sdk/client-rds @aws-sdk/client-elasticache
```

### 5. Database Schema Updates

Add chatbot-related tables to your Prisma schema:

```prisma
model ChatbotConversation {
  id            String   @id @default(cuid())
  userId        String
  conversationId String  @unique
  messages      Json     // Store conversation history
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("chatbot_conversations")
}

model ChatbotQuery {
  id            String   @id @default(cuid())
  userId        String
  query         String
  queryType     String   // spending, category, date, etc.
  parameters    Json
  response      String
  createdAt     DateTime @default(now())
  
  @@map("chatbot_queries")
}
```

### 6. Deploy to AWS

```bash
# Build the application
npm run build

# Deploy using Vercel (recommended)
vercel --prod

# Or deploy to AWS using Serverless Framework
npm install -g serverless
serverless deploy
```

## Chatbot Features

### Supported Queries

1. **Spending Queries:**
   - "How much did I spend today?"
   - "Show me my spending this week"
   - "What did I spend on food?"

2. **Category Queries:**
   - "Show me my food expenses"
   - "How much did I spend on transportation?"
   - "What's my shopping total?"

3. **Date Queries:**
   - "What did I spend yesterday?"
   - "Show me this month's expenses"
   - "Compare this month to last month"

4. **Amount Queries:**
   - "What's my total spending?"
   - "What's my average expense?"
   - "What's my highest expense?"

5. **Trend Queries:**
   - "Show me my spending trends"
   - "Is my spending increasing?"
   - "Compare my spending over time"

### Advanced Features

- **Conversation Memory:** Uses ElastiCache to store conversation history
- **Smart Parsing:** Natural language processing for expense queries
- **Real-time Data:** Direct database queries for up-to-date information
- **Context Awareness:** Maintains conversation context across messages
- **Error Handling:** Graceful fallbacks for API failures

## Security Considerations

1. **IAM Roles:** Use least-privilege IAM roles for AWS services
2. **VPC Security:** Ensure Aurora and ElastiCache are in private subnets
3. **Encryption:** Enable encryption at rest and in transit
4. **Access Control:** Implement proper authentication and authorization
5. **Rate Limiting:** Add rate limiting to prevent abuse

## Monitoring and Logging

```bash
# CloudWatch Logs
aws logs create-log-group --log-group-name /aws/expense-tracker/chatbot

# CloudWatch Metrics
aws cloudwatch put-metric-data \
  --namespace "ExpenseTracker/Chatbot" \
  --metric-data MetricName=MessagesProcessed,Value=1,Unit=Count
```

## Cost Optimization

1. **Aurora Serverless:** Use Aurora Serverless for variable workloads
2. **ElastiCache TTL:** Set appropriate TTL for cached conversations
3. **Connection Pooling:** Implement connection pooling for database
4. **Caching Strategy:** Cache frequently accessed data
5. **Monitoring:** Set up billing alerts and cost monitoring

## Troubleshooting

### Common Issues

1. **Connection Timeouts:** Check VPC security groups and subnets
2. **Authentication Errors:** Verify AWS credentials and IAM permissions
3. **Redis Connection:** Ensure ElastiCache cluster is accessible
4. **Database Queries:** Check Aurora cluster status and connectivity

### Debug Commands

```bash
# Test Redis connection
redis-cli -h your-elasticache-endpoint.cache.amazonaws.com -p 6379 ping

# Test Aurora connection
psql "postgresql://admin:password@aurora-endpoint:5432/expense_tracker"

# Check AWS credentials
aws sts get-caller-identity
```

## Next Steps

1. **Enhanced NLP:** Integrate AWS Comprehend for better language understanding
2. **Voice Interface:** Add Amazon Polly for text-to-speech responses
3. **Predictive Analytics:** Use AWS SageMaker for spending predictions
4. **Multi-language Support:** Add support for multiple languages
5. **Integration:** Connect with external financial services via APIs
