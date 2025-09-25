import { OpenAIEmbeddings } from '@langchain/openai';
import { expenseCollection } from './astra-client';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'text-embedding-3-small',
});

export async function createExpenseEmbedding(expenseId: string, text: string, metadata: Record<string, unknown>) {
  const vector = await embeddings.embedQuery(text);
  
  await expenseCollection.insertOne({
    _id: expenseId,
    $vector: vector,
    text,
    metadata,
    createdAt: new Date()
  });
}

export async function searchSimilarExpenses(query: string, limit = 5, userId?: string) {
  const queryVector = await embeddings.embedQuery(query);
  
  // Build filter - include userId if provided
  const filter = userId ? { 'metadata.userId': userId } : {};
  
  const results = expenseCollection.find(filter, {
    sort: { $vector: queryVector },
    limit,
    includeSimilarity: true
  });
  
  return results.toArray();
}