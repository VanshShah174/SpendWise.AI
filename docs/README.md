# SpendWise.AI Documentation 📚

This directory contains all documentation for setting up and configuring SpendWise.AI.

## 📁 Directory Structure

```
docs/
├── setup/          # Infrastructure & service setup guides
│   ├── AWS_SETUP_GUIDE.md
│   ├── REDIS_CLOUD_SETUP.md
│   ├── REDIS_SETUP_GUIDE.md
│   ├── REDIS_QUICK_SETUP.md
│   └── QUICK_REDIS_SETUP.md
└── guides/         # Feature implementation guides
    ├── CHATBOT_QUICK_FIX.md
    ├── CHATBOT_SETUP.md
    ├── CHATBOT_TEST_GUIDE.md
    ├── CHATBOT_WORKING_SOLUTION.md
    ├── SMART_CHATBOT_SETUP.md
    └── INSTALL_REACT_QUERY.md
```

## 🚀 Quick Start

1. **Infrastructure Setup**: Start with `/setup/` guides for Redis and AWS
2. **Feature Implementation**: Follow `/guides/` for specific features
3. **Testing**: Use test guides to verify functionality

## 📋 Setup Order

### Essential Setup (Required)
1. [Redis Setup](./setup/REDIS_SETUP_GUIDE.md) - Core caching system
2. [Chatbot Setup](./guides/CHATBOT_SETUP.md) - AI assistant functionality

### Optional Setup
- [AWS Setup](./setup/AWS_SETUP_GUIDE.md) - For production deployment
- [React Query](./guides/INSTALL_REACT_QUERY.md) - Enhanced data fetching

## 🔧 Configuration Files

All setup guides reference the main `.env.local` file in the project root. Ensure you have:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Redis (if using)
REDIS_URL="your-redis-connection-string"
```

## 📖 Guide Categories

### Setup Guides (`/setup/`)
- **Infrastructure**: Database, caching, cloud services
- **Authentication**: User management and security
- **External APIs**: Third-party service integrations

### Implementation Guides (`/guides/`)
- **Features**: Step-by-step feature implementation
- **Testing**: Verification and debugging procedures
- **Optimization**: Performance and user experience improvements

## 🆘 Troubleshooting

If you encounter issues:

1. Check the specific guide's troubleshooting section
2. Verify all environment variables are set correctly
3. Ensure dependencies are installed: `npm install`
4. Restart the development server: `npm run dev`

## 📞 Support

For additional help:
- Check the main [README.md](../README.md) in the project root
- Review error logs in the console
- Verify service status (Redis, database, APIs)

---

**Last Updated**: January 2025
**Version**: 1.0.0