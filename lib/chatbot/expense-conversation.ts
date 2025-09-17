import { ExpenseConversationState, getConversationState, setConversationState, clearConversationState, parseAmount, parseDate, parseCategory } from './conversation-state';
import { categorizeExpense } from '../ai';
import addExpenseRecordAction from '@/app/actions/addExpenseRecord';

// Parse natural language expense input
function parseNaturalExpense(message: string): { description?: string; amount?: number } | null {
  const lowerMessage = message.toLowerCase();
  
  // Patterns to extract amount and description
  const patterns = [
    /i\s+spent\s+\$?(\d+(?:\.\d{2})?)\s+on\s+(.+)/,
    /i\s+bought\s+(.+)\s+for\s+\$?(\d+(?:\.\d{2})?)/,
    /i\s+paid\s+\$?(\d+(?:\.\d{2})?)\s+for\s+(.+)/,
    /spent\s+\$?(\d+(?:\.\d{2})?)\s+on\s+(.+)/,
    /paid\s+\$?(\d+(?:\.\d{2})?)\s+for\s+(.+)/,
    /\$?(\d+(?:\.\d{2})?)\s+for\s+(.+)/,
    /\$?(\d+(?:\.\d{2})?)\s+on\s+(.+)/
  ];
  
  for (const pattern of patterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      const description = match[2]?.trim();
      
      if (amount > 0 && description && description.length > 1) {
        return { amount, description };
      }
    }
  }
  
  return null;
}

export async function handleExpenseConversation(
  userId: string, 
  conversationId: string, 
  message: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ response: string; completed?: boolean; expenseAdded?: any }> {
  
  const state = await getConversationState(userId, conversationId);
  
  // Start new conversation
  if (!state) {
    // Try to parse natural language expense
    const parsedExpense = parseNaturalExpense(message);
    
    if (parsedExpense) {
      // We have both amount and description, skip to category
      const newState: ExpenseConversationState = {
        step: 'category',
        data: {
          description: parsedExpense.description,
          amount: parsedExpense.amount
        },
        timestamp: new Date(),
        userId
      };
      await setConversationState(userId, conversationId, newState);
      
      // Get AI category suggestion
      let suggestedCategory = 'Other';
      try {
        suggestedCategory = await categorizeExpense(parsedExpense.description || '');
      } catch {
        // Category suggestion failed, use default
      }
      
      return {
        response: `Perfect! I've got your expense: "${parsedExpense.description}" for $${(parsedExpense.amount || 0).toFixed(2)} 💰\n\nI suggest the category "${suggestedCategory}" - does that work?\n\nType "yes" to accept, or choose: Food, Transportation, Shopping, Entertainment, Bills, Healthcare, Other`
      };
    }
    
    // Fallback to guided conversation
    const newState: ExpenseConversationState = {
      step: 'description',
      data: {},
      timestamp: new Date(),
      userId
    };
    await setConversationState(userId, conversationId, newState);
    return {
      response: "I'd be happy to help you add an expense! 💰\n\nWhat did you spend money on? (e.g., Coffee, Groceries, Gas, Lunch)"
    };
  }

  // Handle cancellation
  if (message.toLowerCase().includes('cancel') || message.toLowerCase().includes('stop')) {
    await clearConversationState(userId, conversationId);
    return {
      response: "No problem! Expense addition cancelled. Feel free to ask me anything else! 😊",
      completed: true
    };
  }

  // Process based on current step
  switch (state.step) {
    case 'description':
      return await handleDescriptionStep(userId, conversationId, state, message);
    
    case 'amount':
      return await handleAmountStep(userId, conversationId, state, message);
    
    case 'category':
      return await handleCategoryStep(userId, conversationId, state, message);
    
    case 'date':
      return await handleDateStep(userId, conversationId, state, message);
    
    case 'confirmation':
      return await handleConfirmationStep(userId, conversationId, state, message);
    
    default:
      await clearConversationState(userId, conversationId);
      return {
        response: "Something went wrong. Let's start over! What expense would you like to add?",
        completed: true
      };
  }
}

async function handleDescriptionStep(userId: string, conversationId: string, state: ExpenseConversationState, message: string) {
  // Try to parse natural language first
  const parsedExpense = parseNaturalExpense(message);
  
  if (parsedExpense) {
    // We got both description and amount, skip to category
    state.data.description = parsedExpense.description;
    state.data.amount = parsedExpense.amount;
    state.step = 'category';
    await setConversationState(userId, conversationId, state);
    
    // Get AI category suggestion
    let suggestedCategory = 'Other';
    try {
      suggestedCategory = await categorizeExpense(parsedExpense.description || '');
    } catch {
      // Category suggestion failed, use default
    }
    
    return {
      response: `Perfect! I've got your expense: "${parsedExpense.description}" for $${(parsedExpense.amount || 0).toFixed(2)} 💰\n\nI suggest the category "${suggestedCategory}" - does that work?\n\nType "yes" to accept, or choose: Food, Transportation, Shopping, Entertainment, Bills, Healthcare, Other`
    };
  }
  
  const description = message.trim();
  
  if (description.length < 2) {
    return {
      response: "Please provide a more detailed description of your expense. What did you spend money on?"
    };
  }

  state.data.description = description;
  state.step = 'amount';
  await setConversationState(userId, conversationId, state);

  return {
    response: `Got it! "${description}" 📝\n\nHow much did you spend? (e.g., $5.50, 10, fifteen dollars)`
  };
}

