'use server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

async function getBestWorstExpense(): Promise<{
  bestExpense?: number;
  worstExpense?: number;
  bestExpenseText?: string;
  worstExpenseText?: string;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { error: 'User not found' };
  }

  try {
    // Fetch all records for the authenticated user
    const records = await db.record.findMany({
      where: { userId },
      select: { amount: true, text: true }, // Fetch amount and text fields
    });

    if (!records || records.length === 0) {
      return { bestExpense: 0, worstExpense: 0 }; // Return 0 if no records exist
    }

    // Find highest and lowest expense records
    const highestRecord = records.reduce((max, record) => record.amount > max.amount ? record : max);
    const lowestRecord = records.reduce((min, record) => record.amount < min.amount ? record : min);

    return { 
      bestExpense: highestRecord.amount,
      worstExpense: lowestRecord.amount,
      bestExpenseText: highestRecord.text,
      worstExpenseText: lowestRecord.text
    };
  } catch (error) {
    console.error('Error fetching expense amounts:', error); // Log the error
    return { error: 'Database error' };
  }
}

export default getBestWorstExpense;