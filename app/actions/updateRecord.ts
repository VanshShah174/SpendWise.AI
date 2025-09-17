'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

interface UpdateRecordData {
  text: string;
  amount: number;
  category: string;
  date: string;
}

export default async function updateRecord(recordId: string, data: UpdateRecordData) {
  const { userId } = await auth();

  if (!userId) {
    return { error: 'User not authenticated' };
  }

  try {
    // Verify the record belongs to the user
    const existingRecord = await db.record.findFirst({
      where: {
        id: recordId,
        userId: userId,
      },
    });

    if (!existingRecord) {
      return { error: 'Record not found or unauthorized' };
    }

    // Validate and prepare update data
    const updateData: Record<string, unknown> = {};
    
    if (data.text !== undefined && data.text !== null) {
      updateData.text = data.text;
    }
    if (data.amount !== undefined && data.amount !== null) {
      updateData.amount = data.amount;
    }
    if (data.category !== undefined && data.category !== null) {
      updateData.category = data.category;
    }
    if (data.date !== undefined && data.date !== null) {
      const parsedDate = new Date(data.date);
      if (!isNaN(parsedDate.getTime())) {
        updateData.date = parsedDate;
      }
    }

    // Update the record
    const updatedRecord = await db.record.update({
      where: { id: recordId },
      data: updateData,
    });

    revalidatePath('/');
    return { message: 'Record updated successfully', record: updatedRecord };
  } catch (error) {
    console.error('Error updating record:', error);
    return { error: 'Failed to update record' };
  }
}