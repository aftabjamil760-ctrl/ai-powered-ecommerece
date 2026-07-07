
// chatbot/utils/vectorStore.js
const ollamaService = require('../services/ollamaService');
const Product = require('../../models/Product');
const ProductEmbedding = require('../models/ProductEmbedding');
const mongoose = require('mongoose');

class VectorStore {
  constructor() {
    this.ollamaService = ollamaService;
    this.initialized = false;
  }

  initialize = async () => {
    if (this.initialized) return;

    if (mongoose.connection.readyState !== 1) {
      throw new Error('Vector store initialization requires an active MongoDB connection');
    }

    this.initialized = true;
    console.log('✅ MongoDB Vector Store initialized successfully (Ollama Router Engine)');
  };

  /**
   * Generate vectors dynamically utilizing active Ollama service layers
   */
  generateEmbedding = async (text) => {
    try {
      return await this.ollamaService.generateEmbedding(text);
    } catch (error) {
      console.error('Vector allocation exception thrown:', error);
      throw error;
    }
  };

  /**
   * Index or upsert product embeddings map structures
   */
  indexProduct = async (product) => {
    try {
      await this.initialize();
      const text = `${product.name} ${product.description || ''} ${product.category || ''}`.trim();
      const embedding = await this.generateEmbedding(text);
      
      const result = await ProductEmbedding.findOneAndUpdate(
        { productId: product._id },
        {
          productId: product._id,
          embedding: embedding,
          text: text,
          metadata: {
            name: product.name,
            category: product.category,
            price: product.price,
            discount: product.discount || 0,
            image: product.image || '',
            stock: product.stock || 0,
            description: product.description || ''
          }
        },
        { upsert: true, returnDocument: 'after' }
      );
      
      console.log(`✅ Indexed product parameters: ${product.name}`);
      return result;
    } catch (error) {
      console.error(`Index update runtime fault for product reference ${product?._id}:`, error);
      return null;
    }
  };

  /**
   * Index all core inventory configurations sequentially
   */
  indexAllProducts = async () => {
    try {
      await this.initialize();
      const products = await Product.find({});
      let indexed = 0;
      
      for (const product of products) {
        const result = await this.indexProduct(product);
        if (result) indexed++;
      }
      
      console.log(`✅ Structural Index processing finalized: ${indexed}/${products.length} records processed.`);
      return indexed;
    } catch (error) {
      console.error('Critical failure execution under global database indexing loop:', error);
      throw error;
    }
  };

  buildSearchFilter = (filter = {}) => {
    const searchFilter = {};
    if (filter.category) {
      searchFilter.category = filter.category;
    }
    if (filter.minPrice != null || filter.maxPrice != null) {
      searchFilter.price = {};
      if (filter.minPrice != null) {
        searchFilter.price.$gte = filter.minPrice;
      }
      if (filter.maxPrice != null) {
        searchFilter.price.$lte = filter.maxPrice;
      }
    }
    return searchFilter;
  };

  buildVectorSearchStage = (queryVector, limit, filter = {}) => {
    const vectorSearchStage = {
      $vectorSearch: {
        index: process.env.VECTOR_INDEX_NAME || 'product_embeddings_index',
        path: 'embedding',
        queryVector,
        numCandidates: Math.max(limit * 10, 10),
        limit
      }
    };
    
    const searchFilter = this.buildSearchFilter(filter);
    if (Object.keys(searchFilter).length > 0) {
      vectorSearchStage.$vectorSearch.filter = searchFilter;
    }
    return vectorSearchStage;
  };

  /**
   * Search similar items deploying native Ollama structural vectors maps
   */
  searchSimilarProducts = async (query, limit = 5, filter = {}) => {
    try {
      await this.initialize();
      const queryEmbedding = await this.generateEmbedding(query);
      const vectorSearchStage = this.buildVectorSearchStage(queryEmbedding, limit, filter);
      
      const results = await ProductEmbedding.aggregate([
        vectorSearchStage,
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $project: {
            id: '$productId',
            name: '$metadata.name',
            category: '$metadata.category',
            price: '$metadata.price',
            discount: '$metadata.discount',
            image: '$metadata.image',
            stock: '$metadata.stock',
            description: '$metadata.description',
            similarity: { $meta: 'vectorSearchScore' },
            product: 1
          }
        },
        {
          $sort: { similarity: -1 }
        }
      ]);
      
      return results;
    } catch (error) {
      console.error('Semantic pipeline search anomaly caught safely:', error);
      return [];
    }
  };

  /**
   * Get relative lookalikes matching internal product references profiles
   */
  getSimilarProducts = async (productId, limit = 5) => {
    try {
      await this.initialize();
      const productEmbedding = await ProductEmbedding.findOne({ productId });
      if (!productEmbedding) return [];
      
      return await ProductEmbedding.aggregate([
        {
          $vectorSearch: {
            index: process.env.VECTOR_INDEX_NAME || 'product_embeddings_index',
            path: 'embedding',
            queryVector: productEmbedding.embedding,
            numCandidates: limit * 10,
            limit: limit + 1
          }
        },
        {
          $match: {
            productId: { $ne: productId }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $project: {
            id: '$productId',
            name: '$metadata.name',
            category: '$metadata.category',
            price: '$metadata.price',
            discount: '$metadata.discount',
            image: '$metadata.image',
            stock: '$metadata.stock',
            description: '$metadata.description',
            similarity: { $meta: 'vectorSearchScore' }
          }
        },
        {
          $sort: { similarity: -1 }
        },
        {
          $limit: limit
        }
      ]);
    } catch (error) {
      console.error('Failed to extract similar context vectors maps safely:', error);
      return [];
    }
  };
}

module.exports = new VectorStore();