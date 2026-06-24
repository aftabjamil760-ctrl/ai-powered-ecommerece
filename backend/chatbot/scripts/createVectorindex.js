const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('../../config/database');
const mongoose = require('mongoose');

async function createVectorIndex() {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    const collection = db.collection('productembeddings');

    // Create vector search index
    const indexName = process.env.VECTOR_INDEX_NAME || 'product_embeddings_index';
    
    // Check if Atlas Search index already exists
    const searchIndexes = await collection.listSearchIndexes().toArray();
    const existingIndex = searchIndexes.find(idx => idx.name === indexName);
    
    if (existingIndex) {
      console.log('✅ Vector index already exists:', indexName);
      return;
    }

    // Create vector search index
    const result = await collection.createSearchIndex({
      name: indexName,
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            path: 'embedding',
            numDimensions: Number(process.env.VECTOR_DIMENSIONS || 384),
            similarity: 'cosine'
          },
          {
            type: 'filter',
            path: 'productId'
          },
          {
            type: 'filter',
            path: 'category'
          }
        ]
      }
    });

    console.log('✅ Vector search index created:', result);
    console.log('📝 Index name:', indexName);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating vector index:', error);
    process.exit(1);
  }
}

createVectorIndex();