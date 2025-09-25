import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { searchSimilarExpenses } from '../vector/embeddings';
import getRecords from '@/app/actions/getRecords';

const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.3,
});

const SMART_EXPENSE_PROMPT = PromptTemplate.fromTemplate(`
You are SpendWise.AI, an intelligent expense tracking assistant. Use the provided context to give personalized, helpful responses.

CONTEXT FROM USER'S EXPENSE HISTORY:
Similar Expenses: {similarExpenses}
Recent Expenses: {recentExpenses}
User Spending Patterns: {spendingPatterns}

USER MESSAGE: {userMessage}

INSTRUCTIONS:
- Use the expense context to provide personalized insights
- Suggest categories based on similar past expenses
- Mention spending patterns when relevant
- Be conversational and helpful
- If adding expense, suggest amount based on similar expenses
- If analyzing, provide specific insights from their data

Response:
`);

export async function generateSmartExpenseResponse(
  userMessage: string,
  userId: string
): Promise<string> {
  try {
    // Get RAG context
    const [similarExpenses, userRecords] = await Promise.all([
      searchSimilarExpenses(userMessage, 3, userId),
      getRecords()
    ]);

    const recentExpenses = userRecords.records?.slice(0, 5) || [];
    
    // Analyze spending patterns
    const spendingPatterns = analyzeSpendingPatterns(recentExpenses);

    // Create the chain
    const chain = RunnableSequence.from([
      SMART_EXPENSE_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    // Execute the chain
    const response = await chain.invoke({
      userMessage,
      similarExpenses: JSON.stringify(similarExpenses.map((exp: any) => ({
        text: exp.text,
        amount: exp.metadata?.amount,
        category: exp.metadata?.category,
        similarity: exp.$similarity
      }))),
      recentExpenses: JSON.stringify(recentExpenses.map(exp => ({
        text: exp.text,
        amount: exp.amount,
        category: exp.category,
        date: exp.date
      }))),
      spendingPatterns: JSON.stringify(spendingPatterns)
    });

    return response;
  } catch (error) {
    console.error('Smart response generation failed:', error);
    return 'I can help you with your expenses! What would you like to do?';
  }
}

function analyzeSpendingPatterns(expenses: Array<{ amount: number; category?: string }>) {
  if (!expenses.length) return {};

  const categoryTotals: Record<string, number> = {};
  const categoryAvg: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  expenses.forEach(exp => {
    const cat = exp.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  Object.keys(categoryTotals).forEach(cat => {
    categoryAvg[cat] = categoryTotals[cat] / categoryCounts[cat];
  });

  const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
    categoryTotals[a] > categoryTotals[b] ? a : b
  );

  return {
    categoryAverages: categoryAvg,
    topSpendingCategory: topCategory,
    totalExpenses: expenses.length,
    totalAmount: Object.values(categoryTotals).reduce((a, b) => a + b, 0)
  };
}