# SpendWise.AI 💰

An intelligent expense tracking application powered by AI that helps you manage your finances with smart insights and automated categorization.

## 🌟 Features

- **AI-Powered Insights**: Get personalized financial recommendations based on your spending patterns
- **Smart Categorization**: Automatic expense categorization using OpenAI
- **Interactive Dashboard**: Beautiful charts and visualizations of your spending data
- **Dark/Light Mode**: Seamless theme switching with system preference detection
- **Real-time Analytics**: Track your spending patterns with detailed statistics
- **Secure Authentication**: Powered by Clerk for secure user management
- **Responsive Design**: Mobile-first design that works on all devices

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS with custom gradients and animations
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **AI Integration**: OpenAI API for insights and categorization
- **Charts**: Chart.js and React-Chart.js-2
- **Deployment**: Vercel-ready

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
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
spendwise-ai/
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── actions/           # Server actions
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── AIInsights.tsx     # AI insights component
│   ├── AddNewRecord.tsx   # Expense form
│   ├── BarChart.tsx       # Chart visualization
│   ├── ExpenseStats.tsx   # Statistics display
│   └── ...
├── contexts/              # React contexts
│   └── ThemeContext.tsx   # Theme management
├── lib/                   # Utility libraries
│   ├── ai.ts             # AI integration
│   ├── db.ts             # Database connection
│   └── checkUser.ts      # User management
├── prisma/               # Database schema
│   └── schema.prisma
├── types/                # TypeScript types
└── public/               # Static assets
```

## 🎯 Core Components

### AIInsights Component
- Provides personalized financial insights using OpenAI
- Displays spending warnings, tips, and recommendations
- Interactive Q&A functionality for detailed explanations

### AddNewRecord Component
- Smart expense entry form with AI categorization
- Real-time category suggestions based on description
- Form validation and error handling

### Interactive Dashboard
- Visual spending charts using Chart.js
- Expense statistics and trends
- Responsive design for all screen sizes

## 🤖 AI Features

### Smart Categorization
The app automatically categorizes expenses into:
- 🍔 Food & Dining
- 🚗 Transportation
- 🛒 Shopping
- 🎬 Entertainment
- 💡 Bills & Utilities
- 🏥 Healthcare
- 📦 Other

### Intelligent Insights
AI analyzes your spending patterns to provide:
- Spending trend alerts
- Budget optimization suggestions
- Category-specific recommendations
- Positive reinforcement for good habits

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
- Database connection string
- Clerk authentication keys
- OpenAI API key
- App URL for proper referrer headers

### Theme Configuration
The app supports both light and dark themes with automatic system preference detection. Theme preference is persisted in localStorage.

## 🚀 Deployment

The app is optimized for deployment on Vercel:

1. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

2. **Set environment variables** in your Vercel dashboard

3. **Configure your database** connection for production

## 📱 Mobile Responsiveness

- Optimized for mobile-first experience
- Touch-friendly interface elements
- Responsive charts and visualizations
- Collapsible navigation and layouts

## 🔐 Security

- Secure authentication with Clerk
- Protected API routes
- Input validation and sanitization
- HTTPS enforcement in production

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI capabilities
- Clerk for authentication services
- Vercel for hosting platform
- Next.js team for the amazing framework

**Built with ❤️ by Vansh**

Transform your financial management with AI-powered insights! 🚀
