# SpendWise.AI 💰

An intelligent expense tracking application powered by AI that helps you manage your finances with smart insights and automated categorization.

## 🌟 Features

### 🤖 AI-Powered Experience
- **Intelligent Chatbot**: Interactive AI assistant for natural language expense management
- **Smart Categorization**: Automatic expense categorization using OpenAI
- **Conversational Interface**: Add, edit, and analyze expenses through chat
- **Personalized Insights**: AI-driven financial recommendations and spending analysis
- **Quick FAQ System**: Instant answers to common financial questions

### 💾 Performance & Caching
- **Redis Integration**: Lightning-fast response times with intelligent caching
- **Memory Fallback**: Automatic fallback to in-memory caching when Redis is unavailable
- **Optimized Queries**: Cached conversation history and FAQ responses
- **Real-time Updates**: Optimistic UI updates with React Query integration

### 📊 Analytics & Visualization
- **Interactive Dashboard**: Beautiful charts and visualizations of your spending data
- **Real-time Analytics**: Track spending patterns with detailed statistics
- **Category Breakdown**: Visual representation of spending by category
- **Trend Analysis**: Historical spending patterns and insights

### 🎨 User Experience
- **Dark/Light Mode**: Seamless theme switching with system preference detection
- **Responsive Design**: Mobile-first design that works on all devices
- **Secure Authentication**: Powered by Clerk for secure user management
- **Loading States**: Skeleton loaders and smooth transitions

## 🚀 Tech Stack

### Core Framework
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom gradients and animations
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk with custom theme integration

### 🤖 AI & LangChain Stack
- **LangChain**: `@langchain/core`, `@langchain/openai` for AI workflows
- **OpenAI Integration**: GPT-3.5-turbo for conversational AI
- **OpenAI Embeddings**: `text-embedding-3-small` for vector generation
- **Custom LangChain Chains**: Structured AI response generation
- **Prompt Templates**: Advanced prompt engineering
- **Intent Classification**: Smart user intent recognition

### 🔍 Vector Database & RAG
- **DataStax Astra DB**: Cloud-native vector database (`@datastax/astra-db-ts`)
- **RAG Service**: Retrieval-Augmented Generation for context-aware responses
- **Semantic Search**: Similar expense matching with vector similarity
- **Auto-Embedding**: Automatic expense vectorization
- **Smart Insights**: Context-driven financial recommendations
- **Vector Operations**: Similarity search and contextual retrieval

### ⚡ Performance & Caching
- **Redis**: Primary caching layer with ioredis client
- **Memory Fallback**: Intelligent fallback caching system
- **State Management**: React Query (@tanstack/react-query)
- **Conversation Persistence**: Chat history and state management
- **Optimistic Updates**: Real-time UI updates

### 📊 Visualization & UI
- **Charts**: Chart.js and React-Chart.js-2
- **Icons**: Lucide React icon library
- **Animations**: Custom CSS animations and transitions
- **Deployment**: Vercel-ready with Docker support

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/spendwise-ai.git
   cd spendwise-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="your-postgresql-connection-string"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Redis (Optional - will fallback to memory cache)
   REDIS_HOST="localhost"
   REDIS_PORT="6379"
   REDIS_USERNAME="default"
   REDIS_PASSWORD="your-redis-password"
   REDIS_TLS="false"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Set up Redis (Optional)**
   ```bash
   # Using Docker (recommended)
   npm run redis:start
   
   # Or install Redis locally and start the service
   # The app will automatically fallback to memory cache if Redis is unavailable
   ```

6. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
spendwise-ai/
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── actions/           # Server actions
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Chatbot.tsx        # AI chatbot interface
│   ├── ChatbotWrapper.tsx # Chatbot state management
│   ├── AIInsights.tsx     # AI insights component
│   ├── AddNewRecord.tsx   # Expense form
│   ├── QuickFAQ.tsx       # FAQ component with caching
│   ├── BarChart.tsx       # Chart visualization
│   ├── ExpenseStats.tsx   # Statistics display
│   └── ...
├── contexts/              # React contexts
│   └── ThemeContext.tsx   # Theme management
├── lib/                   # Utility libraries
│   ├── ai.ts             # AI integration
│   ├── db.ts             # Database connection
│   ├── checkUser.ts      # User management
│   ├── cache/            # Caching system
│   │   ├── redis.ts      # Redis client and operations
│   │   ├── memory-cache.ts # In-memory fallback cache
│   │   └── cache.ts      # Cache abstraction layer
│   ├── chatbot/          # Chatbot logic
│   │   ├── intent-detector.ts     # User intent recognition
│   │   ├── conversation-state.ts  # Conversation management
│   │   ├── expense-conversation.ts # Expense handling
│   │   └── edit-conversation.ts   # Edit operations
│   └── hooks/            # Custom React hooks
│       ├── useCachedFAQ.ts       # FAQ caching hook
│       └── useExpenseData.ts     # Expense data management
├── prisma/               # Database schema
│   └── schema.prisma
├── types/                # TypeScript types
└── public/               # Static assets
```

## 🎯 Core Components

### 🤖 AI Chatbot System
- **Conversational Interface**: Natural language expense management
- **Intent Recognition**: Smart detection of user intentions (add, edit, analyze)
- **Context Awareness**: Maintains conversation state across interactions
- **Quick Actions**: Pre-built buttons for common operations
- **Visual Feedback**: Typing indicators, message timestamps, and status updates

### 💾 Intelligent Caching
- **Redis Integration**: Primary caching layer for optimal performance
- **Memory Fallback**: Automatic fallback when Redis is unavailable
- **Conversation Persistence**: Chat history maintained across sessions
- **FAQ Caching**: Instant responses to frequently asked questions

### 📊 Enhanced Analytics
- **AI-Powered Insights**: OpenAI-generated spending analysis and recommendations
- **Real-time Updates**: Optimistic UI updates with React Query
- **Interactive Charts**: Dynamic visualizations with Chart.js
- **Category Intelligence**: Smart expense categorization and analysis

### 🎨 Modern UI/UX
- **Responsive Chatbot**: Mobile-optimized chat interface
- **Theme Integration**: Seamless dark/light mode support
- **Loading States**: Skeleton loaders and smooth animations
- **Accessibility**: ARIA labels and keyboard navigation support

## 🤖 Advanced AI Features

### 🧠 LangChain-Powered Intelligence
- **Structured AI Workflows**: LangChain chains for complex reasoning
- **Prompt Engineering**: Advanced prompt templates for consistent responses
- **Context Management**: Maintains conversation context across interactions
- **Intent Classification**: Smart detection of user intentions
- **Fallback Mechanisms**: Graceful degradation when AI services are unavailable

### 🔍 RAG (Retrieval-Augmented Generation)
- **Contextual Responses**: AI responses based on user's expense history
- **Semantic Search**: Find similar expenses using vector similarity
- **Personalized Insights**: Recommendations based on spending patterns
- **Smart Suggestions**: Context-aware expense categorization
- **Historical Analysis**: Learn from past expenses to improve accuracy

### 💬 Conversational Expense Management
- **Natural Language Processing**: Add expenses using everyday language
- **Context Understanding**: "I spent $15 on coffee this morning" → Automatic categorization
- **Multi-turn Conversations**: Guided expense entry through chat
- **Edit & Delete**: Modify expenses through conversational commands
- **Smart Memory**: Remembers conversation context and user preferences

### 🧠 Intelligent Categorization
AI automatically categorizes expenses with high accuracy:
- 🍔 **Food & Dining**: Restaurants, groceries, coffee shops
- 🚗 **Transportation**: Gas, public transit, rideshares
- 🛒 **Shopping**: Retail, online purchases, clothing
- 🎬 **Entertainment**: Movies, games, subscriptions
- 💡 **Bills & Utilities**: Electricity, internet, phone
- 🏥 **Healthcare**: Medical, pharmacy, insurance
- 📦 **Other**: Miscellaneous expenses

### 📈 Advanced Analytics
- **Vector-Based Insights**: Semantic analysis of spending patterns
- **Trend Prediction**: AI-powered spending forecasts
- **Anomaly Detection**: Identify unusual spending behavior
- **Category Optimization**: Smart budget allocation suggestions
- **Comparative Analysis**: Benchmarking against similar users

## 🎨 Design Features

- **Modern UI**: Clean, gradient-based design with glassmorphism effects
- **Responsive**: Mobile-first approach with breakpoints for all devices
- **Animations**: Smooth transitions and hover effects
- **Dark Mode**: Full dark mode support with system preference detection
- **Accessibility**: Semantic HTML and proper contrast ratios

## 📊 Database Schema

The app uses PostgreSQL with the following main tables:

```prisma
model User {
  id          String   @id @default(uuid())
  clerkUserId String   @unique
  email       String   @unique
  name        String?
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  Records     Record[]
}

