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
      // Continue expense conversation only if not starting a new intent
      const result = await handleExpenseConversation(user.id, conversationId || 'default', message);
      response = result.response;
      expenseAdded = result.expenseAdded ?? null;
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
      } else if (intent.response && intent.confidence > 0.8) {
        response = intent.response;
      } else {
        // Process the query and generate response
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

function extractSpendingParameters(message: string): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  
  // Extract time period
  if (message.includes('today')) params.timeframe = 'today';
  else if (message.includes('yesterday')) params.timeframe = 'yesterday';
  else if (message.includes('this week')) params.timeframe = 'week';
  else if (message.includes('this month')) params.timeframe = 'month';
  else if (message.includes('last month')) params.timeframe = 'last_month';
  
  // Extract category
  const categories = ['food', 'transportation', 'shopping', 'entertainment', 'bills', 'healthcare', 'other'];
  for (const category of categories) {
    if (message.includes(category)) {
      params.category = category;
      break;
    }
  }
  
  return params;
}

function extractCategoryParameters(message: string): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  
  const categories = ['food', 'transportation', 'shopping', 'entertainment', 'bills', 'healthcare', 'other'];
  for (const category of categories) {
    if (message.includes(category)) {
      params.category = category;
      break;
    }
  }
  
  return params;
}



async function generateExpenseResponse(userId: string, query: ExpenseQuery): Promise<string> {
  try {
    // Get user's expense data for context
    const recentExpenses = await db.record.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 20,
    });

    const totalSpending = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryTotals = recentExpenses.reduce((acc: Record<string, number>, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Create context for AI
    const expenseContext = {
      totalExpenses: recentExpenses.length,
      totalAmount: totalSpending,
      categories: categoryTotals,
      recentExpenses: recentExpenses.slice(0, 5).map(e => ({
        text: e.text,
        amount: e.amount,
        category: e.category,
        date: e.date.toISOString().split('T')[0]
      }))
    };

    // Use OpenAI for intelligent responses
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are SpendWise AI, a smart expense tracking assistant. You help users understand their spending patterns and provide personalized financial insights.
          
          User's current expense data:
          - Total expenses: ${expenseContext.totalExpenses} transactions
          - Total spending: $${expenseContext.totalAmount.toFixed(2)}
          - Category breakdown: ${Object.entries(expenseContext.categories).map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`).join(', ')}
          - Recent expenses: ${expenseContext.recentExpenses.map(e => `"${e.text}" $${e.amount} (${e.category}) on ${e.date}`).join('; ')}
          
          Guidelines:
          - Be conversational and helpful
          - Use emojis appropriately 💰📊📈
          - Provide specific insights based on their data
          - Suggest actionable financial tips
          - Keep responses concise but informative
          - If no expense data exists, encourage them to add expenses first`
        },
        {
          role: "user",
          content: String(query.parameters.originalMessage || `Tell me about my ${query.type}`)
        }
      ],
      max_tokens: 250,
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content || "I'm here to help with your expenses! Ask me anything about your spending patterns.";
  } catch (error) {
    console.error('Error generating AI response:', error);
    // Fallback to basic response
    return await generateBasicResponse(userId, query);
  }
}

async function generateBasicResponse(userId: string, query: ExpenseQuery): Promise<string> {
  switch (query.type) {
    case 'spending':
      return await handleSpendingQuery(userId, query.parameters);
    case 'category':
      return await handleCategoryQuery(userId, query.parameters);
    case 'analysis':
      return await handleAnalysisQuery(userId, query.parameters);
    default:
      return "I can help you analyze your spending! Try asking about your expenses, categories, or spending trends.";
  }
}

