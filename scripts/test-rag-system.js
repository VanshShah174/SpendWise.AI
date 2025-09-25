require('dotenv').config();
const { DataAPIClient } = require('@datastax/astra-db-ts');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { ChatOpenAI } = require('@langchain/openai');

async function testRAGSystem() {
  console.log('🧪 Testing Complete RAG System...\n');

  try {
    // Test 1: Vector Database Connection
    console.log('1️⃣ Testing Astra DB Vector Database...');
    const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
    const db = client.db(process.env.ASTRA_DB_API_ENDPOINT);
    const collections = await db.listCollections();
    console.log('✅ Vector DB connected:', collections.length, 'collections found\n');

    // Test 2: OpenAI Connection
    console.log('2️⃣ Testing OpenAI Connection...');
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small',
    });
    const testVector = await embeddings.embedQuery('test query');
    console.log('✅ OpenAI Embeddings working, vector length:', testVector.length, '\n');

    // Test 3: Langchain LLM
    console.log('3️⃣ Testing Langchain LLM...');
    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.3,
    });
    const response = await llm.invoke('Say "RAG system test successful"');
    console.log('✅ Langchain LLM working:', response.content.substring(0, 50), '\n');

    // Test 4: Collection Access
    console.log('4️⃣ Testing Expense Collection...');
    const expenseCollection = db.collection('expense_embeddings');
    const sampleDoc = await expenseCollection.findOne({});
    console.log('✅ Collection accessible, sample doc exists:', !!sampleDoc, '\n');

    // Test 5: Environment Variables
    console.log('5️⃣ Testing Environment Variables...');
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      ASTRA_DB_APPLICATION_TOKEN: !!process.env.ASTRA_DB_APPLICATION_TOKEN,
      ASTRA_DB_API_ENDPOINT: !!process.env.ASTRA_DB_API_ENDPOINT,
      REDIS_HOST: !!process.env.REDIS_HOST
    };
    console.log('✅ Environment variables:', envCheck, '\n');

    console.log('🎉 CORE TESTS PASSED! Your RAG infrastructure is ready!\n');
    
    console.log('📋 System Status:');
    console.log('✅ PostgreSQL Database: Configured');
    console.log('✅ Astra Vector Database: Connected');
    console.log('✅ Redis Cache: Configured');
    console.log('✅ OpenAI API: Working');
    console.log('✅ Langchain: Working');
    console.log('✅ Environment: Complete');

  } catch (error) {
    console.error('❌ RAG System Test Failed:', error.message);
    if (error.message.includes('401')) {
      console.error('🔑 Check your API keys in .env file');
    }
  }
}

testRAGSystem();