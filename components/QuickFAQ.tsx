'use client';

import { useState } from 'react';
import { useCachedFAQ } from '@/lib/hooks/useCachedFAQ';

const QUICK_QUESTIONS = [
  'How can I save more money?',
  'What are the best budgeting tips?',
  'How do I reduce my food expenses?',
  'What is the 50/30/20 rule?',
  'How do I start an emergency fund?'
];

export default function QuickFAQ() {
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const { askQuestion, loading, error } = useCachedFAQ();

  const handleQuestionClick = async (question: string) => {
    setSelectedQuestion(question);
    setAnswer('');
    
    try {
      const response = await askQuestion(question);
      setAnswer(response);
    } catch (err) {
      console.error('Failed to get answer:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        💡 Quick Financial Tips
      </h3>
      
      <div className="space-y-2 mb-4">
        {QUICK_QUESTIONS.map((question, index) => (
          <button
            key={index}
            onClick={() => handleQuestionClick(question)}
            disabled={loading}
            className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors duration-200 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            {question}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Getting answer...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {answer && !loading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
            {selectedQuestion}
          </h4>
          <p className="text-blue-700 dark:text-blue-200 text-sm leading-relaxed">
            {answer}
          </p>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            ⚡ Cached response for faster loading
          </div>
        </div>
      )}
    </div>
  );
}