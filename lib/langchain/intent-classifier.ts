import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.1,
});

const INTENT_CLASSIFICATION_PROMPT = PromptTemplate.fromTemplate(`
Classify the user's intent from their message. Return ONLY a JSON object with this exact format:

{{
  "intent": "add_expense|show_expenses|edit_expense|delete_expense|analyze_spending|get_insights|general_question",
  "confidence": 0.95,
  "entities": {{
    "amount": null,
    "description": null,
    "category": null,
    "expenseNumber": null
  }},
  "reasoning": "Brief explanation"
}}

USER MESSAGE: "{userMessage}"

Examples:
- "I spent $15 on coffee" → add_expense
- "Show my recent expenses" → show_expenses  
- "Edit expense 3" → edit_expense
- "How much did I spend on food?" → analyze_spending
- "Delete the first expense" → delete_expense

Response (JSON only):
`);

export interface ClassifiedIntent {
  intent: 'add_expense' | 'show_expenses' | 'edit_expense' | 'delete_expense' | 'analyze_spending' | 'get_insights' | 'general_question';
  confidence: number;
  entities: {
    amount?: number;
    description?: string;
    category?: string;
    expenseNumber?: number;
  };
  reasoning: string;
}

export async function classifyIntent(userMessage: string): Promise<ClassifiedIntent> {
  try {
    const chain = RunnableSequence.from([
      INTENT_CLASSIFICATION_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    const response = await chain.invoke({ userMessage });
    
    // Parse JSON response
    const parsed = JSON.parse(response.trim());
    
    return {
      intent: parsed.intent,
      confidence: parsed.confidence,
      entities: parsed.entities || {},
      reasoning: parsed.reasoning
    };
  } catch (error) {
    console.error('Intent classification failed:', error);
    return {
      intent: 'general_question',
      confidence: 0.5,
      entities: {},
      reasoning: 'Failed to classify intent'
    };
  }
}