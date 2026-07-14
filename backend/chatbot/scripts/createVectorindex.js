
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('../../config/database');
const mongoose = require('mongoose');

async function createVectorIndex() {
  try {
    // Establish atomic database session pool
    await connectDB();
    const db = mongoose.connection.db;
    const collection = db.collection('productembeddings');
    
    const indexName = process.env.VECTOR_INDEX_NAME || 'product_embeddings_index';
    
    // Check if Atlas Search index already exists to avoid redundant compilation
    const searchIndexes = await collection.listSearchIndexes().toArray();
    const existingIndex = searchIndexes.find(idx => idx.name === indexName);
    
    if (existingIndex) {
      console.log('✅ Vector search index already exists:', indexName);
      await mongoose.connection.close();
      process.exit(0);
    }
    
    // Compile and push remote MongoDB Atlas Vector Search Index parameters
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
    
    console.log('🚀 Vector search index created successfully:', result);
    console.log('📋 Atlas Registered Index Name:', indexName);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Critical failure creating Atlas Vector Search Index:', error);
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error('Failed to close mongoose session safely:', closeError);
    }
    process.exit(1);
  }
}

createVectorIndex();


script:


const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('../../config/database');
const mongoose = require('mongoose');

async function createVectorIndex() {
  try {
    // Establish atomic database session pool
    await connectDB();
    const db = mongoose.connection.db;
    const collection = db.collection('productembeddings');
    
    const indexName = process.env.VECTOR_INDEX_NAME || 'product_embeddings_index';
    
    // Check if Atlas Search index already exists to avoid redundant compilation
    const searchIndexes = await collection.listSearchIndexes().toArray();
    const existingIndex = searchIndexes.find(idx => idx.name === indexName);
    
    if (existingIndex) {
      console.log('✅ Vector search index already exists:', indexName);
      await mongoose.connection.close();
      process.exit(0);
    }
    
    // Compile and push remote MongoDB Atlas Vector Search Index parameters
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
    
    console.log('🚀 Vector search index created successfully:', result);
    console.log('📋 Atlas Registered Index Name:', indexName);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Critical failure creating Atlas Vector Search Index:', error);
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error('Failed to close mongoose session safely:', closeError);
    }
    process.exit(1);
  }
}

createVectorIndex();
