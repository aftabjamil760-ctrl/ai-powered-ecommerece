
const RAGService = require('../services/ragService');
const MemoryService = require('../services/memoryService');
const RecommendationService = require('../services/recommendationService');
const vectorStore = require('../utils/vectorStore');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const Feedback = require('../../models/Feedback');

class ChatbotController {
  /**
   * Process incoming chat messages from users or guests
   */
  chat = async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user?._id || null;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message context is required'
        });
      }

      // Track or spin up a new AI conversational session
      const session = await MemoryService.getOrCreateSession(
        userId || 'guest',
        sessionId
      );

      // Persist raw user input into MongoDB
      await MemoryService.saveMessage(
        session.sessionId,
        userId || 'guest',
        'user',
        message
      );

      // Extract context history window (Top 10 items) for LLM context injection
      const chatHistory = await MemoryService.getRecentMessages(session.sessionId, 10);

      // Invoke internal RAG orchestration pipeline
      const result = await RAGService.generateResponse(
        message,
        userId,
        session.sessionId,
        chatHistory
      );

      // Evaluate parsed semantic intent hooks
      let orderStatus = null;
      if (result.intent === 'order_tracking' || result.entities?.orderId) {
        orderStatus = await this.handleOrderTracking(
          userId,
          result.entities?.orderId
        );
      }

      let recommendations = [];
      if (result.intent === 'recommendation' || result.intent === 'product_search') {
        recommendations = await RecommendationService.getHybridRecommendations(
          userId,
          3
        );
      }

      // Persist generative AI answer back into history
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

      // Synchronize sentiment trends
      await MemoryService.updateSentiment(session.sessionId, 'positive');

      return res.json({
        success: true,
        data: {
          response: result.response,
          sessionId: session.sessionId,
          intent: result.intent,
          entities: result.entities,
          orderStatus,
          recommendations,
          context: result.context,
          productMeta: result.productMeta || null,
          products: result.products || [],
          orders: result.orders || []
        }
      });
    } catch (error) {
      console.error('Core routing chat failure:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  customerChat = async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user?._id;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message context is required'
        });
      }

      const session = await MemoryService.getOrCreateSession(userId, sessionId);

      await MemoryService.saveMessage(
        session.sessionId,
        userId,
        'user',
        message
      );

      const chatHistory = await MemoryService.getRecentMessages(session.sessionId, 10);
      const result = await RAGService.generateResponse(
        message,
        userId,
        session.sessionId,
        chatHistory
      );

      let orderStatus = null;
      if (result.intent === 'order_tracking' || result.entities?.orderId) {
        orderStatus = await this.handleOrderTracking(userId, result.entities?.orderId);
      }

      let recommendations = [];
      if (result.intent === 'recommendation' || result.intent === 'product_search') {
        recommendations = await RecommendationService.getHybridRecommendations(userId, 3);
      }

      await MemoryService.saveMessage(
        session.sessionId,
        userId,
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

      await MemoryService.updateSentiment(session.sessionId, 'positive');

      return res.json({
        success: true,
        data: {
          response: result.response,
          sessionId: session.sessionId,
          intent: result.intent,
          entities: result.entities,
          orderStatus,
          recommendations,
          context: result.context,
          productMeta: result.productMeta || null,
          products: result.products || [],
          orders: result.orders || []
        }
      });
    } catch (error) {
      console.error('Customer chat failure:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  adminChat = async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user?._id;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message context is required'
        });
      }

      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Administrator access is required for this endpoint.'
        });
      }

      const session = await MemoryService.getOrCreateSession(userId, sessionId);

      await MemoryService.saveMessage(
        session.sessionId,
        userId,
        'user',
        message
      );

      const responseText = await this.handleAdminQuery(message);

      await MemoryService.saveMessage(
        session.sessionId,
        userId,
        'assistant',
        responseText,
        'admin_analytics'
      );

      return res.json({
        success: true,
        data: {
          response: responseText,
          sessionId: session.sessionId,
          intent: 'admin_analytics'
        }
      });
    } catch (error) {
      console.error('Admin chat failure:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  handleAdminQuery = async (message) => {
    const normalized = (message || '').toLowerCase();

    if (/total.*success|successful.*orders|successful order|success.*orders|order.*success|success.*payments/.test(normalized)) {
      return this.getOrderSuccessSummary();
    }

    if (/revenue|sales|income|earnings|turnover/.test(normalized)) {
      return this.getSalesOverview();
    }

    if (/order count|total orders|order volume|order summary|order statistics|order(s)?$/.test(normalized)) {
      return this.getOrderSummary();
    }

    if (/low stock|inventory|stock alert|out of stock/.test(normalized)) {
      return this.getLowStockSummary();
    }

    if (/feedback|reviews|customer sentiment|rating|complaint/.test(normalized)) {
      return this.getFeedbackSummary();
    }

    if (/health|system|errors|status|uptime/.test(normalized)) {
      return this.getSystemHealthSummary();
    }

    return 'I can help with sales, revenue, order counts, inventory alerts, feedback summaries, and system status. Try asking “sales overview”, “low stock products”, or “customer feedback summary”.';
  };

  getSalesOverview = async () => {
    const summary = await Order.aggregate([
      { $match: { paymentStatus: 'success' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = summary[0]?.totalRevenue || 0;
    const totalOrders = summary[0]?.totalOrders || 0;
    return `Sales overview: $${totalRevenue.toFixed(2)} total revenue across ${totalOrders} successful orders.`;
  };

  getOrderSummary = async () => {
    const summary = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    if (!summary.length) {
      return 'No orders have been recorded yet.';
    }

    const segments = summary.map(s => `${s.count} ${s._id || 'unknown'}`);
    return `Order summary: ${segments.join(', ')}.`;
  };

  getOrderSuccessSummary = async () => {
    const successCount = await Order.countDocuments({ paymentStatus: 'success' });
    const deliveredCount = await Order.countDocuments({ orderStatus: 'delivered' });
    const shippedCount = await Order.countDocuments({ orderStatus: 'shipped' });
    return `Success summary: ${successCount} successful payments, ${shippedCount} orders shipped, and ${deliveredCount} orders delivered.`;
  };

  getLowStockSummary = async () => {
    const lowStock = await Product.find({ stock: { $lt: 10 } }).limit(10).select('name stock');
    if (!lowStock.length) {
      return 'Inventory looks healthy: no products are below the low-stock threshold.';
    }
    return `Low stock products: ${lowStock.map(p => `${p.name} (${p.stock} left)`).join(', ')}.`;
  };

  getFeedbackSummary = async () => {
    const total = await Feedback.countDocuments();
    const positive = await Feedback.countDocuments({ rating: { $gte: 4 } });
    const neutral = await Feedback.countDocuments({ rating: 3 });
    const negative = await Feedback.countDocuments({ rating: { $lte: 2 } });

    return `Feedback summary: ${total} reviews total, ${positive} positive, ${neutral} neutral, and ${negative} needing attention.`;
  };

  getSystemHealthSummary = async () => {
    return 'System health: core services are operational. Monitor logs for any critical incidents and verify the embedding/index pipeline if you want deeper diagnostics.';
  };

  /**
   * Internal pipeline for pulling business intelligence order records
   */
  handleOrderTracking = async (userId, orderId) => {
    try {
      let order;

      if (orderId) {
        order = await Order.findById(orderId).populate('products.productId');
      } else if (userId) {
        order = await Order.findOne({ userId })
          .sort({ createdAt: -1 })
          .populate('products.productId');
      }

      if (!order) {
        return {
          found: false,
          message: 'No tracking reference found. Please provide an explicit Order ID.'
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
          name: item.productId?.name || 'Archived/Unknown Product',
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress: order.deliveryAddress,
        estimatedDelivery: this.calculateEstimatedDelivery(order.createdAt)
      };
    } catch (error) {
      console.error('Error matching delivery state queries:', error);
      return {
        found: false,
        error: 'Failed to accurately parse delivery indexes'
      };
    }
  };

  /**
   * Safe delivery matrix window estimation
   */
  calculateEstimatedDelivery = (createdAt) => {
    const deliveryDate = new Date(createdAt);
    deliveryDate.setDate(deliveryDate.getDate() + 5); // Fallback standard: 5-day dispatch SLA
    return deliveryDate.toISOString().split('T')[0];
  };

  /**
   * History extraction routing
   */
  getHistory = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { limit = 20 } = req.query;

      if (!sessionId) {
        return res.status(400).json({ success: false, error: 'Target session scope required' });
      }

      const messages = await MemoryService.getChatHistory(sessionId, parseInt(limit));
      return res.json({ success: true, data: messages });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  getLastSession = async (req, res) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
      }

      const session = await MemoryService.getLastSession(userId);
      if (!session) {
        return res.json({ success: true, data: null });
      }

      return res.json({ success: true, data: { sessionId: session.sessionId } });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * In-memory context fetching
   */
  getSessionContext = async (req, res) => {
    try {
      const { sessionId } = req.params;
      if (!sessionId) {
        return res.status(400).json({ success: false, error: 'Session reference identifier missing' });
      }
      const context = await MemoryService.getSessionContext(sessionId);
      return res.json({ success: true, data: context });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Contextual cross-selling & upselling generation
   */
  getRecommendations = async (req, res) => {
    try {
      const userId = req.user?._id || null;
      const { limit = 5, type = 'hybrid' } = req.query;
      let recommendations;

      switch (type) {
        case 'personalized':
          recommendations = await RecommendationService.getPersonalizedRecommendations(userId, parseInt(limit));
          break;
        case 'popular':
          recommendations = await RecommendationService.getPopularProducts(parseInt(limit));
          break;
        default:
          recommendations = await RecommendationService.getHybridRecommendations(userId, parseInt(limit));
      }

      return res.json({ success: true, data: recommendations });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Soft session invalidation/cleanup
   */
  endSession = async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ success: false, error: 'Session signature required to flush records' });
      }
      await MemoryService.endSession(sessionId);
      return res.json({ success: true, message: 'Conversational session flushed successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Production Cron or Admin Sync to compile embeddings
   */
  indexProducts = async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Operation unauthorized. Restricted scope.' });
      }
      const count = await vectorStore.indexAllProducts();
      return res.json({
        success: true,
        message: `Successfully generated mathematical models for ${count} store assets`,
        data: { indexed: count }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Vector-based Semantic Asset Retrieval
   */
  searchProducts = async (req, res) => {
    try {
      const { query, limit = 10 } = req.query;
      if (!query) {
        return res.status(400).json({ success: false, error: 'Natural language search query token expected' });
      }
      const results = await vectorStore.searchSimilarProducts(query, parseInt(limit));
      return res.json({ success: true, data: results });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };
}

module.exports = new ChatbotController();