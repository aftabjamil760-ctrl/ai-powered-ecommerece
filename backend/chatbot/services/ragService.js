const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const vectorStore = require('../utils/vectorStore');
const { createFallbackResponse, isGeminiUnavailable } = require('../utils/fallbackUtils');

class RAGService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.chatModel = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 2048,
      }
    });
  }

  /**
   * Get relevant context from MongoDB vector store
   */
  async getRelevantContext(query, limit = 5, userId = null) {
    try {
      // Search for similar products
      const products = await vectorStore.searchSimilarProducts(query, limit);
      
      // Get relevant orders if user is authenticated
      let orders = [];
      if (userId && userId !== 'guest') {
        orders = await Order.find({ 
          userId: userId,
          paymentStatus: 'success'
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('products.productId');
      }
      
      return {
        products,
        orders
      };
    } catch (error) {
      console.error('Error getting relevant context:', error);
      return { products: [], orders: [] };
    }
  }

  /**
   * Build system prompt with context
   */
  buildSystemPrompt(context, userInfo = null) {
    let prompt = `You are an AI assistant for an e-commerce store. Your role is to help customers with:

1. Product recommendations and information
2. Order tracking and status updates
3. General customer support
4. Product search and discovery

You have access to the following information:

`;

    if (context.products && context.products.length > 0) {
      prompt += '\n📦 **Available Products:**\n';
      context.products.forEach((product, index) => {
        const discountedPrice = product.discount > 0 
          ? (product.price - (product.price * (product.discount / 100))).toFixed(2)
          : product.price.toFixed(2);
        prompt += `${index + 1}. ${product.name} - $${discountedPrice} (${product.category})\n`;
        if (product.description) {
          prompt += `   Description: ${product.description.substring(0, 100)}...\n`;
        }
        if (product.similarity) {
          prompt += `   Relevance: ${(product.similarity * 100).toFixed(1)}%\n`;
        }
      });
    }

    if (context.orders && context.orders.length > 0) {
      prompt += '\n📋 **Recent Orders:**\n';
      context.orders.forEach((order, index) => {
        const productNames = order.products.map(p => 
          p.productId ? p.productId.name : 'Product'
        ).join(', ');
        prompt += `${index + 1}. Order #${order._id.toString().slice(-6)} - ${order.orderStatus} - $${order.totalAmount}\n`;
        prompt += `   Items: ${productNames}\n`;
      });
    }

    if (userInfo) {
      prompt += `\n👤 **User Information:**\n`;
      prompt += `- Name: ${userInfo.name || 'Guest'}\n`;
      prompt += `- Email: ${userInfo.email || 'Not provided'}\n`;
    }

    prompt += `

**Guidelines:**
1. Be helpful, friendly, and professional
2. Provide accurate product information
3. Help users track their orders
4. If you don't know something, say so
5. Recommend products based on user preferences
6. Keep responses concise but informative
7. Use emojis sparingly to make responses engaging

**Important:** 
- Never share sensitive user information
- If a user asks about orders, ask for order ID or email
- For product recommendations, ask about preferences
- Format prices with $ sign and 2 decimal places

Now, help the user with their query.`;

    return prompt;
  }

  /**
   * Generate response using RAG
   */
  async generateResponse(userMessage, userId = null, sessionId = null, chatHistory = []) {
    try {
      // 1. Get relevant context
      const context = await this.getRelevantContext(userMessage, 5, userId);

      // 2. Get user info if authenticated
      let userInfo = null;
      if (userId && userId !== 'guest') {
        try {
          const User = require('../../models/User');
          const user = await User.findById(userId);
          if (user) {
            userInfo = {
              name: user.name,
              email: user.email,
              role: user.role
            };
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }

      // 3. Build prompt
      const systemPrompt = this.buildSystemPrompt(context, userInfo);

      // 4. Format chat history
      let chatContext = '';
      if (chatHistory && chatHistory.length > 0) {
        const recentMessages = chatHistory.slice(-10);
        chatContext = 'Previous conversation:\n';
        recentMessages.forEach(msg => {
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          chatContext += `${role}: ${msg.content}\n`;
        });
        chatContext += '\n';
      }

      const fullPrompt = `${systemPrompt}\n\n${chatContext}User: ${userMessage}\n\nAssistant:`;

      // 5. Generate response
      const startTime = Date.now();
      let aiResponse;
      try {
        const result = await this.chatModel.generateContent(fullPrompt);
        const response = await result.response;
        aiResponse = response.text();
      } catch (error) {
        if (isGeminiUnavailable(error)) {
          console.warn('Gemini chat unavailable, using fallback response');
          aiResponse = createFallbackResponse(userMessage, context);
        } else {
          throw error;
        }
      }
      const processingTime = Date.now() - startTime;

      // 6. Detect intent and entities
      const intent = this.detectIntent(userMessage);
      const entities = this.extractEntities(userMessage);

      return {
        response: aiResponse,
        intent,
        entities,
        context: {
          products: context.products,
          orders: context.orders
        },
        processingTime
      };
    } catch (error) {
      console.error('Error generating RAG response:', error);
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        intent: 'general',
        entities: {},
        context: { products: [], orders: [] },
        error: error.message
      };
    }
  }

  /**
   * Detect intent from user message
   */
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    const intentPatterns = {
      order_tracking: ['track order', 'where is my order', 'order status', 'delivery', 'shipment'],
      product_search: ['find product', 'search for', 'looking for', 'need a', 'want to buy'],
      recommendation: ['recommend', 'suggest', 'what should i buy', 'best', 'top rated'],
      support: ['help', 'support', 'problem', 'issue', 'not working'],
      feedback: ['feedback', 'review', 'suggestion']
    };

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      for (const pattern of patterns) {
        if (lowerMessage.includes(pattern)) {
          return intent;
        }
      }
    }

    return 'general';
  }

  /**
   * Extract entities from user message
   */
  extractEntities(message) {
    const entities = {};
    const lowerMessage = message.toLowerCase();

    // Extract order ID
    const orderIdMatch = lowerMessage.match(/order\s*#?\s*([a-f0-9]{24})/i);
    if (orderIdMatch) {
      entities.orderId = orderIdMatch[1];
    }

    // Extract product name patterns
    const productMatch = lowerMessage.match(/(?:find|search|looking for|need a)\s+([a-zA-Z\s]+)/i);
    if (productMatch) {
      entities.productQuery = productMatch[1].trim();
    }

    // Extract price ranges
    const priceMatch = lowerMessage.match(/(?:under|below|less than|over|above|more than)\s*\$?(\d+)/i);
    if (priceMatch) {
      entities.priceRange = parseInt(priceMatch[1]);
    }

    return entities;
  }
}

module.exports = new RAGService();