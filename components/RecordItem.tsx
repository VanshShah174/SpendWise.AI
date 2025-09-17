'use client';
import { useState } from 'react';
import { Record } from '@/types/Record';
import deleteRecord from '@/app/actions/deleteRecord';
import updateRecord from '@/app/actions/updateRecord';
import { useExpenseContext } from '@/contexts/ExpenseContext';

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
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editData, setEditData] = useState({
    text: record.text,
    amount: record.amount,
    category: record.category,
    date: (() => {
      const date = new Date(record.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
  });
  const { triggerRefresh } = useExpenseContext();

  const handleDeleteRecord = async () => {
    setIsLoading(true);
    try {
      const result = await deleteRecord(record.id);
      if (result.message) {
        triggerRefresh();
        setShowDeleteDialog(false);
      } else if (result.error) {
        console.error('Delete failed:', result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRecord = async () => {
    setIsLoading(true);
    try {
      // Create date object using local timezone to preserve the exact date
      const [year, month, day] = editData.date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const updateData = {
        ...editData,
        date: dateObj.toISOString()
      };
      const result = await updateRecord(record.id, updateData);
      if (result.message) {
        setIsEditing(false);
        triggerRefresh();
      } else if (result.error) {
        console.error('Update failed:', result.error);
      }
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      text: record.text,
      amount: record.amount,
      category: record.category,
      date: (() => {
        const date = new Date(record.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })(),
    });
    setIsEditing(false);
  };

  const getBorderColor = (amount: number) => {
    if (amount > 100) return 'border-red-500';
    if (amount > 50) return 'border-yellow-500';
    return 'border-green-500';
  };

  return (
    <>
      <li
        className={`bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 p-5 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 border-l-4 ${getBorderColor(
          record?.amount
        )} hover:shadow-xl hover:scale-[1.02] transition-transform duration-200 relative min-h-[140px] flex flex-col justify-between overflow-visible group`}
      >
        <div className='absolute -top-3 -right-3 flex gap-1'>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:shadow-lg border-2 border-white dark:border-gray-700 transform hover:scale-110 transition-all duration-200'
            title='Edit expense record'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
            </svg>
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:shadow-lg border-2 border-white dark:border-gray-700 transform hover:scale-110 transition-all duration-200'
            title='Delete expense record'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        <div className='flex-1 flex flex-col justify-between'>
          {isEditing ? (
            <div className='space-y-3'>
              <div className='flex items-center justify-between gap-2'>
                <input
                  type='date'
                  value={editData.date}
                  onChange={(e) => setEditData({...editData, date: e.target.value})}
                  className='flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded'
                />
                <input
                  type='number'
                  value={editData.amount}
                  onChange={(e) => setEditData({...editData, amount: parseFloat(e.target.value) || 0})}
                  className='w-20 px-2 py-1 text-sm font-bold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded'
                  step='0.01'
                />
              </div>
              
              <select
                value={editData.category}
                onChange={(e) => setEditData({...editData, category: e.target.value})}
                className='w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded'
              >
                <option value='Food'>🍔 Food</option>
                <option value='Transportation'>🚗 Transportation</option>
                <option value='Shopping'>🛒 Shopping</option>
                <option value='Entertainment'>🎬 Entertainment</option>
                <option value='Bills'>💡 Bills</option>
                <option value='Healthcare'>🏥 Healthcare</option>
                <option value='Other'>📦 Other</option>
              </select>
              
              <textarea
                value={editData.text}
                onChange={(e) => setEditData({...editData, text: e.target.value})}
                className='w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded resize-none'
                rows={2}
              />
              
              <div className='flex gap-2'>
                <button
                  onClick={handleUpdateRecord}
                  disabled={isLoading}
                  className='px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded disabled:opacity-50'
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className='px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded'
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                    {new Date(record?.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
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

              <div className='mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200 dark:border-gray-600'>
                <div className='flex items-start gap-2'>
                  <div className='w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed'>
                      {record?.text}
                    </p>
                    <div className='flex items-center gap-2 mt-2'>
                      <span className='text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full border'>
                        💰 Expense
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </li>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4' style={{zIndex: 9999}}>
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full mx-4'>
            <div className='p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center'>
                  <span className='text-red-600 dark:text-red-400 text-xl'>⚠️</span>
                </div>
                <div>
                  <h3 className='text-lg font-bold text-gray-900 dark:text-gray-100'>Delete Expense</h3>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>This cannot be undone</p>
                </div>
              </div>
              
              <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4'>
                <p className='text-sm text-gray-700 dark:text-gray-300'>
                  <strong>${record.amount.toFixed(2)}</strong> - {record.category}
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>{record.text}</p>
              </div>
              
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-6'>
                Are you sure you want to delete this expense?
              </p>
              
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className='flex-1 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500'
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRecord}
                  disabled={isLoading}
                  className='flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2'
                >
                  {isLoading ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                      Deleting
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecordItem;