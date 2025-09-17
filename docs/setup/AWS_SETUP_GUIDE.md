# 🚀 Complete AWS Setup Guide for Expense Tracker Chatbot

## **Step 1: AWS Account Setup**

### **1.1 Create AWS Account**
1. Go to [AWS Console](https://aws.amazon.com/)
2. Sign up for a free account (12 months free tier available)
3. Complete identity verification

### **1.2 Install AWS CLI**
```bash
# Windows (PowerShell)
winget install Amazon.AWSCLI

# Or download from: https://aws.amazon.com/cli/
```

### **1.3 Configure AWS Credentials**
```bash
aws configure
# Enter your Access Key ID, Secret Access Key, Region (us-east-1), and output format (json)
```

## **Step 2: AWS Aurora PostgreSQL Setup**

### **2.1 Create VPC and Subnets**
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=expense-tracker-vpc}]'

# Create subnets
aws ec2 create-subnet --vpc-id vpc-xxxxxxxx --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id vpc-xxxxxxxx --cidr-block 10.0.2.0/24 --availability-zone us-east-1b
```

### **2.2 Create DB Subnet Group**
```bash
aws rds create-db-subnet-group \
  --db-subnet-group-name expense-tracker-subnet-group \
  --db-subnet-group-description "Subnet group for expense tracker database" \
  --subnet-ids subnet-xxxxxxxx subnet-yyyyyyyyy
```

### **2.3 Create Security Group**
```bash
aws ec2 create-security-group \
  --group-name expense-tracker-db-sg \
  --description "Security group for expense tracker database" \
  --vpc-id vpc-xxxxxxxx

# Allow inbound connections on port 5432
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 5432 \
  --cidr 10.0.0.0/16
```

### **2.4 Create Aurora PostgreSQL Cluster**
```bash
aws rds create-db-cluster \
  --db-cluster-identifier expense-tracker-cluster \
  --engine aurora-postgresql \
  --engine-version 13.7 \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --vpc-security-group-ids sg-xxxxxxxx \
  --db-subnet-group-name expense-tracker-subnet-group \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00" \
  --storage-encrypted \
  --deletion-protection
```

### **2.5 Create Aurora Instance**
```bash
aws rds create-db-instance \
  --db-instance-identifier expense-tracker-instance-1 \
  --db-cluster-identifier expense-tracker-cluster \
  --db-instance-class db.t3.medium \
  --engine aurora-postgresql
```

## **Step 3: AWS ElastiCache Redis Setup**

### **3.1 Create ElastiCache Subnet Group**
```bash
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name expense-tracker-cache-subnet-group \
  --cache-subnet-group-description "Subnet group for expense tracker cache" \
  --subnet-ids subnet-xxxxxxxx subnet-yyyyyyyyy
```

### **3.2 Create Security Group for ElastiCache**
```bash
aws ec2 create-security-group \
  --group-name expense-tracker-cache-sg \
  --description "Security group for expense tracker cache" \
  --vpc-id vpc-xxxxxxxx

# Allow inbound connections on port 6379
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 6379 \
  --cidr 10.0.0.0/16
```

### **3.3 Create ElastiCache Redis Cluster**
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id expense-tracker-cache \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --cache-subnet-group-name expense-tracker-cache-subnet-group \
  --security-group-ids sg-xxxxxxxx \
  --port 6379
```

## **Step 4: Environment Configuration**

### **4.1 Create .env.local file**
```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Aurora PostgreSQL Configuration
DATABASE_URL="postgresql://admin:YourSecurePassword123!@expense-tracker-cluster.cluster-xyz.us-east-1.rds.amazonaws.com:5432/expense_tracker"

# ElastiCache Redis Configuration
REDIS_HOST=expense-tracker-cache.xxxxxx.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=

# Optional: For production
NODE_ENV=production
```

### **4.2 Update Prisma Schema**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Expense {
  id        String   @id @default(cuid())
  userId    String
  text      String
  amount    Float
  category  String
  date      DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("expenses")
}

model ChatbotConversation {
  id            String   @id @default(cuid())
  userId        String
  conversationId String  @unique
  messages      Json     // Store conversation history
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("chatbot_conversations")
}
```

## **Step 5: Database Migration**

### **5.1 Generate Prisma Client**
```bash
npx prisma generate
```

### **5.2 Run Database Migration**
```bash
npx prisma db push
```

### **5.3 Seed Database (Optional)**
```bash
npx prisma db seed
```

## **Step 6: Deploy to AWS**

### **6.1 Using Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### **6.2 Using AWS Amplify**
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

## **Step 7: Testing the Setup**

### **7.1 Test Database Connection**
```bash
# Test Aurora connection
psql "postgresql://admin:YourSecurePassword123!@expense-tracker-cluster.cluster-xyz.us-east-1.rds.amazonaws.com:5432/expense_tracker"

# Test Redis connection
redis-cli -h expense-tracker-cache.xxxxxx.cache.amazonaws.com -p 6379 ping
```

### **7.2 Test Chatbot API**
```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "How much did I spend today?"}'
```

## **Step 8: Monitoring and Security**

### **8.1 CloudWatch Monitoring**
```bash
# Create CloudWatch log group
aws logs create-log-group --log-group-name /aws/expense-tracker/chatbot

# Set up billing alerts
aws cloudwatch put-metric-alarm \
  --alarm-name "ExpenseTracker-BillingAlert" \
  --alarm-description "Alert when monthly charges exceed $50" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold
```

### **8.2 Security Best Practices**
1. **Use IAM Roles** instead of access keys when possible
2. **Enable MFA** on your AWS account
3. **Use VPC endpoints** for private communication
4. **Enable encryption** at rest and in transit
5. **Regular security audits** with AWS Config

## **Step 9: Cost Optimization**

### **9.1 Aurora Serverless (Optional)**
```bash
# Convert to Aurora Serverless for variable workloads
aws rds modify-db-cluster \
  --db-cluster-identifier expense-tracker-cluster \
  --engine-mode serverless \
  --scaling-configuration MinCapacity=2,MaxCapacity=16,AutoPause=true,SecondsUntilAutoPause=300
```

### **9.2 ElastiCache TTL Settings**
```javascript
// Set appropriate TTL for cached data
await redis.setex('conversation:user123:conv456', 86400, JSON.stringify(messages)); // 24 hours
```

## **Step 10: Troubleshooting**

### **Common Issues and Solutions**

1. **Connection Timeouts**
   ```bash
   # Check security groups
   aws ec2 describe-security-groups --group-ids sg-xxxxxxxx
   
   # Check VPC configuration
   aws ec2 describe-vpcs --vpc-ids vpc-xxxxxxxx
   ```

2. **Database Connection Issues**
   ```bash
   # Check Aurora cluster status
   aws rds describe-db-clusters --db-cluster-identifier expense-tracker-cluster
   
   # Check instance status
   aws rds describe-db-instances --db-instance-identifier expense-tracker-instance-1
   ```

3. **Redis Connection Issues**
   ```bash
   # Check ElastiCache cluster status
   aws elasticache describe-cache-clusters --cache-cluster-id expense-tracker-cache
   ```

## **Step 11: Production Deployment**

### **11.1 Environment Variables for Production**
```env
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://admin:password@aurora-endpoint:5432/expense_tracker
REDIS_HOST=elasticache-endpoint.cache.amazonaws.com
REDIS_PORT=6379
```

### **11.2 SSL/TLS Configuration**
```javascript
// Enable SSL for Aurora
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?sslmode=require"
    }
  }
});
```

## **Step 12: Backup and Recovery**

### **12.1 Automated Backups**
```bash
# Aurora automatically handles backups, but you can configure retention
aws rds modify-db-cluster \
  --db-cluster-identifier expense-tracker-cluster \
  --backup-retention-period 30
```

### **12.2 Point-in-Time Recovery**
```bash
# Restore to a specific point in time
aws rds restore-db-cluster-to-point-in-time \
  --source-db-cluster-identifier expense-tracker-cluster \
  --db-cluster-identifier expense-tracker-cluster-restored \
  --restore-to-time 2024-01-01T12:00:00Z
```

## **Estimated Costs (Free Tier)**

- **Aurora PostgreSQL**: Free for 750 hours/month (t3.medium)
- **ElastiCache Redis**: Free for 750 hours/month (t3.micro)
- **Data Transfer**: 1GB/month free
- **Storage**: 20GB free for Aurora

## **Next Steps**

1. **Set up monitoring** with CloudWatch
2. **Implement logging** for debugging
3. **Add error handling** for production
4. **Set up CI/CD** pipeline
5. **Add performance monitoring**
6. **Implement rate limiting**
7. **Add authentication** for API endpoints

Your chatbot is now ready for production use with AWS infrastructure! 🚀
