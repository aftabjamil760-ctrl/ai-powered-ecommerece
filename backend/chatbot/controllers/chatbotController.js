const RAGService = require('../services/ragService');
const MemoryService = require('../services/memoryService');
const RecommendationService = require('../services/recommendationService');
const vectorStore = require('../utils/vectorStore');
const Order = require('../../models/Order');
const Product = require('../../models/Product');

class ChatbotController {
  /**
   * Process chat message
   */
  async chat(req, res) {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user?._id || null;

      if (!message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Message is required' 
        });
      }

      // Get or create session
      const session = await MemoryService.getOrCreateSession(
        userId || 'guest',
        sessionId
      );

      // Save user message
      await MemoryService.saveMessage(
        session.sessionId,
        userId || 'guest',
        'user',
        message
      );

      // Get chat history for context
      const chatHistory = await MemoryService.getRecentMessages(session.sessionId, 10);

      // Generate AI response
      const result = await RAGService.generateResponse(
        message,
        userId,
        session.sessionId,
        chatHistory
      );

      // Check if this is an order tracking query
      let orderStatus = null;
      if (result.intent === 'order_tracking' || result.entities.orderId) {
        orderStatus = await this.handleOrderTracking(
          userId,
          result.entities.orderId
        );
      }

      // Get recommendations if applicable
      let recommendations = [];
      if (result.intent === 'recommendation' || result.intent === 'product_search') {
        recommendations = await RecommendationService.getHybridRecommendations(
          userId,
          3
        );
      }

      // Save assistant response
      await MemoryService.saveMessage(
        session.sessionId,
        userId || 'guest',
        'assistant',
        result.response,
        result.intent,
        result.entities,
        {
          products: result.context?.products?.length || 0,
          orders: result.context?.orders?.length || 0,
          processingTime: result.processingTime
        }
      );

      // Update session sentiment
      await MemoryService.updateSentiment(session.sessionId, 'positive');

      res.json({
        success: true,
        data: {
          response: result.response,
          sessionId: session.sessionId,
          intent: result.intent,
          entities: result.entities,
          orderStatus,
          recommendations,
          context: result.context
        }
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Handle order tracking
   */
  async handleOrderTracking(userId, orderId) {
    try {
      let order;
      
      if (orderId) {
        // Find by order ID
        order = await Order.findById(orderId)
          .populate('products.productId');
      } else if (userId) {
        // Find latest order for user
        order = await Order.findOne({ userId })
          .sort({ createdAt: -1 })
          .populate('products.productId');
      }

      if (!order) {
        return {
          found: false,
          message: 'No order found. Please provide your order ID.'
        };
      }

      return {
        found: true,
        orderId: order._id,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        products: order.products.map(item => ({
          name: item.productId?.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress: order.deliveryAddress,
        estimatedDelivery: this.calculateEstimatedDelivery(order.createdAt)
      };
    } catch (error) {
      console.error('Error handling order tracking:', error);
      return {
        found: false,
        error: 'Error retrieving order information'
      };
    }
  }

  /**
   * Calculate estimated delivery date
   */
  calculateEstimatedDelivery(createdAt) {
    const deliveryDate = new Date(createdAt);
    deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days delivery
    return deliveryDate.toISOString().split('T')[0];
  }

  /**
   * Get chat history
   */
  async getHistory(req, res) {
    try {
      const { sessionId } = req.params;
      const { limit = 20 } = req.query;

      if (!sessionId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Session ID is required' 
        });
      }

      const messages = await MemoryService.getChatHistory(sessionId, parseInt(limit));

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Error getting chat history:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Get session context
   */
  async getSessionContext(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Session ID is required' 
        });
      }

      const context = await MemoryService.getSessionContext(sessionId);

      res.json({
        success: true,
        data: context
      });
    } catch (error) {
      console.error('Error getting session context:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Get recommendations
   */
  async getRecommendations(req, res) {
    try {
      const userId = req.user?._id || null;
      const { limit = 5, type = 'hybrid' } = req.query;

      let recommendations;

      switch (type) {
        case 'personalized':
          recommendations = await RecommendationService.getPersonalizedRecommendations(
            userId,
            parseInt(limit)
          );
          break;
        case 'popular':
          recommendations = await RecommendationService.getPopularProducts(
            parseInt(limit)
          );
          break;
        default:
          recommendations = await RecommendationService.getHybridRecommendations(
            userId,
            parseInt(limit)
          );
      }

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * End session
   */
  async endSession(req, res) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Session ID is required' 
        });
      }

      await MemoryService.endSession(sessionId);

      res.json({
        success: true,
        message: 'Session ended successfully'
      });
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Index products for semantic search
   */
  async indexProducts(req, res) {
    try {
      // Admin only endpoint
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Admin access required' 
        });
      }

      const count = await vectorStore.indexAllProducts();

      res.json({
        success: true,
        message: `Indexed ${count} products successfully`,
        data: { indexed: count }
      });
    } catch (error) {
      console.error('Error indexing products:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Search products using semantic search
   */
  async searchProducts(req, res) {
    try {
      const { query, limit = 10 } = req.query;

      if (!query) {
        return res.status(400).json({ 
          success: false, 
          error: 'Search query is required' 
        });
      }

      const results = await vectorStore.searchSimilarProducts(query, parseInt(limit));

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

module.exports = new ChatbotController();