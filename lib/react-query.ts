'use client';

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Query keys for consistent caching
export const QUERY_KEYS = {
  RECORDS: 'records',
  STATS: 'stats',
  BEST_WORST: 'bestWorst',
} as const;