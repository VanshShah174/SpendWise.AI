import { createExpenseEmbedding } from './embeddings';
import getRecords from '@/app/actions/getRecords';

export async function syncExpenseEmbeddings(userId: string) {
  try {
    const { records } = await getRecords();
    
    if (!records || records.length === 0) {
      // console.log('No expenses to sync for user:', userId);
      return;
    }

    // Create embeddings for all expenses
    const embeddingPromises = records.map(async (record) => {
      const embeddingText = `${record.text} ${record.category} $${record.amount}`;
      const metadata = {
        userId,
        amount: record.amount,
        category: record.category,
        date: record.date,
        originalText: record.text
      };

      try {
        await createExpenseEmbedding(record.id, embeddingText, metadata);
        // console.log(`Created embedding for expense: ${record.text}`);
      } catch (error) {
        console.error(`Failed to create embedding for ${record.id}:`, error);
      }
    });

    await Promise.allSettled(embeddingPromises);
    // console.log(`Synced embeddings for ${records.length} expenses`);
  } catch (error) {
    console.error('Failed to sync expense embeddings:', error);
  }
}

// Auto-sync when new expense is added
export async function addExpenseWithEmbedding(expenseId: string, text: string, amount: number, category: string, userId: string) {
  const embeddingText = `${text} ${category} $${amount}`;
  const metadata = {
    userId,
    amount,
    category,
    date: new Date(),
    originalText: text
  };

  await createExpenseEmbedding(expenseId, embeddingText, metadata);
}