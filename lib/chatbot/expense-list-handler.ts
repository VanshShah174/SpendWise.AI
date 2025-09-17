import getRecords from '@/app/actions/getRecords';

export async function handleModifyExpenses(userId: string): Promise<string> {
  try {
    const { records, error } = await getRecords();
    
    if (error) {
      return "❌ Sorry, I couldn't fetch your expenses right now. Please try again later.";
    }
    
    if (!records || records.length === 0) {
      return "📝 You don't have any expenses recorded yet!\n\nWould you like to add your first expense? Just say 'add expense' and I'll help you! 💰";
    }
    
    // Show recent 5 expenses
    const recentExpenses = records.slice(0, 5);
    let response = `📋 **Your Recent Expenses:**\n\n`;
    
    recentExpenses.forEach((expense, index) => {
      const date = new Date(expense.createdAt).toLocaleDateString();
      response += `${index + 1}. **${expense.text}** - $${expense.amount.toFixed(2)}\n`;
      response += `   📅 ${date} | 🏷️ ${expense.category}\n\n`;
    });
    
    if (records.length > 5) {
      response += `... and ${records.length - 5} more expenses.\n\n`;
    }
    
    response += `✏️ **To edit or delete:**\n`;
    response += `• Type "delete [number]" (e.g., "delete 1")\n`;
    response += `• Type "edit [number]" (e.g., "edit 1")\n\n`;
    response += `Want to add a new expense? Just say "add expense"! 🚀`;
    
    return response;
  } catch (error) {
    console.error('Error showing expenses for modification:', error);
    return "❌ Something went wrong while fetching your expenses. Please try again or check your dashboard.";
  }
}

export async function handleShowExpenses(userId: string): Promise<string> {
  try {
    const { records, error } = await getRecords();
    
    if (error) {
      return "❌ Sorry, I couldn't fetch your expenses right now. Please try again later.";
    }
    
    if (!records || records.length === 0) {
      return "📝 You don't have any expenses recorded yet!\n\nWould you like to add your first expense? Just say 'add expense' and I'll help you! 💰";
    }
    
    // Show recent 5 expenses
    const recentExpenses = records.slice(0, 5);
    let response = `📋 **Your Recent Expenses:**\n\n`;
    
    recentExpenses.forEach((expense, index) => {
      const date = new Date(expense.createdAt).toLocaleDateString();
      response += `${index + 1}. **${expense.text}** - $${expense.amount.toFixed(2)}\n`;
      response += `   📅 ${date} | 🏷️ ${expense.category}\n\n`;
    });
    
    if (records.length > 5) {
      response += `... and ${records.length - 5} more expenses.\n\n`;
    }
    
    response += `💡 **Need to manage expenses?** Visit your dashboard for full editing capabilities!\n\n`;
    response += `Want to add a new expense? Just say "add expense"! 🚀`;
    
    return response;
  } catch (error) {
    console.error('Error showing expenses:', error);
    return "❌ Something went wrong while fetching your expenses. Please try again or check your dashboard.";
  }
}

export async function handleEditExpense(userId: string, expenseNumber: number): Promise<{ response: string; expense?: any }> {
  try {
    const { records, error } = await getRecords();
    
    if (error || !records || records.length === 0) {
      return { response: "❌ No expenses found to edit." };
    }
    
    if (expenseNumber < 1 || expenseNumber > Math.min(records.length, 5)) {
      return { response: `❌ Invalid expense number. Please choose between 1 and ${Math.min(records.length, 5)}.` };
    }
    
    const expenseToEdit = records[expenseNumber - 1];
    
    return {
      response: `✏️ **Editing Expense #${expenseNumber}:**\n\n📝 Current: ${expenseToEdit.text}\n💰 Current: $${expenseToEdit.amount.toFixed(2)}\n🏷️ Current: ${expenseToEdit.category}\n\n**What would you like to change?**\n• "change description to [new description]"\n• "change amount to [new amount]"\n• "change category to [new category]"\n\nOr type "cancel" to stop editing.`,
      expense: expenseToEdit
    };
  } catch (error) {
    console.error('Error editing expense:', error);
    return { response: "❌ Something went wrong while editing the expense. Please try again." };
  }
}

export async function handleDeleteExpense(userId: string, expenseNumber: number): Promise<{ response: string; deleted?: boolean }> {
  try {
    const { records, error } = await getRecords();
    
    if (error || !records || records.length === 0) {
      return { response: "❌ No expenses found to delete." };
    }
    
    if (expenseNumber < 1 || expenseNumber > Math.min(records.length, 5)) {
      return { response: `❌ Invalid expense number. Please choose between 1 and ${Math.min(records.length, 5)}.` };
    }
    
    const expenseToDelete = records[expenseNumber - 1];
    
    // Import and use delete function
    const deleteRecord = (await import('@/app/actions/deleteRecord')).default;
    const result = await deleteRecord(expenseToDelete.id);
    
    if (result.message) {
      return {
        response: `✅ **Expense Deleted Successfully!**\n\n"${expenseToDelete.text}" ($${expenseToDelete.amount.toFixed(2)}) has been removed from your expenses.\n\nYour dashboard will update automatically! 🎉`,
        deleted: true
      };
    } else {
      return { response: `❌ Failed to delete expense: ${result.error}` };
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { response: "❌ Something went wrong while deleting the expense. Please try again." };
  }
}