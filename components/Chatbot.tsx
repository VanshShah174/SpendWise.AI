'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Minimize2, Maximize2, Sparkles, MessageCircle, Trash2 } from 'lucide-react';
import { useExpenseContext } from '@/contexts/ExpenseContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showHoverTooltip, setShowHoverTooltip] = useState(false);
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const { addExpenseOptimistic } = useExpenseContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Auto-focus input after new messages
    if (messages.length > 0 && !isLoading && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Show welcome popup for new users
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('spendwise-ai-welcome');
    if (!hasSeenWelcome && !isOpen) {
      setTimeout(() => {
        setShowWelcomePopup(true);
        localStorage.setItem('spendwise-ai-welcome', 'true');
      }, 2000); // Show after 2 seconds
    }
  }, [isOpen]);

  // Auto-hide welcome popup
  useEffect(() => {
    if (showWelcomePopup) {
      const timer = setTimeout(() => {
        setShowWelcomePopup(false);
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showWelcomePopup]);

  // Handle click outside to close chatbot
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatbotRef.current && !chatbotRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(data.timestamp),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // If expense was added, trigger UI update
      if (data.expenseAdded) {
        addExpenseOptimistic(data.expenseAdded);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInputMessage('');
  };

  const quickQuestions = [
    "What's my biggest spending category?",
    "How much did I spend this month?",
    "Show me my recent expenses",
    "Give me budget tips",
    "How can I save money?",
    "What's my average daily spending?",
    "Compare my categories",
    "How do I add a new expense?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    // Auto-send the question
    setTimeout(() => {
      const userMessage: Message = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: question,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);
      
      // Send to API
      fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, conversationId }),
      })
      .then(response => response.json())
      .then(data => {
        const assistantMessage: Message = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(data.timestamp),
        };
        setMessages(prev => [...prev, assistantMessage]);
        if (data.expenseAdded) {
          addExpenseOptimistic(data.expenseAdded);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        const errorMessage: Message = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      })
      .finally(() => {
        setIsLoading(false);
      });
    }, 50);
  };

  const handleAddExpense = () => {
    handleQuickQuestion('add expense');
  };

  const handleEditRemove = () => {
    handleQuickQuestion('edit remove');
  };

  const formatMessage = (content: string) => {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/•/g, '&bull;');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onToggle}
          onMouseEnter={() => setShowHoverTooltip(true)}
          onMouseLeave={() => setShowHoverTooltip(false)}
          className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 flex items-center justify-center group animate-pulse hover:animate-none transform hover:scale-110"
          aria-label="Open AI Assistant"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          <MessageCircle className="w-7 h-7 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-bounce" />
        </button>
        
        {/* Hover Tooltip */}
        {showHoverTooltip && (
          <div className="absolute -top-16 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap animate-fade-in shadow-lg">
            <div className="text-center">
              <div className="font-semibold">SpendWise AI Assistant 🤖</div>
              <div className="text-gray-300 mt-1">Click to manage your expenses!</div>
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
        
        {/* Welcome Popup */}
        {showWelcomePopup && (
          <div className="absolute -top-32 -left-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-64 animate-bounce">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="font-bold text-sm">Hey there! 👋</div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              This is your AI Helper for SpendWise.AI! I can help you track expenses, analyze spending, and provide financial insights.
            </p>
            <button
              onClick={() => {
                setShowWelcomePopup(false);
                onToggle();
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              Get Started! 🚀
            </button>
            <div className="absolute bottom-0 right-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800 transform translate-y-full"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={chatbotRef}
      className={`fixed bottom-6 right-6 w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 transition-all duration-500 transform ${
        isMinimized ? 'h-16 scale-95' : 'h-[650px] scale-100'
      } hover:shadow-3xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              SpendWise AI 
              <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Your smart expense assistant 💰</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-xl transition-all duration-200 hover:scale-110"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            ) : (
              <Minimize2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            )}
          </button>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 hover:scale-110 group"
            aria-label="Close chatbot"
          >
            <X className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 h-[450px] bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
            {messages.length === 0 ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
                  </div>
                </div>
                <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-3">Welcome to SpendWise AI! 🚀</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  I'm your intelligent expense assistant powered by AI and Redis caching. I can analyze your spending patterns, provide personalized insights, and answer questions about your finances instantly!
                </p>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    💡 Quick Questions:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {quickQuestions.slice(0, 4).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(question)}
                        className="text-left text-xs bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 text-blue-700 dark:text-blue-300 py-2 px-3 rounded-xl border border-blue-200/50 dark:border-blue-700/50 transition-all duration-200 hover:scale-105 hover:shadow-md"
                      >
                        💬 {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white transform hover:scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(message.content),
                      }}
                    />
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-5 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-b-3xl">
            <div className="flex gap-2 items-end mb-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your expenses... 💰"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 text-sm transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                  disabled={isLoading}
                />
                {inputMessage.trim() && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <button
                onClick={clearChat}
                disabled={isLoading || messages.length === 0}
                className="px-3 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddExpense}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50"
              >
                <span>➕</span>
                Add Expense
              </button>
              <button
                onClick={handleEditRemove}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50"
              >
                <span>✏️</span>
                Edit/Remove
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
