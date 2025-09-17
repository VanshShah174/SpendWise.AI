import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getConversation, cacheConversation } from '@/lib/cache/redis';
import { detectUserIntent } from '@/lib/chatbot/intent-detector';
import { handleExpenseConversation } from '@/lib/chatbot/expense-conversation';
import { getConversationState, getEditState, clearEditState, clearConversationState } from '@/lib/chatbot/conversation-state';
import { handleShowExpenses, handleDeleteExpense, handleEditExpense, handleModifyExpenses } from '@/lib/chatbot/expense-list-handler';
import { handleEditConversation, startEditConversation } from '@/lib/chatbot/edit-conversation';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ExpenseQuery {
  type: 'greeting' | 'help' | 'spending' | 'category' | 'date' | 'amount' | 'trend' | 'budget' | 'analysis' | 'general';
  parameters: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationId } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get conversation history from cache
    const cacheKey = `conversation:${user.id}:${conversationId || 'default'}`;
    const conversationHistory: ChatMessage[] = ((await getConversation(cacheKey)) as unknown as ChatMessage[]) || [];

    // Add user message to history
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    conversationHistory.push(userMessage);

    // Check intent first for new conversations
    const intent = detectUserIntent(message);
    let response: string;
    let expenseAdded: Record<string, unknown> | null = null;
    
    // Check if user is in an expense or edit conversation
    const expenseState = await getConversationState(user.id, conversationId || 'default');
    const editState = await getEditState(user.id, conversationId || 'default');
    
    if (expenseState && !intent.startConversation) {
      // Continue expense conversation unless it's a clear analysis question
      const isAnalysisQuestion = message.toLowerCase().includes('biggest') || 
                                message.toLowerCase().includes('category') ||
                                message.toLowerCase().includes('how much') ||
                                message.toLowerCase().includes('show me') ||
                                message.toLowerCase().includes('analyze');
      
      if (!isAnalysisQuestion) {
        const result = await handleExpenseConversation(user.id, conversationId || 'default', message);
        response = result.response;
        expenseAdded = result.expenseAdded ?? null;
      } else {
        // Clear state for analysis questions
        await clearConversationState(user.id, conversationId || 'default');
        const query = parseExpenseQuery(message);
        response = await generateExpenseResponse(user.id, query);
      }
    } else if (editState && intent.type !== 'modify_expense' && intent.type !== 'show_expenses') {
      // Handle edit conversation only if not starting a new intent
      if (intent.type === 'change_field' && intent.field && intent.newValue) {
        const result = await handleEditConversation(user.id, conversationId || 'default', intent.field, intent.newValue);
        response = result.response;
        if (result.updated) {
          expenseAdded = { updated: true };
        }
      } else if (message.toLowerCase().includes('cancel')) {
        await clearEditState(user.id, conversationId || 'default');
        response = "Edit cancelled. Feel free to ask me anything else! 😊";
      } else {
        response = "Please specify what you'd like to change:\n• 'change description to [new description]'\n• 'change amount to [new amount]'\n• 'change category to [new category]'\n\nOr type 'cancel' to stop editing.";
      }
    } else {
      // Handle new intents (clear any existing state if starting new conversation)
      if (intent.startConversation) {
        await clearConversationState(user.id, conversationId || 'default');
        await clearEditState(user.id, conversationId || 'default');
      }
      
      if (intent.startConversation && intent.type === 'add_expense') {
        // Start expense conversation
        const result = await handleExpenseConversation(user.id, conversationId || 'default', message);
        response = result.response;
      } else if (intent.type === 'show_expenses') {
        // Show recent expenses
        response = await handleShowExpenses();
      } else if (intent.type === 'modify_expense') {
        // Show expenses with edit/delete options
        response = await handleModifyExpenses();
      } else if (intent.type === 'edit_expense' && intent.expenseNumber) {
        // Start edit conversation
        const result = await handleEditExpense(user.id, intent.expenseNumber);
        response = result.response;
        if (result.expense) {
          await startEditConversation(user.id, conversationId || 'default', result.expense as { id: string; text: string; amount: number; category: string; date: Date });
        }
      } else if (intent.type === 'delete_expense' && intent.expenseNumber) {
        // Delete specific expense
        const result = await handleDeleteExpense(user.id, intent.expenseNumber);
        response = result.response;
        if (result.deleted) {
          expenseAdded = { deleted: true }; // Trigger UI refresh
        }
      } else {
        // For all other questions, use AI
        const query = parseExpenseQuery(message);
        response = await generateExpenseResponse(user.id, query);
      }
    }

    // Add assistant response to history
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    conversationHistory.push(assistantMessage);

    // Store updated conversation history in cache
    await cacheConversation(cacheKey, conversationHistory as unknown as Record<string, unknown>[]);

    return NextResponse.json({
      response,
      conversationId: conversationId || 'default',
      timestamp: assistantMessage.timestamp,
      expenseAdded: expenseAdded || null,
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function parseExpenseQuery(message: string): ExpenseQuery {
  const lowerMessage = message.toLowerCase();
  
  // Check for show/view queries first (highest priority)
  if (lowerMessage.includes('show') || lowerMessage.includes('recent') || 
      lowerMessage.includes('my expenses') || lowerMessage.includes('biggest') ||
      lowerMessage.includes('what') || lowerMessage.includes('how much')) {
    return {
      type: 'analysis',
      parameters: { originalMessage: message },
    };
  }
  
  // Analysis queries
  if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis') ||
      lowerMessage.includes('insight') || lowerMessage.includes('insights') ||
      lowerMessage.includes('summary') || lowerMessage.includes('overview')) {
    return {
      type: 'analysis',
      parameters: { originalMessage: message },
    };
  }
  
  // Category queries
  if (lowerMessage.includes('category') || lowerMessage.includes('categories')) {
    return {
      type: 'category',
      parameters: { originalMessage: message },
    };
  }
  
  // Spending queries
  if (lowerMessage.includes('spent') || lowerMessage.includes('spending')) {
    return {
      type: 'spending',
      parameters: { originalMessage: message },
    };
  }
  
  // General queries (let AI handle everything else)
  return {
    type: 'general',
    parameters: { originalMessage: message },
  };
}

async function generateExpenseResponse(userId: string, query: ExpenseQuery): Promise<string> {
  try {
    const expenses = await db.record.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    // Check if this is the specific "biggest spending category" question
    const originalMessage = (query.parameters.originalMessage as string).toLowerCase();
    if (originalMessage.includes('biggest') && originalMessage.includes('category')) {
      // Calculate category totals directly
      const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);
      
      if (Object.keys(categoryTotals).length === 0) {
        return "📊 You don't have any expenses recorded yet! Add some expenses to see your spending categories.";
      }
      
      const biggestCategory = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)[0];
      
      const [category, total] = biggestCategory;
      const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
      const percentage = ((total / totalExpenses) * 100).toFixed(1);
      
      return `📊 **Your Biggest Spending Category:**\n\n🏷️ **${category}**: $${total.toFixed(2)}\n📈 That's ${percentage}% of your total spending!\n\n💰 **Total Expenses**: $${totalExpenses.toFixed(2)}`;
    }

    // Format expenses with proper date formatting and ensure amounts are properly formatted
    const formattedExpenses = expenses.map(e => ({
      text: e.text,
      amount: parseFloat(e.amount.toFixed(2)), // Ensure proper decimal formatting
      category: e.category,
      date: e.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful financial assistant. Analyze the user's expenses and provide insights. Keep responses concise and friendly. Use emojis appropriately. When calculating totals or analyzing spending by category, be PRECISE with the numbers - use the exact amounts from the data without rounding or approximating. Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}.`,
        },
        {
          role: 'user',
          content: `User question: "${query.parameters.originalMessage}"

IMPORTANT: Calculate category totals by summing the exact amounts shown. Do not add decimals where none exist.

Expense data: ${JSON.stringify(formattedExpenses, null, 2)}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t analyze your expenses right now. Please try again.';
  } catch (error) {
    console.error('Error generating expense response:', error);
    return 'I\'m having trouble analyzing your expenses right now. Please try again later.';
  }
}