async function handleSpendingQuery(userId: string, params: Record<string, unknown>): Promise<string> {
  const timeframe = params.timeframe || 'month';
  const category = params.category;
  
  const whereClause: Record<string, unknown> = {
    userId: userId,
  };
  
  // Add date filter
  const now = new Date();
  switch (timeframe) {
    case 'today':
      whereClause.date = {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      };
      break;
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      whereClause.date = {
        gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
        lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      };
      break;
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);
      whereClause.date = { gte: weekStart };
      break;
    case 'month':
      whereClause.date = {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
      };
      break;
    case 'last_month':
      whereClause.date = {
        gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        lt: new Date(now.getFullYear(), now.getMonth(), 1),
      };
      break;
  }
  
  // Add category filter
  if (category) {
    whereClause.category = category;
  }
  
  const expenses = await db.record.findMany({
    where: whereClause,
    orderBy: { date: 'desc' },
    take: 10,
  });
  
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  if (expenses.length === 0) {
    return `You haven't spent anything ${timeframe === 'today' ? 'today' : `this ${timeframe}`}${category ? ` on ${category}` : ''}.`;
  }
  
  let response = `Here's your spending ${timeframe === 'today' ? 'today' : `this ${timeframe}`}${category ? ` on ${category}` : ''}:\n\n`;
  response += `💰 **Total: $${total.toFixed(2)}**\n\n`;
  
  if (expenses.length <= 5) {
    response += 'Recent expenses:\n';
    expenses.forEach((expense, index) => {
      response += `${index + 1}. ${expense.text} - $${expense.amount.toFixed(2)} (${expense.category})\n`;
    });
  } else {
    response += `You made ${expenses.length} transactions. Here are the most recent ones:\n`;
    expenses.slice(0, 3).forEach((expense, index) => {
      response += `${index + 1}. ${expense.text} - $${expense.amount.toFixed(2)} (${expense.category})\n`;
    });
    response += `\n... and ${expenses.length - 3} more transactions.`;
  }
  
  return response;
}

async function handleCategoryQuery(userId: string, params: Record<string, unknown>): Promise<string> {
  const category = params.category;
  
  if (!category) {
    // Get all categories with totals
    const categoryTotals = await db.record.groupBy({
      by: ['category'],
      where: { userId },
      _sum: { amount: true },
      _count: { id: true },
    });
    
    let response = 'Here are your spending categories:\n\n';
    categoryTotals.forEach((cat) => {
      response += `📊 **${cat.category}**: $${cat._sum.amount?.toFixed(2) || '0.00'} (${cat._count.id} transactions)\n`;
    });
    
    return response;
  }
  
  // Get expenses for specific category
  const expenses = await db.record.findMany({
    where: { userId, category },
    orderBy: { date: 'desc' },
    take: 10,
  });
  
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  if (expenses.length === 0) {
    return `You haven't spent anything on ${category} yet.`;
  }
  
  let response = `Here's your ${category} spending:\n\n`;
  response += `💰 **Total: $${total.toFixed(2)}** (${expenses.length} transactions)\n\n`;
  
  response += 'Recent expenses:\n';
  expenses.slice(0, 5).forEach((expense, index) => {
    response += `${index + 1}. ${expense.text} - $${expense.amount.toFixed(2)} (${expense.date.toLocaleDateString()})\n`;
  });
  
  return response;
}



async function handleAnalysisQuery(userId: string, _params: Record<string, unknown>): Promise<string> {
  try {
    // Get comprehensive expense data
    const allExpenses = await db.record.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    if (allExpenses.length === 0) {
      return "I don't have any expense data to analyze yet. Start adding some expenses and I'll provide detailed insights!";
    }

    const total = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const average = total / allExpenses.length;
    
    // Get category breakdown
    const categoryTotals = allExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];

    // Get recent vs older spending
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeekExpenses = allExpenses.filter(e => e.date >= lastWeek);
    const thisMonthExpenses = allExpenses.filter(e => e.date >= lastMonth);

    const weekTotal = thisWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const analysis = [
      "📊 **Your Expense Analysis:**",
      "",
      `💰 **Total Spending:** $${total.toFixed(2)} across ${allExpenses.length} transactions`,
      `📈 **Average per Transaction:** $${average.toFixed(2)}`,
      "",
      "🏆 **Top Spending Category:**",
      `• ${topCategory[0]}: $${topCategory[1].toFixed(2)}`,
      "",
      "📅 **Recent Activity:**",
      `• This Week: $${weekTotal.toFixed(2)} (${thisWeekExpenses.length} transactions)`,
      `• This Month: $${monthTotal.toFixed(2)} (${thisMonthExpenses.length} transactions)`,
      "",
      "💡 **Insights:**"
    ];

    // Add insights based on data
    if (average > 50) {
      analysis.push("• Your average transaction is quite high - consider reviewing larger purchases");
    }
    
    if (topCategory[1] / total > 0.4) {
      analysis.push(`• You spend ${((topCategory[1] / total) * 100).toFixed(1)}% on ${topCategory[0]} - this might be your main expense category`);
    }

    if (thisWeekExpenses.length > 10) {
      analysis.push("• You've been quite active this week with many transactions");
    }

    analysis.push("", "Ask me for more specific analysis like trends, category breakdowns, or spending patterns! 😊");

    return analysis.join('\n');
  } catch (error) {
    console.error('Error in analysis query:', error);
    return "I'm having trouble analyzing your expenses right now. Please try again later.";
  }
}

