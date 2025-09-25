import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import getRecords from '@/app/actions/getRecords';

const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.4,
});

const EXPENSE_ANALYSIS_PROMPT = PromptTemplate.fromTemplate(`
You are a financial advisor analyzing expense data. Provide personalized insights and recommendations.

USER'S EXPENSE DATA:
{expenseData}

USER QUESTION: {userQuestion}

ANALYSIS INSTRUCTIONS:
- Identify spending patterns and trends
- Highlight top spending categories
- Suggest budget optimizations
- Provide actionable recommendations
- Use specific numbers from their data
- Be encouraging but realistic

Provide a detailed analysis with insights and recommendations:
`);

export async function analyzeExpenses(userQuestion: string): Promise<string> {
  try {
    const { records } = await getRecords();
    
    if (!records || records.length === 0) {
      return "You don't have any expenses recorded yet. Start tracking your expenses to get personalized insights!";
    }

    // Prepare expense data for analysis
    const expenseData = {
      totalExpenses: records.length,
      totalAmount: records.reduce((sum, exp) => sum + exp.amount, 0),
      categories: getCategoryBreakdown(records),
      recentTrends: getRecentTrends(records),
      averageExpense: records.reduce((sum, exp) => sum + exp.amount, 0) / records.length
    };

    const chain = RunnableSequence.from([
      EXPENSE_ANALYSIS_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    const analysis = await chain.invoke({
      expenseData: JSON.stringify(expenseData, null, 2),
      userQuestion
    });

    return analysis;
  } catch (error) {
    console.error('Expense analysis failed:', error);
    return "I couldn't analyze your expenses right now. Please try again later.";
  }
}

function getCategoryBreakdown(records: any[]) {
  const breakdown: Record<string, { total: number; count: number; avg: number }> = {};
  
  records.forEach(record => {
    const category = record.category || 'Other';
    if (!breakdown[category]) {
      breakdown[category] = { total: 0, count: 0, avg: 0 };
    }
    breakdown[category].total += record.amount;
    breakdown[category].count += 1;
  });

  Object.keys(breakdown).forEach(category => {
    breakdown[category].avg = breakdown[category].total / breakdown[category].count;
  });

  return breakdown;
}

function getRecentTrends(records: any[]) {
  const last7Days = records.filter(record => {
    const recordDate = new Date(record.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return recordDate >= weekAgo;
  });

  const last30Days = records.filter(record => {
    const recordDate = new Date(record.date);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    return recordDate >= monthAgo;
  });

  return {
    last7Days: {
      count: last7Days.length,
      total: last7Days.reduce((sum, exp) => sum + exp.amount, 0)
    },
    last30Days: {
      count: last30Days.length,
      total: last30Days.reduce((sum, exp) => sum + exp.amount, 0)
    }
  };
}