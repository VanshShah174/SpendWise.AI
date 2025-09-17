import { getRedisClient } from './redis';
import { setMemoryCache, getMemoryCache } from './memory-cache';

// Cache keys
const CACHE_KEYS = {
  FAQ: 'faq:',
  SPENDING_INSIGHTS: 'insights:',
  USER_SPENDING: 'spending:',
  CATEGORY_SUGGESTIONS: 'category:',
} as const;

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  FAQ: 86400, // 24 hours for FAQ
  INSIGHTS: 3600, // 1 hour for insights
  SPENDING: 1800, // 30 minutes for spending data
  CATEGORY: 7200, // 2 hours for category suggestions
} as const;

async function isRedisReady(client: any): Promise<boolean> {
  try {
    if (!client || client.status !== 'ready') return false;
    await client.ping();
    return true;
  } catch {
    return false;
  }
}

export async function cacheSet(key: string, data: any, ttl: number = 3600): Promise<boolean> {
  const client = getRedisClient();
  
  if (!client || !(await isRedisReady(client))) {
    setMemoryCache(key, data, ttl);
    return true;
  }

  try {
    await client.setex(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('Redis cache set failed, using memory:', error);
    setMemoryCache(key, data, ttl);
    return true;
  }
}

export async function cacheGet(key: string): Promise<any | null> {
  const client = getRedisClient();
  
  if (!client || !(await isRedisReady(client))) {
    return getMemoryCache(key);
  }

  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Redis cache get failed, using memory:', error);
    return getMemoryCache(key);
  }
}

export async function cacheFAQ(question: string, answer: string): Promise<void> {
  const key = `${CACHE_KEYS.FAQ}${hashQuestion(question)}`;
  await cacheSet(key, { question, answer, timestamp: Date.now() }, CACHE_TTL.FAQ);
}

export async function getCachedFAQ(question: string): Promise<string | null> {
  const key = `${CACHE_KEYS.FAQ}${hashQuestion(question)}`;
  const cached = await cacheGet(key);
  return cached?.answer || null;
}

export async function cacheSpendingInsights(userId: string, insights: any[]): Promise<void> {
  const key = `${CACHE_KEYS.SPENDING_INSIGHTS}${userId}`;
  await cacheSet(key, insights, CACHE_TTL.INSIGHTS);
}

export async function getCachedSpendingInsights(userId: string): Promise<any[] | null> {
  const key = `${CACHE_KEYS.SPENDING_INSIGHTS}${userId}`;
  return await cacheGet(key);
}

export async function cacheUserSpending(userId: string, spendingData: any): Promise<void> {
  const key = `${CACHE_KEYS.USER_SPENDING}${userId}`;
  await cacheSet(key, spendingData, CACHE_TTL.SPENDING);
}

export async function getCachedUserSpending(userId: string): Promise<any | null> {
  const key = `${CACHE_KEYS.USER_SPENDING}${userId}`;
  return await cacheGet(key);
}

export async function cacheCategorySuggestion(description: string, category: string): Promise<void> {
  const key = `${CACHE_KEYS.CATEGORY_SUGGESTIONS}${hashQuestion(description)}`;
  await cacheSet(key, category, CACHE_TTL.CATEGORY);
}

export async function getCachedCategorySuggestion(description: string): Promise<string | null> {
  const key = `${CACHE_KEYS.CATEGORY_SUGGESTIONS}${hashQuestion(description)}`;
  return await cacheGet(key);
}

// Simple hash function for consistent cache keys
function hashQuestion(text: string): string {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

// Predefined FAQ responses for common questions
export const COMMON_FAQS = {
  'how_to_save_money': 'Track your expenses daily, set a budget for each category, and look for patterns in your spending. Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
  'best_budgeting_tips': 'Start with tracking all expenses for a month, categorize them, set realistic limits for each category, and review weekly. Use the envelope method for discretionary spending.',
  'reduce_food_expenses': 'Plan meals weekly, cook at home more often, buy generic brands, use coupons, and avoid impulse purchases. Batch cooking can save both time and money.',
  'transportation_savings': 'Consider carpooling, public transport, walking, or biking. Maintain your vehicle regularly to avoid costly repairs, and compare gas prices.',
  'entertainment_budget': 'Set a monthly entertainment limit, look for free activities, use streaming services instead of cable, and take advantage of happy hours and discounts.',
} as const;

export async function getQuickFAQAnswer(question: string): Promise<string | null> {
  const hashedQuestion = hashQuestion(question);
  
  // Check predefined FAQs first
  if (hashedQuestion in COMMON_FAQS) {
    return COMMON_FAQS[hashedQuestion as keyof typeof COMMON_FAQS];
  }
  
  // Check cache
  return await getCachedFAQ(question);
}