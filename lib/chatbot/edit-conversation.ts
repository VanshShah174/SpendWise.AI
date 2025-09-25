import { EditConversationState, getEditState, setEditState, clearEditState, parseAmount } from './conversation-state';
import updateRecord from '@/app/actions/updateRecord';

export async function handleEditConversation(
  userId: string,
  conversationId: string,
  field: string,
  newValue: string
): Promise<{ response: string; updated?: boolean }> {
  
  const editState = await getEditState(userId, conversationId);
  
  if (!editState) {
    return {
      response: "❌ No expense is currently being edited. Please start by typing 'edit [number]' from the expense list."
    };
  }

  try {
    const updatedData: Record<string, unknown> = {};
    
    switch (field) {
      case 'description':
        updatedData.text = newValue;
        break;
      case 'amount':
        const amount = parseAmount(newValue);
        if (!amount || amount <= 0) {
          return {
            response: "❌ Invalid amount. Please enter a valid number (e.g., '5.50', '10', '$15')."
          };
        }
        updatedData.amount = amount;
        break;
      case 'category':
        const validCategories = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Other'];
        const category = validCategories.find(cat => 
          cat.toLowerCase() === newValue.toLowerCase()
        ) || 'Other';
        updatedData.category = category;
        break;
      default:
        return {
          response: "❌ Invalid field. You can change: description, amount, or category."
        };
    }

    // Prepare update data - only include fields that are being changed
    const completeUpdateData = {
      text: (field === 'description' ? updatedData.text : editState.originalExpense.text) as string,
      amount: (field === 'amount' ? updatedData.amount : editState.originalExpense.amount) as number,
      category: (field === 'category' ? updatedData.category : editState.originalExpense.category) as string,
      date: editState.originalExpense.date
    };

    // Update the expense
    const result = await updateRecord(editState.expenseId, completeUpdateData);
    
    if (result.message) {
      await clearEditState(userId, conversationId);
      
      const fieldName = field === 'description' ? 'description' : field;
      const displayValue = field === 'amount' ? `$${(updatedData.amount as number).toFixed(2)}` : 
                          field === 'description' ? updatedData.text : updatedData.category;
      
      return {
        response: `✅ **Expense Updated Successfully!**\n\nChanged ${fieldName} to: ${displayValue}\n\nYour dashboard will update automatically! 🎉`,
        updated: true
      };
    } else {
      return {
        response: `❌ Failed to update expense: ${result.error || 'Unknown error'}`
      };
    }
  } catch (error) {
    console.error('Error updating expense:', error);
    return {
      response: "❌ Something went wrong while updating the expense. Please try again."
    };
  }
}

export async function startEditConversation(
  userId: string,
  conversationId: string,
  expense: { id: string; text: string; amount: number; category: string; date: Date }
): Promise<void> {
  const editState: EditConversationState = {
    expenseId: expense.id,
    originalExpense: {
      text: expense.text,
      amount: expense.amount,
      category: expense.category,
      date: expense.date.toISOString().split('T')[0] // Store as ISO date string
    },
    timestamp: new Date(),
    userId
  };
  
  await setEditState(userId, conversationId, editState);
}