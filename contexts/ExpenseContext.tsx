'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ExpenseContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  addExpenseOptimistic: (expense: any) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    
    // Dispatch custom event for components that need it
    window.dispatchEvent(new CustomEvent('expenseUpdated', {
      detail: { timestamp: Date.now() }
    }));
  }, []);

  const addExpenseOptimistic = useCallback((expense: any) => {
    // Trigger immediate UI update
    triggerRefresh();
    
    // Dispatch specific event with expense data
    window.dispatchEvent(new CustomEvent('expenseAdded', {
      detail: { expense, timestamp: Date.now() }
    }));
  }, [triggerRefresh]);

  return (
    <ExpenseContext.Provider value={{
      refreshTrigger,
      triggerRefresh,
      addExpenseOptimistic
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenseContext() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenseContext must be used within an ExpenseProvider');
  }
  return context;
}