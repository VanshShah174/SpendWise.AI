'use server';

import { getQuickFAQAnswer, cacheFAQ, getCachedFAQ } from '@/lib/cache/cache';
import { generateAIAnswer } from '@/lib/ai';

export async function getSmartFAQAnswer(question: string): Promise<string> {
  try {
    // First check predefined FAQs
    const quickAnswer = await getQuickFAQAnswer(question);
    if (quickAnswer) {
      return quickAnswer;
    }

    // Then check cached FAQs
    const cachedAnswer = await getCachedFAQ(question);
    if (cachedAnswer) {
      return cachedAnswer;
    }

    // Generate new answer for general financial questions
    const generalFinancialAnswer = await generateGeneralFinancialAnswer(question);
    
    // Cache the answer
    await cacheFAQ(question, generalFinancialAnswer);
    
    return generalFinancialAnswer;
  } catch (error) {
    console.error('Error getting smart FAQ answer:', error);
    return "I'm unable to provide an answer at the moment. Please try again later or contact support.";
  }
}

async function generateGeneralFinancialAnswer(question: string): Promise<string> {
  try {
    // Use AI to generate answer for general financial questions without user data
    const answer = await generateAIAnswer(question, []);
    return answer;
  } catch (error) {
    console.error('Error generating general financial answer:', error);
    
    // Fallback responses based on question keywords
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('save') || lowerQuestion.includes('saving')) {
      return 'Start by tracking all expenses, create a budget with the 50/30/20 rule, and automate savings. Even small amounts saved consistently can grow significantly over time.';
    }
    
    if (lowerQuestion.includes('budget')) {
      return 'Create a realistic budget by tracking expenses for a month, categorizing them, and setting limits for each category. Review and adjust monthly based on your actual spending patterns.';
    }
    
    if (lowerQuestion.includes('debt')) {
      return 'Focus on paying off high-interest debt first, consider the debt snowball or avalanche method, and avoid taking on new debt while paying off existing balances.';
    }
    
    return 'For personalized financial advice, consider consulting with a financial advisor. General best practices include budgeting, saving regularly, and tracking your expenses.';
  }
}

export async function preloadCommonFAQs(): Promise<void> {
  const commonQuestions = [
    'How can I save more money?',
    'What are the best budgeting tips?',
    'How do I reduce my food expenses?',
    'What are good ways to save on transportation?',
    'How should I manage my entertainment budget?',
    'What is the 50/30/20 rule?',
    'How do I start an emergency fund?',
    'What are some money-saving apps?',
    'How can I reduce my monthly bills?',
    'What are the best investment options for beginners?'
  ];

  for (const question of commonQuestions) {
    const existingAnswer = await getCachedFAQ(question);
    if (!existingAnswer) {
      await getSmartFAQAnswer(question);
    }
  }
}