'use client';

import { useState } from 'react';
import { generateInsightAnswer } from '@/app/actions/generateInsightAnswer';

export default function ExpenseDebugger() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'cached' | 'database' | 'general'>('general');

  const testQuestions = [
    "What's my biggest spending category?",
    "How much did I spend on food this month?",
    "What day do I spend the most?",
    "Show me my recent expenses",
    "How can I save money based on my spending?"
  ];

  const handleAsk = async (q: string) => {
    setQuestion(q);
    setLoading(true);
    
    try {
      const response = await generateInsightAnswer(q);
      setAnswer(response);
      
      // Determine data source based on response content
      if (response.includes('$') || response.includes('spent') || response.includes('category')) {
        setDataSource('database');
      } else if (response.includes('cached') || response.includes('general')) {
        setDataSource('cached');
      } else {
        setDataSource('general');
      }
    } catch (error) {
      setAnswer('Error getting answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        🔍 Expense Data Debugger
      </h3>
      
      <div className="space-y-2 mb-4">
        {testQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleAsk(q)}
            disabled={loading}
            className="w-full text-left p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a custom question..."
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <button
          onClick={() => handleAsk(question)}
          disabled={loading || !question.trim()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          Ask Question
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">Analyzing your data...</span>
        </div>
      )}

      {answer && !loading && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-l-4 ${
            dataSource === 'database' 
              ? 'bg-green-50 border-green-500 dark:bg-green-900/20' 
              : dataSource === 'cached'
              ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20'
              : 'bg-gray-50 border-gray-500 dark:bg-gray-900/20'
          }`}>
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium">
                {dataSource === 'database' && '✅ Using Your Real Expenses'}
                {dataSource === 'cached' && '⚡ Cached Response'}
                {dataSource === 'general' && '📚 General Advice'}
              </span>
            </div>
            <p className="text-sm">{answer}</p>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <strong>How to tell if it's using your data:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>✅ Mentions specific amounts, dates, or categories from your expenses</li>
              <li>⚡ Generic advice = cached/general response</li>
              <li>📊 Specific numbers = analyzing your real data</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}