model Record {
  id        String   @id @default(uuid())
  text      String
  amount    Float
  category  String   @default("Other")
  date      DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [clerkUserId])
  createdAt DateTime @default(now())
}
```

## 🔧 Configuration

### Environment Variables
Make sure to set up all required environment variables:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# OpenAI Integration
OPENAI_API_KEY="your-openai-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Redis Caching (Optional)
REDIS_HOST="your-redis-host"
REDIS_PORT="6379"
REDIS_USERNAME="default"
REDIS_PASSWORD="your-redis-password"
REDIS_TLS="false"

# DataStax Astra DB (Vector Database)
ASTRA_DB_APPLICATION_TOKEN="your-astra-token"
ASTRA_DB_API_ENDPOINT="your-astra-endpoint"
```

### Redis Setup (Optional)
Redis provides significant performance improvements but is optional:

```bash
# Quick Docker setup
npm run redis:start

# Manual Redis installation
# Install Redis on your system and start the service
# Update .env.local with your Redis connection details
```

**Note**: The app automatically falls back to in-memory caching if Redis is unavailable.

### Theme Configuration
The app supports both light and dark themes with:
- Automatic system preference detection
- Manual theme switching
- Persistent theme preference in localStorage
- Chatbot theme integration

## 🚀 Deployment

The app is optimized for deployment on Vercel with optional Redis:

### Vercel Deployment
1. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

2. **Set environment variables** in your Vercel dashboard:
   - All database and authentication variables
   - OpenAI API key
   - Redis connection details (if using)

3. **Configure your database** connection for production

### Redis Deployment Options
- **Redis Cloud**: Use Redis Cloud for managed Redis hosting
- **Railway/Render**: Deploy Redis alongside your app
- **Docker**: Local Redis container for development
- **No Redis**: App works perfectly with memory-only caching

### Docker Support
Included Docker configuration for Redis:
```bash
# Start Redis container
npm run redis:start

# Stop Redis container  
npm run redis:stop

# View Redis logs
npm run redis:logs
```

## 📱 Mobile Responsiveness

### 📱 Mobile-First Design
- **Responsive Chatbot**: Optimized chat interface for mobile devices
- **Touch-Friendly**: Large tap targets and gesture support
- **Adaptive Layout**: Components adjust seamlessly to screen size
- **Mobile Navigation**: Collapsible menus and bottom-sheet modals

### 💬 Mobile Chat Experience
- **Full-Screen Chat**: Immersive mobile chat experience
- **Quick Actions**: Easy-access buttons for common operations
- **Keyboard Optimization**: Smart keyboard handling and input focus
- **Offline Capability**: Memory cache ensures functionality without internet

## 🔐 Security

### 🛡️ Authentication & Authorization
- **Clerk Integration**: Enterprise-grade authentication
- **Protected Routes**: All API endpoints secured with user validation
- **Session Management**: Secure session handling and token validation

### 🔒 Data Protection
- **Input Validation**: Comprehensive sanitization of user inputs
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Content sanitization and CSP headers
- **HTTPS Enforcement**: SSL/TLS encryption in production

