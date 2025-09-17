'use client';

import RecordItem from './RecordItem';
import { Record } from '@/types/Record';
import { useExpenseRecords } from '@/lib/hooks/useExpenseData';
import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

const RecordHistory = () => {
  const { data: records = [], error, isLoading: loading } = useExpenseRecords();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  
  // Get unique categories from records
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(records.map(record => record.category))];
    return ['All', ...uniqueCategories.sort()];
  }, [records]);
  
  // Get unique months from records
  const months = useMemo(() => {
    const uniqueMonths = [...new Set(records.map(record => {
      const date = new Date(record.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))].sort().reverse();
    return ['All', ...uniqueMonths];
  }, [records]);
  
  // Filter records based on selected category and month
  const filteredRecords = useMemo(() => {
    let filtered = records;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(record => record.category === selectedCategory);
    }
    
    if (selectedMonth !== 'All') {
      filtered = filtered.filter(record => {
        const date = new Date(record.date);
        const recordMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return recordMonth === selectedMonth;
      });
    }
    
    return filtered;
  }, [records, selectedCategory, selectedMonth]);

  if (loading) {
    return (
      <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3'></div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='h-24 bg-gray-200 dark:bg-gray-700 rounded-xl'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50'>
        <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
          <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg'>
            <span className='text-white text-sm sm:text-lg'>📝</span>
          </div>
          <div>
            <h3 className='text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
              Expense History
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
              Your spending timeline
            </p>
          </div>
        </div>
        <div className='bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-4 border-l-red-500 p-3 sm:p-4 rounded-xl'>
          <div className='flex items-center gap-2 mb-2'>
            <div className='w-6 h-6 sm:w-8 sm:h-8 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center'>
              <span className='text-base sm:text-lg'>⚠️</span>
            </div>
            <h4 className='font-bold text-red-800 dark:text-red-300 text-sm'>
              Error loading expense history
            </h4>
          </div>
          <p className='text-red-700 dark:text-red-400 ml-8 sm:ml-10 text-xs'>
            {String(error)}
          </p>
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50'>
        <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
          <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg'>
            <span className='text-white text-sm sm:text-lg'>📝</span>
          </div>
          <div>
            <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100'>
              Expense History
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
              Your spending timeline
            </p>
          </div>
        </div>
        <div className='text-center py-6 sm:py-8'>
          <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl sm:text-3xl'>📊</span>
          </div>
          <h4 className='text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-2'>
            No Expense Records Found
          </h4>
          <p className='text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm'>
            Start tracking your expenses to see your spending history and
            patterns here.
          </p>
        </div>
      </div>
    );
  }

  const totalExpenses = filteredRecords.reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl'>
      <div className='flex items-center justify-between mb-4 sm:mb-6'>
        <div className='flex items-center gap-2 sm:gap-4'>
          <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg'>
            <span className='text-white text-sm sm:text-lg'>📝</span>
          </div>
          <div>
            <h3 className='text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
              Expense History
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
              Your spending timeline
            </p>
          </div>
          
          {/* Category Filter */}
          <div className='relative'>
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800/40 dark:hover:to-green-800/40 transition-all duration-200'
            >
              <span>🏷️</span>
              <span>{selectedCategory}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isCategoryDropdownOpen && (
              <div className='absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10'>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                      selectedCategory === category
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {category === 'All' ? '🔍 All Categories' : `🏷️ ${category}`}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Month Filter */}
          <div className='relative'>
            <button
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 transition-all duration-200'
            >
              <span>📅</span>
              <span>{selectedMonth === 'All' ? 'All Months' : (() => {
                const [year, month] = selectedMonth.split('-');
                return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
              })()}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isMonthDropdownOpen && (
              <div className='absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10'>
                {months.map((month) => (
                  <button
                    key={month}
                    onClick={() => {
                      setSelectedMonth(month);
                      setIsMonthDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                      selectedMonth === month
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {month === 'All' ? '📅 All Months' : `📅 ${(() => {
                      const [year, monthNum] = month.split('-');
                      return new Date(parseInt(year), parseInt(monthNum) - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                    })()}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className='text-right'>
          <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>Total Expenses</p>
          <p className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent'>
            ${totalExpenses.toFixed(2)}
          </p>
        </div>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
        {filteredRecords.map((record: Record) => (
          <RecordItem key={record.id} record={record} />
        ))}
      </div>
      
      {filteredRecords.length === 0 && (selectedCategory !== 'All' || selectedMonth !== 'All') && (
        <div className='text-center py-6'>
          <div className='w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>🔍</span>
          </div>
          <h4 className='text-lg font-bold text-gray-800 dark:text-gray-200 mb-2'>
            No expenses found
          </h4>
          <p className='text-gray-600 dark:text-gray-400 text-sm'>
            {selectedCategory !== 'All' && selectedMonth !== 'All' 
              ? `No expenses for "${selectedCategory}" in ${(() => {
                const [year, month] = selectedMonth.split('-');
                return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
              })()}`
              : selectedCategory !== 'All' 
                ? `No expenses found for "${selectedCategory}"`
                : `No expenses found for ${(() => {
                  const [year, month] = selectedMonth.split('-');
                  return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                })()}`
            }
          </p>
          <p className='text-gray-500 dark:text-gray-500 text-xs mt-2'>
            Try selecting different filters or add new expenses.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecordHistory;