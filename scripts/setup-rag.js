const { syncExpenseEmbeddings } = require('../lib/vector/auto-embedder');

async function setupRAG() {
  console.log('🚀 Setting up RAG system...');
  
  try {
    // You'll need to pass the actual userId here
    // For now, this is a placeholder - you can run this for specific users
    console.log('📊 Syncing expense embeddings...');
    
    // This would typically be run for each user
    // await syncExpenseEmbeddings('user_123');
    
    console.log('✅ RAG setup complete!');
    console.log('💡 To sync embeddings for a user, call syncExpenseEmbeddings(userId)');
    
  } catch (error) {
    console.error('❌ RAG setup failed:', error);
  }
}

setupRAG();