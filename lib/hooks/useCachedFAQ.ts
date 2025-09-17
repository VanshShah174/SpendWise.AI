'use client';

import { useState, useCallback } from 'react';

interface FAQResponse {
  question: string;
  answer: string;
  cached: boolean;
  timestamp: string;
}

interface UseCachedFAQReturn {
  askQuestion: (question: string) => Promise<string>;
  loading: boolean;
  error: string | null;
  lastResponse: FAQResponse | null;
}

export function useCachedFAQ(): UseCachedFAQReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<FAQResponse | null>(null);

  const askQuestion = useCallback(async (question: string): Promise<string> => {
    if (!question.trim()) {
      throw new Error('Question cannot be empty');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get answer');
      }

      const data: FAQResponse = await response.json();
      setLastResponse(data);
      return data.answer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    askQuestion,
    loading,
    error,
    lastResponse,
  };
}