import { db } from '@/lib/db';
import deleteRecord from '@/app/actions/deleteRecord';

export interface SmartOperationState {
  operation: 'delete' | 'edit';
  expenseId: string;
  expenseData: {
    text: string;
    amount: number;
    category: string;
    date: string;
  };
  timestamp: Date;
  userId: string;
}

interface ExpenseRecord {
  id: string;
  text: string;
  amount: number;
  category: string;
  date: Date | string;
}

export async function handleSmartDelete(
  userId: string,
  message: string
): Promise<{ response: string; foundExpenses?: ExpenseRecord[]; confirmationNeeded?: boolean }> {
  
  // Extract date from message
  const datePatterns = [
    /on\s+(.+?)(?:\s+and|\s*$)/i,
    /from\s+(.+?)(?:\s+and|\s*$)/i,
    /spent\s+on\s+(.+?)(?:\s+and|\s*$)/i,
  ];
  
  let dateStr = '';
  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match) {
      dateStr = match[1].trim();
      break;
    }
  }
  
  if (!dateStr) {
    return {
      response: "I couldn't find a specific date in your message. Please specify the date like 'delete expense from today' or 'delete expense on July 4th'."
    };
  }
  
  try {
    // Get all user expenses first
    const allExpenses = await db.record.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' }
    });
    
    if (allExpenses.length === 0) {
      return {
        response: "❌ You don't have any expenses recorded yet."
      };
    }
    
    // Smart date matching - look for expenses that match the date description
    const matchingExpenses = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseDateStr = expenseDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).toLowerCase();
      
      // Check various date formats
      const day = expenseDate.getDate();
      const month = expenseDate.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
      const shortMonth = expenseDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
      
      const lowerDateStr = dateStr.toLowerCase();
      
      // Match patterns like "1st august", "august 1", "aug 1", etc.
      return (
        lowerDateStr.includes(`${day}st ${month}`) ||
        lowerDateStr.includes(`${day}nd ${month}`) ||
        lowerDateStr.includes(`${day}rd ${month}`) ||
        lowerDateStr.includes(`${day}th ${month}`) ||
        lowerDateStr.includes(`${day} ${month}`) ||
        lowerDateStr.includes(`${month} ${day}`) ||
        lowerDateStr.includes(`${day}st ${shortMonth}`) ||
        lowerDateStr.includes(`${day}nd ${shortMonth}`) ||
        lowerDateStr.includes(`${day}rd ${shortMonth}`) ||
        lowerDateStr.includes(`${day}th ${shortMonth}`) ||
        lowerDateStr.includes(`${day} ${shortMonth}`) ||
        lowerDateStr.includes(`${shortMonth} ${day}`) ||
        expenseDateStr.includes(lowerDateStr)
      );
    });
    
    const expenses = matchingExpenses;
    
    if (expenses.length === 0) {
      return {
        response: `❌ No expenses found matching "${dateStr}". Please check the date and try again.`
      };
    }
    
    if (expenses.length === 1) {
      const expense = expenses[0];
      const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return {
        response: `🗑️ **Found expense to delete:**\n\n📅 **Date:** ${formattedDate}\n💰 **Amount:** $${expense.amount.toFixed(2)}\n📝 **Description:** ${expense.text}\n🏷️ **Category:** ${expense.category}\n\n❓ **Are you sure you want to delete this expense?**\n\nType **"yes"** to confirm deletion or **"no"** to cancel.`,
        foundExpenses: [expense],
        confirmationNeeded: true
      };
    }
    
    // Multiple expenses found
    const formattedDate = expenses.length > 0 ? new Date(expenses[0].date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'the specified date';
    
    const expenseList = expenses.map((exp, index) => 
      `${index + 1}. $${exp.amount.toFixed(2)} - ${exp.text} (${exp.category})`
    ).join('\n');
    
    return {
      response: `🗑️ **Found ${expenses.length} expenses on ${formattedDate}:**\n\n${expenseList}\n\n❓ **Which expense would you like to delete?**\n\nType the number (1-${expenses.length}) or **"all"** to delete all expenses from this date.`,
      foundExpenses: expenses,
      confirmationNeeded: true
    };
    
  } catch (error) {
    console.error('Error finding expenses:', error);
    return {
      response: "❌ Sorry, I encountered an error while searching for expenses. Please try again."
    };
  }
}

