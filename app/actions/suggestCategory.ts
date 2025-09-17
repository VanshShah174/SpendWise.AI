'use server';

import { categorizeExpense } from '@/lib/ai';
import { getCachedCategorySuggestion, cacheCategorySuggestion } from '@/lib/cache/cache';

export async function suggestCategory(
  description: string
): Promise<{ category: string; error?: string }> {
  try {
    if (!description || description.trim().length < 2) {
      return {
        category: 'Other',
        error: 'Description too short for AI analysis',
      };
    }

    const trimmedDescription = description.trim();
    
    // Check cache first
    const cachedCategory = await getCachedCategorySuggestion(trimmedDescription);
    if (cachedCategory) {
      return { category: cachedCategory };
    }

    const category = await categorizeExpense(trimmedDescription);
    
    // Cache the result
    await cacheCategorySuggestion(trimmedDescription, category);
    
    return { category };
  } catch (error) {
    console.error('❌ Error in suggestCategory server action:', error);
    return {
      category: 'Other',
      error: 'Unable to suggest category at this time',
    };
  }
}