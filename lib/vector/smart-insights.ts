import { searchSimilarExpenses } from './embeddings';
import getRecords from '@/app/actions/getRecords';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateSmartInsights(userId: string) {
  try {
    // Get user's recent expenses
    const result = await getRecords();
    const recentExpenses = result.records || [];

    if (recentExpenses.length === 0) {
      return {
        insights: ['Start tracking expenses to get personalized insights!'],
        patterns: [],
        recommendations: ['Add your first expense to begin your financial journey'],
      };
    }

    // Find patterns using vector similarity
    const patterns: {
      category: string;
      frequency: number;
      avgAmount: number;
      pattern: string;
    }[] = [];

    const categories = [...new Set(recentExpenses.map((e) => e.category))];

    for (const category of categories) {
      const categoryExpenses = recentExpenses.filter((e) => e.category === category);

      if (categoryExpenses.length > 1) {
        const avgAmount =
          categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length;

        patterns.push({
          category,
          frequency: categoryExpenses.length,
          avgAmount,
          pattern: `You spend an average of $${avgAmount.toFixed(2)} on ${category}`,
        });
      }
    }

    // Generate AI insights using expense context
    const expenseContext = recentExpenses.map((e) => ({
      text: e.text,
      amount: e.amount,
      category: e.category,
      date: e.date,
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            "You are a financial advisor. Analyze the user's expenses and provide 3 key insights and 3 actionable recommendations. Be specific and helpful.",
        },
        {
          role: 'user',
          content: `Analyze these expenses and provide insights:\n\n${JSON.stringify(
            expenseContext,
            null,
            2,
          )}\n\nPatterns found: ${JSON.stringify(patterns, null, 2)}`,
        },
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    // Parse AI response into structured format
    const lines = aiResponse.split('\n').filter((line) => line.trim());
    const insights = lines.filter((line) => line.toLowerCase().includes('insight') || line.includes('•')).slice(0, 3);
    const recommendations = lines.filter((line) => line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest')).slice(0, 3);

    return {
      insights: insights.length > 0 ? insights : ['Your spending patterns look healthy!'],
      patterns: patterns.map((p) => p.pattern),
      recommendations:
        recommendations.length > 0
          ? recommendations
          : ['Keep tracking your expenses for better insights'],
    };
  } catch (error) {
    console.error('Smart insights error:', error);
    return {
      insights: ['Unable to generate insights at the moment'],
      patterns: [],
      recommendations: ['Please try again later'],
    };
  }
}
