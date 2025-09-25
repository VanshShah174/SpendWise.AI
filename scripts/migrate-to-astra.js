const { PrismaClient } = require('@prisma/client');
const { DataAPIClient } = require('@datastax/astra-db-ts');
const { OpenAIEmbeddings } = require('@langchain/openai');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

// ASTRA DB setup
const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT);
const expenseCollection = db.collection('expense_embeddings');

// OpenAI embeddings setup
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small',
});

async function createExpenseEmbedding(expenseId, text, metadata) {
  const vector = await embeddings.embedQuery(text);
  
  await expenseCollection.insertOne({
    _id: expenseId,
    $vector: vector,
    text,
    metadata,
    createdAt: new Date()
  });
}

async function migrateExpensesToAstra() {
  try {
    console.log('🚀 Starting migration to ASTRA DB...');
    
    // Create collection if it doesn't exist
    console.log('📦 Creating expense_embeddings collection...');
    try {
      await db.createCollection('expense_embeddings', {
        vector: {
          dimension: 1536,
          metric: 'cosine'
        }
      });
      console.log('✅ Collection created successfully!');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Collection already exists');
      } else {
        throw error;
      }
    }
    
    // Get all expenses from PostgreSQL
    const expenses = await prisma.record.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Found ${expenses.length} expenses to migrate`);
    
    if (expenses.length === 0) {
      console.log('ℹ️  No expenses found to migrate');
      return;
    }
    
    let migrated = 0;
    let errors = 0;
    
    for (const expense of expenses) {
      try {
        await createExpenseEmbedding(
          expense.id,
          expense.text,
          {
            amount: expense.amount,
            category: expense.category,
            userId: expense.userId,
            date: expense.date
          }
        );
        migrated++;
        console.log(`✅ Migrated: ${expense.text} ($${expense.amount})`);
      } catch (error) {
        errors++;
        console.error(`❌ Failed to migrate expense ${expense.id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successfully migrated: ${migrated} expenses`);
    console.log(`❌ Errors: ${errors} expenses`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateExpensesToAstra();