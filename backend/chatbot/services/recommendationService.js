
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const ChatMessage = require('../models/ChatMessage');
const vectorStore = require('../utils/vectorStore');

class RecommendationService {
  /**
   * Get personalized recommendations based on user history and vector similarity
   */
  getPersonalizedRecommendations = async (userId, limit = 5) => {
    try {
      if (!userId || userId === 'guest') {
        return await this.getPopularProducts(limit);
      }

      // Get user's recent order patterns
      const orders = await Order.find({ userId })
        .populate('products.productId')
        .sort({ createdAt: -1 })
        .limit(10);
        
      if (orders.length === 0) {
        return await this.getPopularProducts(limit);
      }

      // Gather matching database references safely
      const productIds = [];
      orders.forEach(order => {
        if (order.products) {
          order.products.forEach(item => {
            if (item.productId && item.productId._id) {
              productIds.push(item.productId._id.toString());
            }
          });
        }
      });

      const uniqueProductIds = [...new Set(productIds)];
      let recommendations = [];

      // Vector search relative context expansion up to top 3 products
      for (const productId of uniqueProductIds.slice(0, 3)) {
        const product = await Product.findById(productId);
        if (product) {
          const similar = await vectorStore.searchSimilarProducts(
            `${product.name} ${product.category || ''}`,
            3
          );
          if (Array.isArray(similar)) {
            recommendations = [...recommendations, ...similar];
          }
        }
      }

      // Deduplicate vector models outputs cleanly
      const seen = new Set();
      const uniqueRecommendations = recommendations.filter(item => {
        const itemId = item.id || item._id?.toString();
        if (!itemId || seen.has(itemId)) return false;
        seen.add(itemId);
        return true;
      });

      if (uniqueRecommendations.length === 0) {
        return await this.getPopularProducts(limit);
      }

      return uniqueRecommendations.slice(0, limit);
    } catch (error) {
      console.error('Error compounding personalized vectors mapping:', error);
      return await this.getPopularProducts(limit);
    }
  };

  /**
   * Get popular products via MongoDB aggregation aggregation metrics
   */
  getPopularProducts = async (limit = 5) => {
    try {
      const popularProducts = await Order.aggregate([
        { $unwind: '$products' },
        {
          $group: {
            _id: '$products.productId',
            totalQuantity: { $sum: '$products.quantity' },
            totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' }
      ]);

      return popularProducts.map(item => ({
        id: item._id?.toString(),
        name: item.productDetails.name,
        category: item.productDetails.category,
        price: item.productDetails.price,
        discount: item.productDetails.discount,
        image: item.productDetails.image,
        stock: item.productDetails.stock,
        sales: item.totalQuantity,
        revenue: item.totalRevenue
      }));
    } catch (error) {
      console.error('Error calculating analytical popular data maps:', error);
      return [];
    }
  };

  /**
   * Get recommendations optimized against current dialogue window parameters
   */
  getConversationBasedRecommendations = async (chatHistory, limit = 3) => {
    try {
      const productMentions = [];
      const stopWords = ['please', 'want', 'need', 'show', 'find', 'with', 'have', 'that'];

      for (const msg of (chatHistory || [])) {
        if (msg.role === 'user' && msg.content) {
          const words = msg.content.toLowerCase().split(/\s+/);
          for (const word of words) {
            const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
            if (cleanWord.length > 3 && !stopWords.includes(cleanWord)) {
              productMentions.push(cleanWord);
            }
          }
        }
      }

      if (productMentions.length > 0) {
        const query = productMentions.slice(-5).join(' '); // prioritize latest terms
        const results = await vectorStore.searchSimilarProducts(query, limit);
        if (Array.isArray(results) && results.length > 0) return results;
      }

      return await this.getPopularProducts(limit);
    } catch (error) {
      console.error('Error binding dialogue vector streams:', error);
      return [];
    }
  };

  /**
   * Get product recommendations matching direct categories regex parameters
   */
  getRecommendationsByCategory = async (category, limit = 5) => {
    try {
      if (!category) return [];
      
      const products = await Product.find({ 
        category: { $regex: category, $options: 'i' },
        stock: { $gt: 0 }
      })
      .sort({ createdAt: -1 })
      .limit(limit);

      return products.map(product => ({
        id: product._id?.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        discount: product.discount,
        category: product.category,
        image: product.image,
        stock: product.stock
      }));
    } catch (error) {
      console.error('Error fetching structural category maps:', error);
      return [];
    }
  };

  /**
   * Get dynamic hybrid clusters (Personalized + Analytical Volume Fallbacks)
   */
  getHybridRecommendations = async (userId = null, limit = 5) => {
    try {
      let recommendations = [];
      
      if (userId && userId !== 'guest') {
        const targetSlice = Math.ceil(limit / 2);
        const personalized = await this.getPersonalizedRecommendations(userId, targetSlice);
        if (Array.isArray(personalized)) {
          recommendations = [...recommendations, ...personalized];
        }
      }

      const remaining = limit - recommendations.length;
      if (remaining > 0) {
        const popular = await this.getPopularProducts(remaining);
        if (Array.isArray(popular)) {
          recommendations = [...recommendations, ...popular];
        }
      }

      const seen = new Set();
      return recommendations.filter(item => {
        const itemId = item.id || item._id?.toString();
        if (!itemId || seen.has(itemId)) return false;
        seen.add(itemId);
        return true;
      });
    } catch (error) {
      console.error('Error compiling balanced hybrid recommendations:', error);
      return await this.getPopularProducts(limit);
    }
  };
}

module.exports = new RecommendationService();