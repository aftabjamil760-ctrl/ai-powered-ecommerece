const Product = require('../../models/Product');
const Order = require('../../models/Order');
const ChatMessage = require('../models/ChatMessage');
const vectorStore = require('../utils/vectorStore');

class RecommendationService {
  /**
   * Get personalized recommendations based on user history
   */
  async getPersonalizedRecommendations(userId, limit = 5) {
    try {
      // Get user's order history
      const orders = await Order.find({ userId })
        .populate('products.productId')
        .sort({ createdAt: -1 })
        .limit(10);

      if (orders.length === 0) {
        return await this.getPopularProducts(limit);
      }

      // Get product IDs from user's orders
      const productIds = [];
      orders.forEach(order => {
        order.products.forEach(item => {
          if (item.productId) {
            productIds.push(item.productId._id);
          }
        });
      });

      // Get similar products using vector search
      const uniqueProductIds = [...new Set(productIds)];
      
      // Find similar products
      let recommendations = [];
      
      for (const productId of uniqueProductIds.slice(0, 3)) {
        const product = await Product.findById(productId);
        if (product) {
          const similar = await vectorStore.searchSimilarProducts(
            `${product.name} ${product.category}`,
            3
          );
          recommendations = [...recommendations, ...similar];
        }
      }

      // Remove duplicates and limit
      const seen = new Set();
      const uniqueRecommendations = recommendations.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      return uniqueRecommendations.slice(0, limit);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return await this.getPopularProducts(limit);
    }
  }

  /**
   * Get popular products
   */
  async getPopularProducts(limit = 5) {
    try {
      // Aggregate orders to find popular products
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
        id: item._id,
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
      console.error('Error getting popular products:', error);
      return [];
    }
  }

  /**
   * Get recommendations based on current conversation
   */
  async getConversationBasedRecommendations(chatHistory, limit = 3) {
    try {
      // Extract product mentions from chat
      const productMentions = [];
      for (const msg of chatHistory) {
        if (msg.role === 'user') {
          // Simple keyword extraction (could be enhanced with NLP)
          const words = msg.content.toLowerCase().split(' ');
          for (const word of words) {
            if (word.length > 3) {
              productMentions.push(word);
            }
          }
        }
      }

      // Search for products matching mentioned keywords
      if (productMentions.length > 0) {
        const query = productMentions.slice(0, 5).join(' ');
        const results = await vectorStore.searchSimilarProducts(query, limit);
        return results;
      }

      return await this.getPopularProducts(limit);
    } catch (error) {
      console.error('Error getting conversation-based recommendations:', error);
      return [];
    }
  }

  /**
   * Get product recommendations by category
   */
  async getRecommendationsByCategory(category, limit = 5) {
    try {
      const products = await Product.find({ 
        category: { $regex: category, $options: 'i' },
        stock: { $gt: 0 }
      })
      .sort({ createdAt: -1 })
      .limit(limit);

      return products.map(product => ({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        discount: product.discount,
        category: product.category,
        image: product.image,
        stock: product.stock
      }));
    } catch (error) {
      console.error('Error getting recommendations by category:', error);
      return [];
    }
  }

  /**
   * Get hybrid recommendations (personalized + popular)
   */
  async getHybridRecommendations(userId = null, limit = 5) {
    try {
      let recommendations = [];

      if (userId) {
        // Get personalized recommendations
        const personalized = await this.getPersonalizedRecommendations(userId, Math.ceil(limit / 2));
        recommendations = [...recommendations, ...personalized];
      }

      // Fill remaining with popular products
      const remaining = limit - recommendations.length;
      if (remaining > 0) {
        const popular = await this.getPopularProducts(remaining);
        recommendations = [...recommendations, ...popular];
      }

      // Remove duplicates
      const seen = new Set();
      return recommendations.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    } catch (error) {
      console.error('Error getting hybrid recommendations:', error);
      return await this.getPopularProducts(limit);
    }
  }
}

module.exports = new RecommendationService();