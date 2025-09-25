import { generateSmartExpenseResponse } from '@/lib/langchain/smart-chatbot';
import { classifyIntent, ClassifiedIntent } from '@/lib/langchain/intent-classifier';
import { analyzeExpenses } from '@/lib/langchain/expense-analyzer';
import { SmartIntent } from './smart-intent-detector';

export async function generateContextualResponse(
  userMessage: string, 
  userId: string, 
  smartIntent?: SmartIntent
): Promise<string> {
  try {
    // Use Langchain for intent classification
    const classifiedIntent: ClassifiedIntent = await classifyIntent(userMessage);
    
    // Route to appropriate handler based on intent
    switch (classifiedIntent.intent) {
      case 'analyze_spending':
      case 'get_insights':
        return await analyzeExpenses(userMessage);
      
      case 'add_expense':
      case 'show_expenses':
      case 'general_question':
      default:
        return await generateSmartExpenseResponse(userMessage, userId);
    }

  } catch (error) {
    console.error('Contextual response generation failed:', error);
    // Fallback to basic smart response
    try {
      return await generateSmartExpenseResponse(userMessage, userId);
    } catch (fallbackError) {
      console.error('Fallback response failed:', fallbackError);
      return 'I understand you want to manage your expenses. How can I help you today?';
    }
  }
}