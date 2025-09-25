import { OpenAIEmbeddings } from '@langchain/openai';
import { searchSimilarExpenses } from '@/lib/vector/embeddings';
import OpenAI from 'openai';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'text-embedding-3-small',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface SmartIntent {
  type: 'add_expense' | 'analyze_expenses' | 'show_expenses' | 'edit_expense' | 'delete_expense' | 'general';
  confidence: number;
  reasoning: string;
  context?: any;
  startConversation?: boolean;
}

export async function detectSmartIntent(userMessage: string, userId?: string): Promise<SmartIntent> {
  try {
    // Get context from user's expense history using RAG
    let expenseContext = '';
    if (userId) {
      try {
        const similarExpenses = await searchSimilarExpenses(userMessage, 3);
        expenseContext = `User's similar expenses: ${JSON.stringify(similarExpenses.map(e => ({
          text: e.text,
          amount: e.metadata?.amount,
          category: e.metadata?.category
        })))}`;
      } catch (error) {
        console.log('No expense context available');
      }
    }

    // Use AI to understand intent with context
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an intelligent expense tracker assistant. Analyze the user's message and determine their intent.

INTENT TYPES:
- add_expense: User wants to record a new expense (e.g., "I spent $5 on coffee", "Bought lunch for $12")
- analyze_expenses: User wants analysis of existing expenses (e.g., "How much did I spend?", "Show my biggest category")
- show_expenses: User wants to see their expense list (e.g., "Show my recent expenses", "List my expenses")
- edit_expense: User wants to modify an existing expense (e.g., "Edit my coffee expense", "Change the amount")
- delete_expense: User wants to remove an expense (e.g., "Delete my lunch expense", "Remove the $5 coffee")
- general: General questions or conversation

CONTEXT: ${expenseContext}

Respond with JSON only:
{
  "type": "intent_type",
  "confidence": 0.0-1.0,
  "reasoning": "why you chose this intent",
  "startConversation": true/false
}`
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 200,
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    const aiIntent = JSON.parse(response);
    
    return {
      type: aiIntent.type,
      confidence: aiIntent.confidence,
      reasoning: aiIntent.reasoning,
      context: expenseContext,
      startConversation: aiIntent.startConversation || false
    };

  } catch (error) {
    console.error('Smart intent detection failed:', error);
    
    // Fallback to simple pattern matching
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('spent') || lowerMessage.includes('bought') || lowerMessage.includes('paid') || lowerMessage.includes('purchased')) {
      return {
        type: 'add_expense',
        confidence: 0.7,
        reasoning: 'Fallback: Contains expense keywords',
        startConversation: true
      };
    }
    
    if (lowerMessage.includes('how much') || lowerMessage.includes('total') || lowerMessage.includes('biggest')) {
      return {
        type: 'analyze_expenses',
        confidence: 0.7,
        reasoning: 'Fallback: Contains analysis keywords'
      };
    }
    
    return {
      type: 'general',
      confidence: 0.5,
      reasoning: 'Fallback: Could not determine intent'
    };
  }
}