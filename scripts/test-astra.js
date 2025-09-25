const { DataAPIClient } = require('@datastax/astra-db-ts');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function testAstraConnection() {
  try {
    console.log('🔍 Testing ASTRA DB connection...');
    
    console.log('📋 Debug info:');
    console.log('Token starts with:', process.env.ASTRA_DB_APPLICATION_TOKEN?.substring(0, 10) + '...');
    console.log('Endpoint:', process.env.ASTRA_DB_API_ENDPOINT);
    
    if (!process.env.ASTRA_DB_APPLICATION_TOKEN || !process.env.ASTRA_DB_API_ENDPOINT) {
      console.error('❌ Missing ASTRA DB credentials in .env.local');
      console.log('Please add:');
      console.log('ASTRA_DB_APPLICATION_TOKEN="AstraCS:..."');
      console.log('ASTRA_DB_API_ENDPOINT="https://..."');
      return;
    }
    
    const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
    const db = client.db(process.env.ASTRA_DB_API_ENDPOINT);
    
    const collections = await db.listCollections();
    console.log('✅ ASTRA DB connected successfully!');
    console.log('📊 Collections:', collections);
    
    // Create expense_embeddings collection if it doesn't exist
    const expenseCollection = db.collection('expense_embeddings');
    console.log('✅ Expense embeddings collection ready!');
    
  } catch (error) {
    console.error('❌ ASTRA DB connection failed:', error.message);
  }
}

testAstraConnection();