export async function handleSmartEdit(
  userId: string,
  message: string
): Promise<{ response: string; foundExpenses?: ExpenseRecord[]; confirmationNeeded?: boolean }> {
  
  // Extract date from message
  const datePatterns = [
    /on\s+(.+?)(?:\s+and|\s*$)/i,
    /from\s+(.+?)(?:\s+and|\s*$)/i,
    /spent\s+on\s+(.+?)(?:\s+and|\s*$)/i,
  ];
  
  let dateStr = '';
  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match) {
      dateStr = match[1].trim();
      break;
    }
  }
  
  if (!dateStr) {
    return {
      response: "I couldn't find a specific date in your message. Please specify the date like 'edit expense from today' or 'edit expense on July 4th'."
    };
  }
  
  try {
    // Get all user expenses first
    const allExpenses = await db.record.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' }
    });
    
    if (allExpenses.length === 0) {
      return {
        response: "❌ You don't have any expenses recorded yet."
      };
    }
    
    // Smart date matching - look for expenses that match the date description
    const matchingExpenses = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseDateStr = expenseDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).toLowerCase();
      
      // Check various date formats
      const day = expenseDate.getDate();
      const month = expenseDate.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
      const shortMonth = expenseDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
      
      const lowerDateStr = dateStr.toLowerCase();
      
      // Match patterns like "1st august", "august 1", "aug 1", etc.
      return (
        lowerDateStr.includes(`${day}st ${month}`) ||
        lowerDateStr.includes(`${day}nd ${month}`) ||
        lowerDateStr.includes(`${day}rd ${month}`) ||
        lowerDateStr.includes(`${day}th ${month}`) ||
        lowerDateStr.includes(`${day} ${month}`) ||
        lowerDateStr.includes(`${month} ${day}`) ||
        lowerDateStr.includes(`${day}st ${shortMonth}`) ||
        lowerDateStr.includes(`${day}nd ${shortMonth}`) ||
        lowerDateStr.includes(`${day}rd ${shortMonth}`) ||
        lowerDateStr.includes(`${day}th ${shortMonth}`) ||
        lowerDateStr.includes(`${day} ${shortMonth}`) ||
        lowerDateStr.includes(`${shortMonth} ${day}`) ||
        expenseDateStr.includes(lowerDateStr)
      );
    });
    
    const expenses = matchingExpenses;
    
    if (expenses.length === 0) {
      return {
        response: `❌ No expenses found matching "${dateStr}". Please check the date and try again.`
      };
    }
    
    if (expenses.length === 1) {
      const expense = expenses[0];
      const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return {
        response: `✏️ **Found expense to edit:**\n\n📅 **Date:** ${formattedDate}\n💰 **Amount:** $${expense.amount.toFixed(2)}\n📝 **Description:** ${expense.text}\n🏷️ **Category:** ${expense.category}\n\n❓ **What would you like to edit?**\n\nType:\n• **"amount"** to change the amount\n• **"description"** to change the description\n• **"category"** to change the category`,
        foundExpenses: [expense],
        confirmationNeeded: true
      };
    }
    
    // Multiple expenses found
    const formattedDate = expenses.length > 0 ? new Date(expenses[0].date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'the specified date';
    
    const expenseList = expenses.map((exp, index) => 
      `${index + 1}. $${exp.amount.toFixed(2)} - ${exp.text} (${exp.category})`
    ).join('\n');
    
    return {
      response: `✏️ **Found ${expenses.length} expenses on ${formattedDate}:**\n\n${expenseList}\n\n❓ **Which expense would you like to edit?**\n\nType the number (1-${expenses.length}) to select an expense.`,
      foundExpenses: expenses,
      confirmationNeeded: true
    };
    
  } catch (error) {
    console.error('Error finding expenses:', error);
    return {
      response: "❌ Sorry, I encountered an error while searching for expenses. Please try again."
    };
  }
}

export async function confirmDelete(expenseId: string): Promise<{ response: string; success: boolean }> {
  try {
    const result = await deleteRecord(expenseId);
    if (result.message) {
      return {
        response: "✅ **Expense deleted successfully!** 🗑️\n\nYour dashboard will update automatically.",
        success: true
      };
    } else {
      return {
        response: `❌ Failed to delete expense: ${result.error || 'Unknown error'}`,
        success: false
      };
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    return {
      response: "❌ Something went wrong while deleting the expense. Please try again.",
      success: false
    };
  }
}