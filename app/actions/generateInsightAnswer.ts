'use server';

import { checkUser } from '@/lib/checkUser';
import { db } from '@/lib/db';
import { generateAIAnswer, ExpenseRecord } from '@/lib/ai';
import { getQuickFAQAnswer, getCachedFAQ, cacheFAQ, getCachedUserSpending, cacheUserSpending } from '@/lib/cache/cache';
import { detectUserIntent } from '@/lib/chatbot/intent-detector';

export async function generateInsightAnswer(question: string): Promise<string> {
  try {
    // Detect user intent first
    const intent = detectUserIntent(question);
    
    // Handle specific intents with predefined responses
    if (intent.response && intent.confidence > 0.8) {
      return intent.response;
    }

    // Check for quick FAQ answers first (no auth needed for general questions)
    const quickAnswer = await getQuickFAQAnswer(question);
    if (quickAnswer) {
      return quickAnswer;
    }

    // Check cached FAQ
    const cachedAnswer = await getCachedFAQ(question);
    if (cachedAnswer) {
      return cachedAnswer;
    }

    const user = await checkUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check cached user spending data
    let expenseData = await getCachedUserSpending(user.clerkUserId);
    
    if (!expenseData) {
      // Get user's recent expenses (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const expenses = await db.record.findMany({
        where: {
          userId: user.clerkUserId,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50, // Limit to recent 50 expenses for analysis
      });

      // Convert to format expected by AI
      expenseData = expenses.map((expense) => ({
        id: expense.id,
        amount: expense.amount,
        category: expense.category || 'Other',
        description: expense.text,
        date: expense.createdAt.toISOString(),
      }));
      
      // Cache the spending data
      await cacheUserSpending(user.clerkUserId, expenseData);
    }

    // Generate AI answer with user data
    const answer = await generateAIAnswer(question, expenseData);
    
    // Add debug info if using real data
    const debugAnswer = expenseData.length > 0 
      ? `${answer} [📊 Based on ${expenseData.length} recent expenses]`
      : answer;
    
    // Cache the FAQ answer for future use
    await cacheFAQ(question, debugAnswer);
    
    return debugAnswer;
  } catch (error) {
    console.error('Error generating insight answer:', error);
    return "I'm unable to provide a detailed answer at the moment. Please try refreshing the insights or check your connection.";
  }
}