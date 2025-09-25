import { DataAPIClient } from '@datastax/astra-db-ts';

// Only initialize if environment variables are available
let client: DataAPIClient | null = null;
let db: any = null;
let expenseCollection: any = null;

if (process.env.ASTRA_DB_APPLICATION_TOKEN && process.env.ASTRA_DB_API_ENDPOINT) {
  client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
  db = client.db(process.env.ASTRA_DB_API_ENDPOINT);
  expenseCollection = db.collection('expense_embeddings');
}

export { db, client, expenseCollection };