'use client';
import { useState } from 'react';
import { Record } from '@/types/Record';
import deleteRecord from '@/app/actions/deleteRecord';

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'Food':
      return '🍔';
    case 'Transportation':
      return '🚗';
    case 'Shopping':
      return '🛒';
    case 'Entertainment':
      return '🎬';
    case 'Bills':
      return '💡';
    case 'Healthcare':
      return '🏥';
    default:
      return '📦';
  }
};

const RecordItem = ({ record }: { record: Record }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteRecord = async (recordId: string) => {
    setIsLoading(true);
    await deleteRecord(recordId);
    setIsLoading(false);
  };

  const getBorderColor = (amount: number) => {
    if (amount > 100) return 'border-red-500';
    if (amount > 50) return 'border-yellow-500';
    return 'border-green-500';
  };

  return (
    <li
      className={`bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 p-5 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 border-l-4 ${getBorderColor(
        record?.amount
      )} hover:shadow-xl hover:scale-[1.02] transition-transform duration-200 relative min-h-[140px] flex flex-col justify-between overflow-visible group`}
    >
      <button
        onClick={() => handleDeleteRecord(record.id)}
        className={`absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:shadow-lg border-2 border-white dark:border-gray-700 transform hover:scale-110 transition-all duration-200 ${
          isLoading ? 'cursor-not-allowed' : ''
        }`}
        aria-label='Delete record'
        disabled={isLoading}
        title='Delete expense record'
      >
        {isLoading ? (
          <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
        ) : (
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        )}
      </button>

      <div className='flex-1 flex flex-col justify-between'>
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
              {new Date(record?.date).toLocaleDateString()}
            </span>
            <span className='text-lg sm:text-xl font-extrabold text-gray-900 dark:text-gray-100'>
              ${record?.amount.toFixed(2)}
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <span className='text-lg'>{getCategoryEmoji(record?.category)}</span>
            <span className='px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md'>
              {record?.category}
            </span>
          </div>
        </div>

        <div className='text-sm text-gray-600 dark:text-gray-400 mt-3'>
          <p className='truncate break-words line-clamp-2'>{record?.text}</p>
        </div>
      </div>
    </li>
  );
};

export default RecordItem;