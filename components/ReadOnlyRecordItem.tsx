'use client';
import { Record } from '@/types/Record';

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

const ReadOnlyRecordItem = ({ record }: { record: Record }) => {
  const getBorderColor = (amount: number) => {
    if (amount > 100) return 'border-red-500';
    if (amount > 50) return 'border-yellow-500';
    return 'border-green-500';
  };

  return (
    <li
      className={`bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 border-l-4 ${getBorderColor(
        record?.amount
      )} min-h-[120px] flex flex-col justify-between`}
    >
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
            {new Date(record?.date).toLocaleDateString()}
          </span>
          <span className='text-lg font-extrabold text-gray-900 dark:text-gray-100'>
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
        <p className='break-words line-clamp-2'>{record?.text}</p>
      </div>
    </li>
  );
};

export default ReadOnlyRecordItem;