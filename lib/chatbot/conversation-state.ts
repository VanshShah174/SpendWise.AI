import { cacheSet, cacheGet } from '../cache/cache';

export interface ExpenseConversationState {
  step: 'description' | 'amount' | 'category' | 'date' | 'confirmation';
  data: {
    description?: string;
    amount?: number;
    category?: string;
    date?: string;
  };
  timestamp: Date;
  userId: string;
}

export interface EditConversationState {
  expenseId: string;
  originalExpense: {
    text: string;
    amount: number;
    category: string;
    date: string;
  };
  timestamp: Date;
  userId: string;
}

const CONVERSATION_TTL = 1800; // 30 minutes

export async function getConversationState(userId: string, conversationId: string): Promise<ExpenseConversationState | null> {
  const key = `expense_conversation:${userId}:${conversationId}`;
  return await cacheGet(key) as ExpenseConversationState | null;
}

export async function setConversationState(userId: string, conversationId: string, state: ExpenseConversationState): Promise<void> {
  const key = `expense_conversation:${userId}:${conversationId}`;
  await cacheSet(key, state, CONVERSATION_TTL);
}

export async function clearConversationState(userId: string, conversationId: string): Promise<void> {
  const key = `expense_conversation:${userId}:${conversationId}`;
  await cacheSet(key, null, 1);
}

export async function getEditState(userId: string, conversationId: string): Promise<EditConversationState | null> {
  const key = `edit_conversation:${userId}:${conversationId}`;
  return await cacheGet(key) as EditConversationState | null;
}

export async function setEditState(userId: string, conversationId: string, state: EditConversationState): Promise<void> {
  const key = `edit_conversation:${userId}:${conversationId}`;
  await cacheSet(key, state, CONVERSATION_TTL);
}

export async function clearEditState(userId: string, conversationId: string): Promise<void> {
  const key = `edit_conversation:${userId}:${conversationId}`;
  await cacheSet(key, null, 1);
}

export function parseAmount(input: string): number | null {
  const cleanInput = input.replace(/[^\d.,]/g, '');
  const amount = parseFloat(cleanInput);
  return isNaN(amount) ? null : amount;
}

export function parseDate(input: string): string {
  const lowerInput = input.toLowerCase().trim();
  
  // Get current date in local timezone
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based
  const currentDay = now.getDate();
  
  if (lowerInput.includes('today')) {
    const year = currentYear;
    const month = String(currentMonth + 1).padStart(2, '0');
    const day = String(currentDay).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  if (lowerInput.includes('yesterday')) {
    const yesterday = new Date(currentYear, currentMonth, currentDay - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Try to parse date formats
  const dateMatch = input.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}-\d{1,2}-\d{4})/);
  if (dateMatch) {
    const dateStr = dateMatch[0];
    let year, month, day;
    
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      month = parseInt(parts[0]);
      day = parseInt(parts[1]);
      year = parseInt(parts[2]);
    } else {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
      } else {
        month = parseInt(parts[0]);
        day = parseInt(parts[1]);
        year = parseInt(parts[2]);
      }
    }
    
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  // Default to today
  const year = currentYear;
  const month = String(currentMonth + 1).padStart(2, '0');
  const day = String(currentDay).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseCategory(input: string): string {
  const lowerInput = input.toLowerCase().trim();
  const categories = ['food', 'transportation', 'shopping', 'entertainment', 'bills', 'healthcare', 'other'];
  
  for (const category of categories) {
    if (lowerInput.includes(category)) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }
  
  if (lowerInput === 'yes' || lowerInput === 'y') {
    return 'suggested'; // Will be handled by caller
  }
  
  return 'Other';
}