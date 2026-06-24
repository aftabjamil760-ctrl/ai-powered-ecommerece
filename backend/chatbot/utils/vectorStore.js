const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../../models/Product');
const ProductEmbedding = require('../models/ProductEmbedding');
const mongoose = require('mongoose');
const { createLocalEmbedding, isGeminiUnavailable } = require('./fallbackUtils');

class VectorStore {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_EMBEDDING_MODEL || 'embedding-001'
    });
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    this.initialized = true;
    console.log('✅ MongoDB Vector Store initialized');
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text) {
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      if (isGeminiUnavailable(error)) {
        console.warn('Gemini embedding unavailable, using local fallback embedding');
        return createLocalEmbedding(text);
      }
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Index product embedding
   */
  async indexProduct(product) {
    try {
      await this.initialize();

      // Create text representation of product
      const text = `${product.name} ${product.description || ''} ${product.category}`.trim();
      const embedding = await this.generateEmbedding(text);

      // Upsert embedding
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
        { upsert: true, new: true }
      );

      console.log(`✅ Indexed product: ${product.name}`);
      return result;
    } catch (error) {
      console.error('Error indexing product:', error);
      return null;
    }
  }

  /**
   * Index all products
   */
  async indexAllProducts() {
    try {
      await this.initialize();

      const products = await Product.find({});
      let indexed = 0;

      for (const product of products) {
        const result = await this.indexProduct(product);
        if (result) indexed++;
      }

      console.log(`✅ Indexed ${indexed}/${products.length} products`);
      return indexed;
    } catch (error) {
      console.error('Error indexing all products:', error);
      throw error;
    }
  }

  /**
   * Search similar products using MongoDB Atlas Vector Search
   */
  async searchSimilarProducts(query, limit = 5, filter = {}) {
    try {
      await this.initialize();

      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);

      // Build filter
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

      const vectorSearchStage = {
        $vectorSearch: {
          index: process.env.VECTOR_INDEX_NAME || 'product_embeddings_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: Math.max(limit * 10, 10),
          limit: limit
        }
      };

      if (Object.keys(searchFilter).length > 0) {
        vectorSearchStage.$vectorSearch.filter = searchFilter;
      }

      // Perform vector search using MongoDB Atlas
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
      console.error('Error searching similar products:', error);
      return [];
    }
  }

  /**
   * Delete product embedding
   */
  async deleteProduct(productId) {
    try {
      await this.initialize();
      const result = await ProductEmbedding.deleteOne({ productId });
      console.log(`✅ Deleted embedding for product: ${productId}`);
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting product embedding:', error);
      return false;
    }
  }

  /**
   * Update product embedding
   */
  async updateProduct(product) {
    try {
      await this.deleteProduct(product._id);
      await this.indexProduct(product);
      return true;
    } catch (error) {
      console.error('Error updating product embedding:', error);
      return false;
    }
  }

  /**
   * Get embedding for a specific product
   */
  async getProductEmbedding(productId) {
    try {
      await this.initialize();
      const embedding = await ProductEmbedding.findOne({ productId });
      return embedding;
    } catch (error) {
      console.error('Error getting product embedding:', error);
      return null;
    }
  }

  /**
   * Get similar products based on a product ID
   */
  async getSimilarProducts(productId, limit = 5) {
    try {
      await this.initialize();

      // Get the product embedding
      const productEmbedding = await ProductEmbedding.findOne({ productId });
      if (!productEmbedding) {
        return [];
      }

      // Search for similar products
      const results = await ProductEmbedding.aggregate([
        {
          $vectorSearch: {
            index: 'product_embeddings_index',
            path: 'embedding',
            queryVector: productEmbedding.embedding,
            numCandidates: limit * 10,
            limit: limit + 1 // +1 to exclude the product itself
          }
        },
        {
          $match: {
            productId: { $ne: productId } // Exclude the original product
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

      return results;
    } catch (error) {
      console.error('Error getting similar products:', error);
      return [];
    }
  }
}

module.exports = new VectorStore();