### 💾 Cache Security
- **User Isolation**: Conversation data isolated by user ID
- **TTL Management**: Automatic cache expiration
- **Secure Keys**: Namespaced cache keys prevent data leakage

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Redis Management
npm run redis:start      # Start Redis Docker container
npm run redis:stop       # Stop Redis container
npm run redis:logs       # View Redis logs
npm run test-redis       # Test Redis connection

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma studio        # Open Prisma Studio
```

## 🐛 Troubleshooting

### Common Issues

**Redis Connection Failed**
```bash
# Check if Redis is running
npm run redis:logs

# Restart Redis container
npm run redis:stop && npm run redis:start

# The app will automatically fallback to memory cache
```

**Chatbot Not Responding**
- Check OpenAI API key in environment variables
- Verify network connectivity
- Check browser console for errors

**Database Connection Issues**
- Verify DATABASE_URL in .env.local
- Run `npx prisma db push` to sync schema
- Check database server status

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI capabilities
- Clerk for authentication services
- Vercel for hosting platform
- Next.js team for the amazing framework

## 🤖 Chatbot Usage

### Natural Language Commands
The AI chatbot understands various natural language inputs:

```
# Adding Expenses
"I spent $15 on coffee this morning"
"Add expense: $50 for groceries"
"Record $25 for gas"

# Analyzing Spending
"How much did I spend this month?"
"What's my biggest expense category?"
"Show me my recent expenses"
"Analyze my spending patterns"

# Editing & Managing
"Edit expense 1"
"Delete the coffee expense"
"Change amount to $20"
"Remove expense 3"

# Getting Insights
"Give me budget tips"
"How can I save money?"
"What are my spending trends?"
```

### Conversation Flow
1. **Intent Detection**: AI recognizes what you want to do
2. **Context Gathering**: Asks for missing information if needed
3. **Action Execution**: Performs the requested operation
4. **Confirmation**: Provides feedback and next steps

## 🔌 API Endpoints

### Chatbot API
```typescript
POST /api/chatbot
{
  "message": "I spent $15 on coffee",
  "conversationId": "conv_123"
}

Response:
{
  "response": "Great! I've added your coffee expense...",
  "conversationId": "conv_123",
  "timestamp": "2024-01-01T12:00:00Z",
  "expenseAdded": { /* expense object */ }
}
```

### FAQ API
```typescript
POST /api/faq
{
  "question": "How can I save money?"
}

Response:
{
  "question": "How can I save money?",
  "answer": "Here are some effective money-saving tips...",
  "cached": true,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## ⚡ Performance Features

### Caching Strategy
- **Conversation History**: Cached for 24 hours
- **FAQ Responses**: Cached indefinitely with smart invalidation
- **User Preferences**: Persistent localStorage caching
- **Expense Data**: React Query with optimistic updates

### Optimization Techniques
- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Analysis**: Webpack bundle analyzer integration

### Monitoring & Analytics
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Core Web Vitals monitoring
- **Cache Hit Rates**: Redis/Memory cache performance tracking
- **API Response Times**: Endpoint performance monitoring

## 🌟 Key Differentiators

### 🤖 **Advanced AI Integration**
- **LangChain Framework**: Professional-grade AI workflow management
- **RAG Architecture**: Context-aware responses using your data
- **Vector Database**: Semantic search and intelligent recommendations
- **Multi-Modal AI**: Text understanding and generation

### 🚀 **Production-Ready Features**
- **Enterprise Authentication**: Clerk integration with custom themes
- **Scalable Caching**: Redis with intelligent fallback systems
- **Real-time Updates**: Optimistic UI with React Query
- **Mobile-First Design**: Responsive across all devices

### 🔒 **Security & Performance**
- **Type-Safe**: Full TypeScript implementation
- **Secure by Design**: Input validation and XSS protection
- **Performance Optimized**: Sub-second response times
- **Fault Tolerant**: Graceful degradation and error handling

---

**Built with ❤️ by Vansh**

*Transform your financial management with cutting-edge AI technology, semantic search, and lightning-fast performance!* 🚀

**Repository**: [GitHub - SpendWise.AI](https://github.com/VanshShah174/SpendWise.AI)