async function handleAmountStep(userId: string, conversationId: string, state: ExpenseConversationState, message: string) {
  const amount = parseAmount(message);
  
  if (!amount || amount <= 0) {
    return {
      response: "I couldn't understand the amount. Please enter it like: $5.50, 10, or 15.99"
    };
  }

  if (amount > 10000) {
    return {
      response: `$${amount.toFixed(2)} seems quite high! Is this correct? If yes, please confirm the amount again.`
    };
  }

  state.data.amount = amount;
  state.step = 'category';
  await setConversationState(userId, conversationId, state);

  // Get AI category suggestion
  let suggestedCategory = 'Other';
  try {
    suggestedCategory = await categorizeExpense(state.data.description || '');
  } catch {
    // Category suggestion failed, use default
  }

  return {
    response: `Perfect! $${amount.toFixed(2)} for "${state.data.description}" 💰\n\nI suggest the category "${suggestedCategory}" - does that work?\n\nType "yes" to accept, or choose: Food, Transportation, Shopping, Entertainment, Bills, Healthcare, Other`
  };
}

async function handleCategoryStep(userId: string, conversationId: string, state: ExpenseConversationState, message: string) {
  let category = parseCategory(message);
  
  if (category === 'suggested') {
    // User said yes, use AI suggestion
    try {
      category = await categorizeExpense(state.data.description || '');
    } catch {
      category = 'Other';
    }
  }

  state.data.category = category;
  state.step = 'date';
  await setConversationState(userId, conversationId, state);

  return {
    response: `Great! Category set to "${category}" 🏷️\n\nWhen did you make this purchase?\n\nType "today", "yesterday", or a specific date (e.g., 2024-01-15)`
  };
}

async function handleDateStep(userId: string, conversationId: string, state: ExpenseConversationState, message: string) {
  const date = parseDate(message);
  
  state.data.date = date;
  state.step = 'confirmation';
  await setConversationState(userId, conversationId, state);

  // Format date properly for display
  const [year, month, day] = date.split('-');
  const formattedDate = `${month}/${day}/${year}`;

  return {
    response: `✅ Ready to add your expense:\n\n📝 **Description:** ${state.data.description}\n💰 **Amount:** $${state.data.amount?.toFixed(2)}\n🏷️ **Category:** ${state.data.category}\n📅 **Date:** ${formattedDate}\n\nShould I save this expense? Type "yes" to confirm or "no" to cancel.`
  };
}

async function handleConfirmationStep(userId: string, conversationId: string, state: ExpenseConversationState, message: string) {
  const confirmation = message.toLowerCase().trim();
  
  if (confirmation === 'yes' || confirmation === 'y' || confirmation === 'confirm' || confirmation === 'save') {
    try {
      // Create FormData for the action
      const formData = new FormData();
      formData.append('text', state.data.description!);
      formData.append('amount', state.data.amount!.toString());
      formData.append('category', state.data.category!);
      formData.append('date', state.data.date!);
      
      // Add the expense
      const result = await addExpenseRecordAction(formData);

      await clearConversationState(userId, conversationId);

      if (result.data) {
        return {
          response: `🎉 **Expense Added Successfully!**\n\n"${state.data.description}" for $${state.data.amount?.toFixed(2)} has been saved to your ${state.data.category} expenses.\n\nYour dashboard will update automatically! Want to add another expense?`,
          completed: true,
          expenseAdded: result.data
        };
      } else {
        return {
          response: `❌ Sorry, there was an error saving your expense: ${result.error}\n\nPlease try again or add it manually from the dashboard.`,
          completed: true
        };
      }
    } catch {
      await clearConversationState(userId, conversationId);
      return {
        response: "❌ Something went wrong while saving your expense. Please try again or add it manually from the dashboard.",
        completed: true
      };
    }
  } else if (confirmation === 'no' || confirmation === 'n' || confirmation === 'cancel') {
    await clearConversationState(userId, conversationId);
    return {
      response: "No problem! Expense cancelled. Feel free to start over anytime! 😊",
      completed: true
    };
  } else {
    return {
      response: 'Please type "yes" to save the expense or "no" to cancel.'
    };
  }
}