'use server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

async function deleteRecord(recordId: string): Promise<{
  message?: string;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { error: 'User not found' };
  }

  try {
    // First check if record exists and belongs to user
    const existingRecord = await db.record.findFirst({
      where: {
        id: recordId,
        userId,
      },
    });

    if (!existingRecord) {
      return { error: 'Record not found or access denied' };
    }

    // Delete the record
    await db.record.delete({
      where: {
        id: recordId,
      },
    });

    revalidatePath('/');

    return { message: 'Record deleted successfully' };
  } catch (error) {
    console.error('Error deleting record:', error);
    return { error: 'Failed to delete record' };
  }
}

export default deleteRecord;