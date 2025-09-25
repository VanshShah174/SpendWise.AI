import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

import { getConversation, cacheConversation } from '@/lib/cache/redis';
import { detectUserIntent } from '@/lib/chatbot/intent-detector';
import { detectSmartIntent } from '@/lib/chatbot/smart-intent-detector';
import { generateContextualResponse } from '@/lib/chatbot/smart-response-generator';
import { handleExpenseConversation } from '@/lib/chatbot/expense-conversation';
import { getConversationState, getEditState, clearEditState, clearConversationState } from '@/lib/chatbot/conversation-state';
import { handleShowExpenses, handleDeleteExpense, handleEditExpense, handleModifyExpenses } from '@/lib/chatbot/expense-list-handler';
import { handleEditConversation, startEditConversation } from '@/lib/chatbot/edit-conversation';
import { handleSmartDelete, handleSmartEdit } from '@/lib/chatbot/smart-operations';
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

    // Use AI-powered intent detection with RAG context
    const smartIntent = await detectSmartIntent(message, user.id);
    // console.log('🧠 Smart Intent:', smartIntent);
    
    // Fallback to pattern-based detection if needed
    const intent = detectUserIntent(message);
    let response: string;
    let expenseAdded: Record<string, unknown> | null = null;
    
    // Check if user is in an expense or edit conversation
    const expenseState = await getConversationState(user.id, conversationId || 'default');
    const editState = await getEditState(user.id, conversationId || 'default');
    
    // Check for smart operation confirmations
    const smartDeleteKey = `smart_delete:${user.id}:${conversationId || 'default'}`;
    const smartEditKey = `smart_edit:${user.id}:${conversationId || 'default'}`;
    const smartEditFieldKey = `smart_edit_field:${user.id}:${conversationId || 'default'}`;
    const pendingDelete = await getConversation(smartDeleteKey);
    const pendingEdit = await getConversation(smartEditKey);
    const pendingEditField = await getConversation(smartEditFieldKey);
    
    interface ExpenseRecord {
      id: string;
      text: string;
      amount: number;
      category: string;
      date: Date | string;
    }

    // Handle smart operation confirmations first
    if (pendingDelete && (message.toLowerCase().trim() === 'yes' || message.toLowerCase().trim() === 'y')) {
      const expenses = pendingDelete as ExpenseRecord[];
      if (expenses.length === 1) {
        const { confirmDelete } = await import('@/lib/chatbot/smart-operations');
        const result = await confirmDelete(expenses[0].id);
        response = result.response;
        if (result.success) {
          expenseAdded = { deleted: true };
        }
      } else {
        response = "❌ Unable to process deletion. Please try again.";
      }
      await cacheConversation(smartDeleteKey, null); // Clear pending state
    } else if (pendingDelete && (message.toLowerCase().trim() === 'no' || message.toLowerCase().trim() === 'n')) {
      response = "❌ **Deletion cancelled.** Your expense is safe! 😊";
      await cacheConversation(smartDeleteKey, null); // Clear pending state
    } else if (pendingDelete && /^\d+$/.test(message.trim())) {
      // Handle selection of specific expense to delete
      const expenses = pendingDelete as ExpenseRecord[];
      const index = parseInt(message.trim()) - 1;
      if (index >= 0 && index < expenses.length) {
        const { confirmDelete } = await import('@/lib/chatbot/smart-operations');
        const result = await confirmDelete(expenses[index].id);
        response = result.response;
        if (result.success) {
          expenseAdded = { deleted: true };
        }
      } else {
        response = `❌ Invalid selection. Please choose a number between 1 and ${expenses.length}.`;
      }
      await cacheConversation(smartDeleteKey, null); // Clear pending state
    } else if (pendingDelete && message.toLowerCase().trim() === 'all') {
      // Delete all expenses
      const expenses = pendingDelete as ExpenseRecord[];
      let deletedCount = 0;
      const { confirmDelete } = await import('@/lib/chatbot/smart-operations');
      
      for (const expense of expenses) {
        const result = await confirmDelete(expense.id);
        if (result.success) deletedCount++;
      }
      
      response = `✅ **${deletedCount} expense(s) deleted successfully!** 🗑️\n\nYour dashboard will update automatically.`;
      expenseAdded = { deleted: true };
      await cacheConversation(smartDeleteKey, null); // Clear pending state
    } else if (pendingEdit && ['amount', 'description', 'category'].includes(message.toLowerCase().trim())) {
      // Handle smart edit field selection
      const expenses = pendingEdit as ExpenseRecord[];
      if (expenses.length === 1) {
        const expense = expenses[0];
        const field = message.toLowerCase().trim();
        const currentValue = field === 'amount' ? `$${expense.amount.toFixed(2)}` : 
                             field === 'description' ? expense.text : 
                             field === 'category' ? expense.category : '';
        response = `✏️ **Editing ${field} for:**\n\n📝 ${expense.text} - $${expense.amount.toFixed(2)}\n\n💡 **Current ${field}:** ${currentValue}\n\n❓ **What should the new ${field} be?**`;
        // Store the selected field for next step
        await cacheConversation(`smart_edit_field:${user.id}:${conversationId || 'default'}`, [{ expense, field }]);
      } else {
        response = "❌ Unable to process edit. Please try again.";
      }
      await cacheConversation(smartEditKey, null); // Clear pending state
    } else if (pendingEdit && /^\d+$/.test(message.trim())) {
      // Handle selection of specific expense to edit
      const expenses = pendingEdit as ExpenseRecord[];
      const index = parseInt(message.trim()) - 1;
      if (index >= 0 && index < expenses.length) {
        const expense = expenses[index];
        const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        response = `✏️ **Selected expense to edit:**\n\n📅 **Date:** ${formattedDate}\n💰 **Amount:** $${expense.amount.toFixed(2)}\n📝 **Description:** ${expense.text}\n🏷️ **Category:** ${expense.category}\n\n❓ **What would you like to edit?**\n\nType:\n• **"amount"** to change the amount\n• **"description"** to change the description\n• **"category"** to change the category`;
        // Store selected expense for field selection
        await cacheConversation(smartEditKey, [expense]);
      } else {
        response = `❌ Invalid selection. Please choose a number between 1 and ${expenses.length}.`;
        await cacheConversation(smartEditKey, null);
      }
    } else if (pendingEditField) {
      // Handle smart edit field value update
      const [{ expense, field }] = pendingEditField as [{ expense: ExpenseRecord; field: string }];
      const { handleEditConversation, startEditConversation } = await import('@/lib/chatbot/edit-conversation');
      
      // Set up edit state first
      await startEditConversation(user.id, conversationId || 'default', {
        id: expense.id,
        text: expense.text,
        amount: expense.amount,
        category: expense.category,
        date: new Date(expense.date)
      });
      
      // Then handle the field update
      const result = await handleEditConversation(user.id, conversationId || 'default', field, message);
      response = result.response;
      if (result.updated) {
        expenseAdded = { updated: true };
      }
      await cacheConversation(smartEditFieldKey, null); // Clear pending state
    } else if (expenseState && !intent.startConversation) {
      // Continue expense conversation unless it's a clear analysis/advice question
      const isAnalysisQuestion = message.toLowerCase().includes('biggest') || 
                                message.toLowerCase().includes('category') ||
                                message.toLowerCase().includes('how much') ||
                                message.toLowerCase().includes('show me') ||
                                message.toLowerCase().includes('analyze') ||
                                message.toLowerCase().includes('budget tips') ||
                                message.toLowerCase().includes('advice') ||
                                message.toLowerCase().includes('help') ||
                                intent.type === 'general_advice';
      
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
      
      if (intent.type === 'general_advice' || smartIntent.type === 'general') {
        // Handle general advice questions
        if (smartIntent.confidence > 0.6) {
          response = await generateContextualResponse(message, user.id, smartIntent);
        } else {
          const query = parseExpenseQuery(message);
          response = await generateExpenseResponse(user.id, query);
        }
      } else if ((intent.startConversation && intent.type === 'add_expense') || 
          (smartIntent.type === 'add_expense' && smartIntent.confidence > 0.7)) {
        // Start expense conversation using smart intent
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
      } else if (intent.type === 'smart_delete') {
        // Handle smart delete
        const result = await handleSmartDelete(user.id, message);
        response = result.response;
        // Store found expenses in conversation state for confirmation
        if (result.foundExpenses && result.confirmationNeeded) {
          await cacheConversation(`smart_delete:${user.id}:${conversationId || 'default'}`, result.foundExpenses);
        }
      } else if (intent.type === 'smart_edit') {
        // Handle smart edit
        const result = await handleSmartEdit(user.id, message);
        response = result.response;
        // Store found expenses in conversation state for confirmation
        if (result.foundExpenses && result.confirmationNeeded) {
          await cacheConversation(`smart_edit:${user.id}:${conversationId || 'default'}`, result.foundExpenses);
        }
      } else {
        // Use smart RAG-powered response for ALL questions including expense analysis
        if (smartIntent.confidence > 0.6) {
          response = await generateContextualResponse(message, user.id, smartIntent);
        } else {
          // Use RAG for expense analysis too
          response = await generateContextualResponse(message, user.id, { type: 'analyze_expenses', confidence: 0.8, reasoning: 'Expense analysis query' });
        }
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
  
  // Budget/advice queries (highest priority)
  if (lowerMessage.includes('budget tips') || lowerMessage.includes('budget advice') ||
      lowerMessage.includes('save money') || lowerMessage.includes('financial advice') ||
      lowerMessage.includes('money tips') || lowerMessage.includes('reduce expenses')) {
    return {
      type: 'budget',
      parameters: { originalMessage: message },
    };
  }
  
  // Check for show/view queries
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
    const originalMessage = (query.parameters.originalMessage as string).toLowerCase();
    
    // Parse date filters from the message
    const dateFilter = parseDateFromMessage(originalMessage);
    
    // For "this month" queries, ensure we get the correct date range
    const whereClause: { userId: string; date?: { gte: Date; lte: Date } } = { userId };
    
    if (originalMessage.includes('this month')) {
      // Force current month calculation
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      whereClause.date = { gte: start, lte: end };
      // console.log('📅 Forced this month filter:', { start, end, currentMonth: now.getMonth() + 1 });
    } else if (dateFilter.start && dateFilter.end) {
      whereClause.date = {
        gte: dateFilter.start,
        lte: dateFilter.end
      };
      // console.log('📅 Date filter applied:', { dateFilter });
    }
    
    // Use the proper getRecords action to ensure user authentication
    const { records: allRecords, error: recordsError } = await (await import('@/app/actions/getRecords')).default();
    
    if (recordsError || !allRecords) {
      return `❌ Sorry, I couldn't fetch your expenses right now. Please try again later.`;
    }
    
    // Apply date filtering to the user's records
    let expenses = allRecords;
    if (whereClause.date) {
      expenses = allRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= whereClause.date!.gte && recordDate <= whereClause.date!.lte;
      });
    }
    
    // console.log('📊 Query result:', {
    //   totalExpenses: expenses.length,
    //   totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
    //   dateRange: whereClause.date,
    //   expenseDetails: expenses.map(e => ({ text: e.text, amount: e.amount, date: e.date }))
    // });

    // Calculate totals first
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Handle budget advice requests
    if (query.type === 'budget') {
      return `💡 **Smart Budget Tips:**\n\n• **Track Every Expense**: Use this app to monitor all spending\n• **50/30/20 Rule**: 50% needs, 30% wants, 20% savings\n• **Review Monthly**: Check your spending patterns regularly\n• **Set Category Limits**: Budget for each expense category\n• **Emergency Fund**: Save 3-6 months of expenses\n• **Automate Savings**: Set up automatic transfers\n\n💰 **Based on your data**: You've spent $${totalAmount.toFixed(2)} recently. Consider reviewing your biggest categories for potential savings!`;
    }
    
    // Check if this is the specific "biggest spending category" question
    if (originalMessage.includes('biggest') && originalMessage.includes('category')) {
      // Calculate category totals directly
      const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);
      
      if (Object.keys(categoryTotals).length === 0) {
        const timeFrame = dateFilter.description || 'the specified period';
        return `📊 You don't have any expenses recorded for ${timeFrame}! Add some expenses to see your spending categories.`;
      }
      
      const biggestCategory = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)[0];
      
      const [category, total] = biggestCategory;
      const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
      const percentage = ((total / totalExpenses) * 100).toFixed(1);
      const timeFrame = dateFilter.description || 'overall';
      
      return `📊 **Your Biggest Spending Category ${timeFrame}:**\n\n🏷️ **${category}**: $${total.toFixed(2)}\n📈 That's ${percentage}% of your total spending!\n\n💰 **Total Expenses**: $${totalExpenses.toFixed(2)}`;
    }

    // Calculate category breakdown for direct responses
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Format expenses with proper date formatting
    const formattedExpenses = expenses.map(e => ({
      text: e.text,
      amount: parseFloat(e.amount.toFixed(2)),
      category: e.category,
      date: new Date(e.date).toLocaleDateString('en-US', {
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
          content: `You are a helpful financial assistant. Analyze the user's expenses and provide insights. Keep responses concise and friendly. Use emojis appropriately. \n\nFor budget advice questions, provide practical money-saving tips and budgeting strategies.\n\nCRITICAL: When providing spending breakdowns, SHOW ALL EXPENSES provided in the data. Do not truncate or limit the list. The total spending is $${totalAmount.toFixed(2)} and category breakdown is: ${JSON.stringify(categoryTotals)}. \n\nToday's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}.`,
        },
        {
          role: 'user',
          content: `User question: "${query.parameters.originalMessage}"\n\nTotal amount: $${totalAmount.toFixed(2)}\nCategory breakdown: ${JSON.stringify(categoryTotals)}\n${dateFilter.description ? `Time period: ${dateFilter.description}` : ''}\n\nExpense details: ${JSON.stringify(formattedExpenses, null, 2)}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t analyze your expenses right now. Please try again.';
  } catch (error) {
    console.error('Error generating expense response:', error);
    return 'I\'m having trouble analyzing your expenses right now. Please try again later.';
  }
}

function parseDateFromMessage(message: string): { start?: Date; end?: Date; description?: string } {
  const currentYear = new Date().getFullYear();
  const lowerMessage = message.toLowerCase();
  
  // Month patterns
  const monthPatterns = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sep: 8, sept: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11
  };
  
  // Check for specific months
  for (const [monthName, monthIndex] of Object.entries(monthPatterns)) {
    if (lowerMessage.includes(monthName)) {
      const start = new Date(currentYear, monthIndex, 1);
      const end = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59);
      return { 
        start, 
        end, 
        description: `in ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${currentYear}` 
      };
    }
  }
  
  // Check for "this month" - should be highest priority
  if (lowerMessage.includes('this month')) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    // console.log('📅 This month filter:', { start, end, currentMonth: now.getMonth() });
    return { 
      start, 
      end, 
      description: 'this month' 
    };
  }
  
  // Check for current month without "this month" phrase
  if (!lowerMessage.includes('last') && !lowerMessage.includes('previous')) {
    const now = new Date();
    const currentMonthName = Object.keys(monthPatterns).find(name => 
      monthPatterns[name as keyof typeof monthPatterns] === now.getMonth()
    );
    
    if (currentMonthName && lowerMessage.includes(currentMonthName)) {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      // console.log('📅 Current month by name filter:', { start, end, month: currentMonthName });
      return { 
        start, 
        end, 
        description: `this month (${currentMonthName})` 
      };
    }
  }
  
  // Check for "last month"
  if (lowerMessage.includes('last month')) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    return { 
      start, 
      end, 
      description: 'last month' 
    };
  }
  
  return {};
}