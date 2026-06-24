const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('../config/database');
const RAGService = require('../chatbot/services/ragService');
const vectorStore = require('../chatbot/utils/vectorStore');
const MemoryService = require('../chatbot/services/memoryService');

async function testChatbot() {
  try {
    await connectDB();
    await vectorStore.initialize();

    console.log('🧪 Testing Chatbot...\n');

    // Test 1: Index products
    console.log('📦 Indexing products...');
    await vectorStore.indexAllProducts();

    // Test 2: Test semantic search
    console.log('\n🔍 Testing semantic search...');
    const searchResults = await vectorStore.searchSimilarProducts('wireless headphones', 3);
    console.log('Search results:', searchResults.map(p => p.name).join(', '));

    // Test 3: Test RAG response
    console.log('\n💬 Testing RAG response...');
    const response = await RAGService.generateResponse(
      'I need headphones for my workout',
      'test_user',
      'test_session'
    );
    console.log('AI Response:', response.response);
    console.log('Intent:', response.intent);

    console.log('\n✅ All tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testChatbot();