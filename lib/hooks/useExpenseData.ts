'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query';
import getRecords from '@/app/actions/getRecords';
import getUserRecord from '@/app/actions/getUserRecord';
import getBestWorstExpense from '@/app/actions/getBestWorstExpense';
import { useExpenseContext } from '@/contexts/ExpenseContext';
import { useEffect } from 'react';

export function useExpenseRecords() {
  const { refreshTrigger } = useExpenseContext();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: [QUERY_KEYS.RECORDS],
    queryFn: async () => {
      const result = await getRecords();
      if (result.error) throw new Error(result.error);
      return result.records || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Invalidate cache when refresh is triggered
  useEffect(() => {
    if (refreshTrigger > 0) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORDS] });
    }
  }, [refreshTrigger, queryClient]);

  return query;
}

export function useExpenseStats() {
  const { refreshTrigger } = useExpenseContext();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: [QUERY_KEYS.STATS],
    queryFn: async () => {
      const [userRecordResult, rangeResult] = await Promise.all([
        getUserRecord(),
        getBestWorstExpense(),
      ]);

      const { record, daysWithRecords } = userRecordResult;
      const { bestExpense, worstExpense } = rangeResult;

      const validRecord = record || 0;
      const validDays = daysWithRecords && daysWithRecords > 0 ? daysWithRecords : 1;
      const averageExpense = validRecord / validDays;

      return {
        averageExpense,
        bestExpense,
        worstExpense,
        validDays
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  // Invalidate cache when refresh is triggered
  useEffect(() => {
    if (refreshTrigger > 0) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STATS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORDS] });
    }
  }, [refreshTrigger, queryClient]);

  return query;
}

export function useInvalidateExpenseData() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORDS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STATS] });
  };
}