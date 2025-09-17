import { cacheFAQ, COMMON_FAQS } from './cache';

export async function warmCache(): Promise<void> {
  try {
    console.log('🔥 Warming cache with common FAQs...');
    
    // Cache predefined FAQs
    const faqEntries = Object.entries(COMMON_FAQS);
    
    for (const [key, answer] of faqEntries) {
      const question = key.replace(/_/g, ' ');
      await cacheFAQ(question, answer);
    }
    
    // Additional common financial questions
    const additionalFAQs = [
      {
        question: 'What is the 50/30/20 rule?',
        answer: 'The 50/30/20 rule suggests allocating 50% of income to needs (rent, utilities, groceries), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment.'
      },
      {
        question: 'How do I start an emergency fund?',
        answer: 'Start small with $500-$1000, then gradually build to 3-6 months of expenses. Set up automatic transfers to a separate savings account and treat it as a non-negotiable expense.'
      },
      {
        question: 'How can I reduce my monthly bills?',
        answer: 'Review all subscriptions and cancel unused ones, negotiate with service providers, switch to generic brands, use energy-efficient appliances, and consider bundling services for discounts.'
      },
      {
        question: 'What are some money-saving apps?',
        answer: 'Consider budgeting apps like Mint or YNAB, cashback apps like Rakuten, coupon apps like Honey, and expense tracking apps like SpendWise.AI for comprehensive financial management.'
      }
    ];
    
    for (const faq of additionalFAQs) {
      await cacheFAQ(faq.question, faq.answer);
    }
    
    console.log('✅ Cache warming completed');
  } catch (error) {
    console.error('❌ Cache warming failed:', error);
  }
}

export async function schedulePeriodicCacheWarming(): Promise<void> {
  // Warm cache immediately
  await warmCache();
  
  // Schedule periodic warming (every 6 hours)
  setInterval(async () => {
    await warmCache();
  }, 6 * 60 * 60 * 1000);
}