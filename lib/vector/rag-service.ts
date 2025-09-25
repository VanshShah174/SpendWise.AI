import { searchSimilarExpenses } from './embeddings';
import getRecords  from '@/app/actions/getRecords';

export async function getExpenseContext(query: string, userId: string) {
  // Get similar expenses from vector search (filtered by userId)
  const similarExpenses = await searchSimilarExpenses(query, 3, userId);
  
  // Get user's recent expenses for additional context
  const result = await getRecords();
  const recentExpenses = result.records || [];
  
  return {
    similarExpenses: similarExpenses.map((exp: any) => ({
      text: exp.text,
      metadata: exp.metadata,
      similarity: exp.$similarity
    })),
    recentExpenses: recentExpenses.slice(0, 5)
  };
}

export async function generateSmartResponse(userMessage: string, userId: string) {
  const context = await getExpenseContext(userMessage, userId);
  
  const contextPrompt = `
Based on the user's expense history and similar expenses:

Similar expenses: ${JSON.stringify(context.similarExpenses)}
Recent expenses: ${JSON.stringify(context.recentExpenses)}

User message: "${userMessage}"

Provide a helpful, contextual response about their expenses.
`;

  return contextPrompt;
}