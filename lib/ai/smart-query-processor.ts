import OpenAI from 'openai';
import getRecords from '@/app/actions/getRecords';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function processSmartQuery(userMessage: string): Promise<string> {
  try {
    const { records } = await getRecords();
    if (!records || records.length === 0) {
      return "You don't have any expenses recorded yet. Add some expenses first!";
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are SpendWise.AI, an intelligent financial assistant. Handle ALL types of questions - logical, illogical, financial, or general.

CAPABILITIES:
- Answer expense questions with precise data
- ADD NEW EXPENSES intelligently from natural language
- Handle illogical questions gracefully
- Provide financial advice and tips
- Understand context and intent
- Be helpful, friendly, and conversational

RULES:
- For expense questions: Use the provided data
- For adding expenses: Parse amount, description, date, category from user message
- For illogical questions: Respond helpfully and redirect to expenses
- For general questions: Provide useful financial advice
- Always be encouraging and supportive

EXPENSE ADDING:
If user wants to add an expense, extract:
- Amount (required)
- Description (required) 
- Date (parse from natural language like "January 21st", "yesterday", "today")
- Category (Food, Transportation, Shopping, Entertainment, Bills, Healthcare, Other)

Respond with: "I'll add that expense for you! [Details] - Should I save this?"

TODAY: ${new Date().toLocaleDateString()}

USER'S EXPENSE DATA:
${JSON.stringify(records.map(r => ({
  description: r.text,
  amount: r.amount,
  category: r.category,
  date: new Date(r.date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})), null, 2)}`
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 400,
      temperature: 0.1,
    });

    return completion.choices[0]?.message?.content || 'Could not process your query.';
  } catch (error) {
    console.error('Smart query failed:', error);
    return 'Error processing request.';
  }
}