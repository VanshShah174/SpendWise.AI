require('dotenv').config();

async function testChatbotRAG() {
  console.log('🤖 Testing Chatbot with RAG Integration...\n');

  try {
    // Test the new Langchain components directly
    console.log('1️⃣ Testing Intent Classification...');
    const { classifyIntent } = require('../lib/langchain/intent-classifier');
    
    const testMessages = [
      'I spent $15 on coffee this morning',
      'Show me my recent expenses',
      'How much did I spend on food?',
      'Delete my coffee expense'
    ];

    for (const message of testMessages) {
      const intent = await classifyIntent(message);
      console.log(`   "${message}" → ${intent.intent} (${intent.confidence})`);
    }
    console.log('✅ Intent classification working\n');

    // Test smart response generation
    console.log('2️⃣ Testing Smart Response Generation...');
    const { generateSmartExpenseResponse } = require('../lib/langchain/smart-chatbot');
    const response = await generateSmartExpenseResponse('I want to add a coffee expense', 'test-user');
    console.log('✅ Smart response:', response.substring(0, 100) + '...\n');

    // Test expense analysis
    console.log('3️⃣ Testing Expense Analysis...');
    const { analyzeExpenses } = require('../lib/langchain/expense-analyzer');
    const analysis = await analyzeExpenses('What are my spending patterns?');
    console.log('✅ Analysis:', analysis.substring(0, 100) + '...\n');

    console.log('🎉 Chatbot RAG Integration Test Complete!\n');
    
    console.log('📋 Next Steps:');
    console.log('1. Start your Next.js app: npm run dev');
    console.log('2. Test the chatbot in the UI');
    console.log('3. Add some expenses to populate the vector database');
    console.log('4. Ask questions like "How much do I spend on coffee?"');

  } catch (error) {
    console.error('❌ Chatbot RAG Test Failed:', error.message);
  }
}

testChatbotRAG();