'use client';

import { useEffect, useState } from 'react';
import { useExpenseContext } from '@/contexts/ExpenseContext';

export function useExpenseRefresh() {
  const { refreshTrigger } = useExpenseContext();
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    setLastUpdate(Date.now());
  }, [refreshTrigger]);

  useEffect(() => {
    const handleExpenseUpdate = () => {
      setLastUpdate(Date.now());
    };

    window.addEventListener('expenseUpdated', handleExpenseUpdate);
    window.addEventListener('expenseAdded', handleExpenseUpdate);

    return () => {
      window.removeEventListener('expenseUpdated', handleExpenseUpdate);
      window.removeEventListener('expenseAdded', handleExpenseUpdate);
    };
  }, []);

  return { lastUpdate, refreshTrigger };
}