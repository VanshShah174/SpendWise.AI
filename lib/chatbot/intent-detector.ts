export interface UserIntent {
  type: 'add_expense' | 'analyze_expenses' | 'general_advice' | 'modify_expense' | 'show_expenses' | 'delete_expense' | 'edit_expense' | 'change_field' | 'unknown';
  confidence: number;
  response?: string;
  startConversation?: boolean;
  expenseNumber?: number;
  field?: string;
  newValue?: string;
}

export function detectUserIntent(question: string): UserIntent {
  const lowerQuestion = question.toLowerCase().trim();
  
  // Intent patterns
  const addExpensePatterns = [
    'add expense', 'create expense', 'new expense', 'record expense', 
    'log expense', 'enter expense', 'add new', 'can you add'
  ];
  
  const analyzePatterns = [
    'how much did i spend', 'how much have i spent', 'what did i spend', 'show me my', 'analyze', 'total', 
    'biggest', 'highest', 'category breakdown', 'spending', 'my expenses', 'expense analysis'
  ];
  
  const modifyPatterns = [
    'delete', 'remove', 'edit', 'change', 'update', 'modify'
  ];
  
  const showExpensesPatterns = [
    'show me my', 'list my', 'recent expenses', 'my expenses', 'expense list',
    'view expenses', 'see my expenses'
  ];
  
  const generalAdvicePatterns = [
    'how to save', 'budget tips', 'financial advice', 'money saving', 
    'reduce expenses', 'cut costs'
  ];

  // Check for edit expense intent (e.g., "edit 1", "modify 2")
  const editMatch = lowerQuestion.match(/(?:edit|modify)\s+(\d+)/);
  if (editMatch) {
    const expenseNumber = parseInt(editMatch[1]);
    return {
      type: 'edit_expense',
      confidence: 0.95,
      expenseNumber
    };
  }

  // Check for change field intent (e.g., "change description to coffee", "change amount to 5.50")
  const changeMatch = lowerQuestion.match(/change\s+(description|amount|category)\s+to\s+(.+)/);
  if (changeMatch) {
    return {
      type: 'change_field',
      confidence: 0.9,
      field: changeMatch[1],
      newValue: changeMatch[2].trim()
    };
  }

  // Check for delete expense intent (e.g., "delete 1", "remove 2")
  const deleteMatch = lowerQuestion.match(/(?:delete|remove)\s+(\d+)/);
  if (deleteMatch) {
    const expenseNumber = parseInt(deleteMatch[1]);
    return {
      type: 'delete_expense',
      confidence: 0.95,
      expenseNumber
    };
  }

  // Check for analysis intent FIRST (before add expense)
  if (analyzePatterns.some(pattern => lowerQuestion.includes(pattern))) {
    return {
      type: 'analyze_expenses',
      confidence: 0.9
    };
  }

  // Check for add expense intent
  if (addExpensePatterns.some(pattern => lowerQuestion.includes(pattern))) {
    return {
      type: 'add_expense',
      confidence: 0.9,
      startConversation: true
    };
  }

  // Check for modify expense intent BEFORE show expenses
  if (modifyPatterns.some(pattern => lowerQuestion.includes(pattern))) {
    return {
      type: 'modify_expense',
      confidence: 0.8,
      startConversation: true
    };
  }

  // Check for show expenses intent
  if (showExpensesPatterns.some(pattern => lowerQuestion.includes(pattern))) {
    return {
      type: 'show_expenses',
      confidence: 0.9,
      startConversation: true
    };
  }

  // Check for general advice intent
  if (generalAdvicePatterns.some(pattern => lowerQuestion.includes(pattern))) {
    return {
      type: 'general_advice',
      confidence: 0.7
    };
  }

  return {
    type: 'unknown',
    confidence: 0.5
  };
}