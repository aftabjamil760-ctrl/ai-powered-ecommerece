
const ollamaService = require('./ollamaService');
const vectorStore = require('../utils/vectorStore');
const Product = require('../../models/Product');
const Feedback = require('../../models/Feedback');
const mongoose = require('mongoose');

class RAGService {
  constructor() {
    this.ollamaService = ollamaService;
  }

  isGenericCatalogRequest = (message) => {
    const lowerMessage = String(message || '').toLowerCase();
    return /all products|list all products|show all products|browse( the)? catalog|catalog.*products|products.*catalog|store in database|mongodb atlas|database mongodb/i.test(lowerMessage);
  };

  /**
   * Search products by keywords with relative relevance scoring
   */
  searchProductsByKeywords = async (query, allProducts, limit = 5) => {
    if (!query || allProducts.length === 0) return [];
    
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    
    const scored = allProducts.map(product => {
      let score = 0;
      const nameStr = (product.name || '').toLowerCase();
      const descStr = (product.description || '').toLowerCase();
      const catStr = (product.category || '').toLowerCase();
      
      keywords.forEach(keyword => {
        if (nameStr.includes(keyword)) score += 10;
        if (nameStr.startsWith(keyword)) score += 5;
        if (descStr.includes(keyword)) score += 5;
        if (catStr.includes(keyword)) score += 3;
      });
      
      return { product, score };
    });
    
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  };

  extractProductQuery = (message) => {
    const text = String(message || '');
    const patterns = [
      /(?:find|search for|looking for|need a|need an|want a|want an|give me details of|details of|show details of|show me details of|tell me about|about)\s+(.+?)(?:\s+products?|\s+product|\?|\.|!|$)/i,
      /(?:give this product|product) details?\s+(.+?)(?:\?|\.|!|$)/i,
      /(.+?)\s+products?\s*\??$/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  };

  getProductPageUrl = (product) => {
    const id = product._id?.toString() || product.id?.toString();
    const frontendUrl = String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    return id ? `${frontendUrl}/product/${id}` : null;
  };

  buildProductSummary = (product) => {
    const discountedPrice = product.discount > 0
      ? (product.price - (product.price * (product.discount / 100))).toFixed(2)
      : product.price.toFixed(2);
    
    return {
      id: product._id?.toString() || product.id?.toString() || null,
      name: product.name,
      category: product.category || 'General',
      price: product.price,
      discountedPrice,
      discount: product.discount || 0,
      stock: typeof product.stock === 'number' ? product.stock : null,
      image: product.image || null,
      description: product.description || null,
      pageUrl: this.getProductPageUrl(product)
    };
  };

  buildCatalogGroundedResponse = (userMessage, context = {}, entities = {}, userInfo = null) => {
    const query = String(userMessage || '').trim();
    const products = Array.isArray(context?.products) ? context.products : [];
    const isCatalogRequest = this.isGenericCatalogRequest(userMessage);
    const categoryRegex = entities.category ? new RegExp(entities.category, 'i') : null;
    const priceLimit = entities.priceRange || null;

    if (!query) {
      return { text: 'How can I assist you today?', product: null, products: [] };
    }

    // If no direct product matches were found, provide a clearer fallback for
    // explicit product-type queries (e.g., "headphone"). For generic queries
    // keep the broader guidance to try different terms or browse the catalog.
    if (products.length === 0) {
      const explicitProductKeywords = /headphone|headphones|earbuds|speaker|laptop|phone|camera|monitor|tablet|charger|keyboard|mouse|tv|television/i;
      if (explicitProductKeywords.test(query)) {
        return {
          text: `I couldn't find any matching items in the store for "${query}". It looks like that product isn't available right now — it may arrive in the future.`,
          product: null,
          products: []
        };
      }

      return {
        text: `I couldn't find any matching items in the store for "${query}". Try different terms or type "all products" to browse the catalog.`,
        product: null,
        products: []
      };
    }

    const matchingProducts = products.filter(product => {
      const categoryMatch = categoryRegex ? categoryRegex.test(product.category || '') : true;
      const priceMatch = priceLimit != null ? product.price <= priceLimit : true;
      return categoryMatch && priceMatch;
    });

    const chosenProducts = matchingProducts.length > 0 ? matchingProducts : products;

    if (isCatalogRequest) {
      const productList = chosenProducts.slice(0, 5).map((product, index) => {
        const summary = this.buildProductSummary(product);
        return `${index + 1}. ${summary.name} - $${summary.discountedPrice} (${summary.category})`;
      }).join('\n');

      return {
        text: `Here are some products available in our store:\n${productList}`,
        product: null,
        products: chosenProducts.slice(0, 5).map(p => this.buildProductSummary(p))
      };
    }

    const product = chosenProducts[0];
    const productSummary = this.buildProductSummary(product);
    const discountText = productSummary.discount > 0 ? `Discount: ${productSummary.discount}% off. ` : '';
    const stockText = productSummary.stock !== null ? `Stock available: ${productSummary.stock}. ` : '';
    const pageText = productSummary.pageUrl ? 'You can open the product details page using the link below.' : '';

    return {
      text: `I found a matching product: ${productSummary.name}. Category: ${productSummary.category}. Price: $${productSummary.discountedPrice}. ${discountText}${stockText}${pageText}`.trim(),
      product: productSummary,
      products: [productSummary]
    };
  };

  buildSystemPrompt = (context, userInfo = null) => {
    let prompt = `You are an expert AI customer support agent for our e-commerce platform. Assist customers with:
1. Product specifications, configurations, and inventory status
2. Direct tracking updates and payment flow logs
3. Cross-selling or hybrid catalog recommendations
4. General technical or business support questions\n`;

    if (context.products && context.products.length > 0) {
      prompt += '\n📦 **Live Inventory Context:**\n';
      context.products.forEach((product, index) => {
        const summary = this.buildProductSummary(product);
        prompt += `${index + 1}. ${summary.name} - $${summary.discountedPrice} (${summary.category})\n`;
        if (summary.description) {
          prompt += `   Context: ${summary.description.substring(0, 100)}...\n`;
        }
      });
    }

    if (context.orders && context.orders.length > 0) {
      prompt += '\n📊 **Recent Orders History Context:**\n';
      context.orders.forEach((order, index) => {
        prompt += `${index + 1}. Order Reference #${order._id} - Status: ${order.orderStatus.toUpperCase()} - Final Amount: $${order.totalAmount}\n`;
      });
    }

    if (userInfo) {
      prompt += `\n👤 **Customer Account Profile:**\n- Name: ${userInfo.name || 'Guest'}\n- Email: ${userInfo.email || 'Anonymous'}\n`;
    }

    prompt += `\n**Core Guidelines:**
1. Be ultra-professional, friendly, and structured.
2. Ground arguments strictly in provided data records.
3. If specific order info is missing, politely query for an Order Reference Token.
4. Keep interactions context-driven and lightning-fast.`;
    return prompt;
  };

  async getRecommendationsForUser(userId, orders, availableProducts) {
    try {
      const purchasedCategories = new Set();
      const purchasedProductIds = new Set();
      
      if (orders && orders.length > 0) {
        orders.forEach(order => {
          if (order.products) {
            order.products.forEach(item => {
              if (item.productId) {
                const idStr = item.productId?._id?.toString() || item.productId;
                purchasedProductIds.add(idStr);
                if (item.productId?.category) {
                  purchasedCategories.add(item.productId.category);
                }
              }
            });
          }
        });
      }
      
      let recommendedProducts = [];
      if (purchasedCategories.size > 0) {
        recommendedProducts = await Product.find({
          category: { $in: Array.from(purchasedCategories) },
          _id: { $nin: Array.from(purchasedProductIds) }
        })
        .sort({ createdAt: -1, discount: -1 })
        .limit(5);
      }
      
      if (recommendedProducts.length < 5) {
        const additional = await Product.find({
          _id: { $nin: Array.from(purchasedProductIds) }
        })
        .sort({ discount: -1, createdAt: -1 })
        .limit(5 - recommendedProducts.length);
        recommendedProducts = [...recommendedProducts, ...additional];
      }
      
      const formattedProducts = recommendedProducts.map(p => this.buildProductSummary(p));
      let responseText = '✨ Based on your shopping history, here are tailored suggestions for you:\n\n';
      
      formattedProducts.forEach((product, index) => {
        const badge = product.discount > 0 ? `🔥 ${product.discount}% OFF` : '';
        responseText += `${index + 1}. **${product.name}** - $${product.discountedPrice} ${badge}\n   Category: ${product.category}\n\n`;
      });
      
      return { text: responseText.trim(), products: formattedProducts };
    } catch (error) {
      console.error('Error compiling smart recommendations:', error);
      return { text: "Check out our catalog to find fresh trending gear!", products: [] };
    }
  }

  normalizeProductCandidate = async (candidate) => {
    if (!candidate) return null;
    if (typeof candidate === 'string' || mongoose.Types.ObjectId.isValid(candidate)) {
      return await Product.findById(candidate);
    }

    if (candidate._id) {
      const resolved = await Product.findById(candidate._id);
      return resolved || candidate;
    }

    if (candidate.id) {
      const resolved = await Product.findById(candidate.id);
      return resolved || candidate;
    }

    if (candidate.name) {
      const regex = new RegExp(`^${candidate.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      return await Product.findOne({ name: regex }) || candidate;
    }

    return null;
  };

  getProductFeedback = async (userId, context = {}, userMessage = '') => {
    try {
      let product = null;
      let productCandidates = Array.isArray(context.products) ? context.products : [];

      if (productCandidates.length > 0) {
        product = await this.normalizeProductCandidate(productCandidates[0]);
      }

      if (!product && context.orders && context.orders.length > 0) {
        const latestOrder = context.orders[0];
        const firstItem = latestOrder.products && latestOrder.products[0];
        if (firstItem && firstItem.productId) {
          product = await this.normalizeProductCandidate(firstItem.productId);
        }
      }

      if (!product && userId && userId !== 'guest') {
        const latestFeedback = await Feedback.findOne({ userId }).sort({ createdAt: -1 }).populate('productId');
        if (latestFeedback?.productId) {
          product = await this.normalizeProductCandidate(latestFeedback.productId);
        }
      }

      if (!product) {
        const productQuery = this.extractProductQuery(userMessage);
        if (productQuery) {
          product = await Product.findOne({
            $or: [
              { name: new RegExp(productQuery, 'i') },
              { description: new RegExp(productQuery, 'i') },
              { category: new RegExp(productQuery, 'i') }
            ]
          });
        }
      }

      if (!product) {
        return {
          text: 'I could not identify a specific product to show feedback for. Please ask about a specific product name or provide your last order details.',
          product: null,
          products: [],
          feedback: []
        };
      }

      const feedbackDocs = await Feedback.find({ productId: product._id }).sort({ createdAt: -1 }).limit(3).populate('userId', 'name');
      const productSummary = this.buildProductSummary(product);

      if (!feedbackDocs.length) {
        return {
          text: `There is no posted feedback yet for ${productSummary.name}. Ask again when customers have reviewed it, or try another product.`,
          product: productSummary,
          products: [productSummary],
          feedback: []
        };
      }

      let text = `Feedback for ${productSummary.name} (${productSummary.category}):\n`;
      feedbackDocs.forEach((fb, index) => {
        const reviewer = fb.userId?.name || 'Anonymous';
        const rating = fb.rating || 'N/A';
        const comment = fb.comment ? fb.comment.trim() : 'No comment provided.';
        text += `\n${index + 1}. ${reviewer} rated it ${rating}/5\n   “${comment}”\n`;
      });

      return {
        text: text.trim(),
        product: productSummary,
        products: [productSummary],
        feedback: feedbackDocs
      };
    } catch (error) {
      console.error('Error retrieving product feedback:', error);
      return {
        text: 'I had trouble fetching feedback details right now. Please try again later.',
        product: null,
        products: [],
        feedback: []
      };
    }
  }

  buildOrderHistoryResponse = (orders) => {
    if (!orders || orders.length === 0) {
      return { text: "No transactional records tracked yet. Let's make your first purchase!", formattedOrders: [] };
    }
    
    const formattedOrders = orders.map(order => ({
      _id: order._id.toString(),
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      products: order.products.map(item => ({
        productId: item.productId?._id?.toString() || item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      deliveryAddress: order.deliveryAddress
    }));
    
    let responseText = `📂 Verified Account History (${orders.length} active record${orders.length !== 1 ? 's' : ''}):\n\n`;
    orders.forEach((order, index) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      const pBadge = order.paymentStatus === 'success' ? '✅' : '⏳';
      const sBadge = order.orderStatus === 'delivered' ? '📦' : '🚚';
      
      responseText += `${index + 1}. **Order ID: #${order._id.toString().substring(0, 8)}...**\n`;
      responseText += `   📅 Date: ${date} | ${pBadge} Payment: ${order.paymentStatus.toUpperCase()}\n`;
      responseText += `   ${sBadge} Logistics Status: ${order.orderStatus.toUpperCase()} | Total: $${order.totalAmount.toFixed(2)}\n\n`;
    });
    
    return { text: responseText.trim(), formattedOrders };
  };

  getOrderStats = async (userId, orders) => {
    if (!userId || !orders || orders.length === 0) {
      return { text: "No telemetry metrics data for empty orders profiles.", stats: {} };
    }
    
    const stats = { total: orders.length, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(order => {
      const status = order.orderStatus?.toLowerCase() || 'unknown';
      if (stats[status] !== undefined) stats[status]++;
    });
    
    let text = '📈 **Your Order Processing Metrics Summary:**\n\n';
    text += `🔹 Total Purchases Placed: ${stats.total}\n`;
    text += `🔹 Processing State: ${stats.processing} | Shipped: ${stats.shipped}\n`;
    text += `🔹 Fulfilled/Delivered: ${stats.delivered} | Cancelled: ${stats.cancelled}\n`;
    return { text, stats };
  };

  /**
   * Primary entrypoint orchestration lifecycle hook
   */
  generateResponse = async (userMessage, userId = null, sessionId = null, chatHistory = []) => {
    try {
      const entities = this.extractEntities(userMessage);
      const context = await this.getRelevantContext(userMessage, userId, 5, entities);
      
      let userInfo = null;
      if (userId && userId !== 'guest') {
        try {
          const User = require('../../models/User');
          const user = await User.findById(userId);
          if (user) userInfo = { name: user.name, email: user.email, role: user.role };
        } catch (err) {
          console.error('User reference parsing failed safely:', err);
        }
      }
      
      const intent = this.detectIntent(userMessage);
      const isProductQuery = intent === 'product_search' || this.isGenericCatalogRequest(userMessage) || /product|headphone|headphones|laptop|phone|speaker|earbuds|outfit|dress|suit|shirt|jacket|pants|shorts|summer|wedding|clothing|apparel/i.test(userMessage) || entities.productId || entities.category;
      
      if (intent === 'recommendation') {
        const recs = await this.getRecommendationsForUser(userId, context.orders, context.products);
        return {
          response: recs.text,
          intent,
          entities,
          context: { products: recs.products || [], orders: context.orders || [] },
          products: recs.products || [],
          processingTime: 0,
          model: this.ollamaService.chatModelName
        };
      }
      
      if (isProductQuery) {
        const catalogReply = this.buildCatalogGroundedResponse(userMessage, context, entities, userInfo);
        return {
          response: catalogReply.text,
          intent,
          entities,
          context: { products: context.products || [], orders: context.orders || [] },
          productMeta: catalogReply.product,
          products: catalogReply.products || [],
          processingTime: 0,
          model: this.ollamaService.chatModelName
        };
      }
      
      if (intent === 'order_stats') {
        const statsRes = await this.getOrderStats(userId, context.orders);
        return {
          response: statsRes.text,
          intent,
          entities,
          context: { products: [], orders: context.orders || [] },
          stats: statsRes.stats,
          processingTime: 0,
          model: this.ollamaService.chatModelName
        };
      }
      
      if (intent === 'order_history') {
        const histRes = this.buildOrderHistoryResponse(context.orders);
        return {
          response: histRes.text,
          intent,
          entities,
          context: { products: [], orders: context.orders || [] },
          orders: histRes.formattedOrders || [],
          processingTime: 0,
          model: this.ollamaService.chatModelName
        };
      }

      if (intent === 'feedback') {
        const feedbackRes = await this.getProductFeedback(userId, context, userMessage);
        return {
          response: feedbackRes.text,
          intent,
          entities,
          context: {
            products: feedbackRes.products || context.products || [],
            orders: context.orders || []
          },
          productMeta: feedbackRes.product || null,
          products: feedbackRes.products || [],
          feedback: feedbackRes.feedback || [],
          processingTime: 0,
          model: this.ollamaService.chatModelName
        };
      }
      
      // Execute standard generative fallback loop through Ollama service
      const systemPrompt = this.buildSystemPrompt(context, userInfo);
      let formattedMessages = [{ role: 'system', content: systemPrompt }];
      
      if (chatHistory && chatHistory.length > 0) {
        chatHistory.slice(-10).forEach(msg => {
          formattedMessages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
        });
      }
      formattedMessages.push({ role: 'user', content: userMessage });
      
      const startTime = Date.now();
      const result = await this.ollamaService.generateChatCompletion(formattedMessages, {
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.95
      });
      const processingTime = Date.now() - startTime;
      
      const aiResponse = result.choices?.[0]?.message?.content || result.generated_text || 'Acknowledged, let me know if you need specific details.';
      
      return {
        response: aiResponse,
        intent,
        entities,
        context: { products: context.products || [], orders: context.orders || [] },
        processingTime,
        model: this.ollamaService.chatModelName
      };
    } catch (error) {
      console.error('Critical failure in core RAG orchestration pipeline:', error);
      return {
        response: "I'm having trouble retrieving that information right now. Please reload the interface or check back in a few moments.",
        intent: 'general',
        entities: {},
        context: { products: [], orders: [] },
        error: error.message
      };
    }
  };

  async getRelevantContext(query, userId = null, limit = 5, entities = {}) {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
      }
      
      const isCatalogRequest = this.isGenericCatalogRequest(query);
      const productQuery = this.extractProductQuery(query) || String(query || '').trim();
      let products = [];
      
      if (entities?.productId) {
        if (mongoose.Types.ObjectId.isValid(entities.productId)) {
          const product = await Product.findById(entities.productId);
          if (product) products = [product];
        }
        
        if (products.length === 0) {
          const all = await Product.find({});
          const matched = all.find(p => p._id.toString().startsWith(entities.productId.toLowerCase()));
          if (matched) products = [matched];
        }
      }
      
      if (products.length === 0) {
        if (isCatalogRequest) {
          products = await Product.find({}).sort({ createdAt: -1 }).limit(limit);
        } else if (productQuery) {
          const escaped = productQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escaped, 'i');
          
          products = await Product.find({
            $or: [{ name: regex }, { description: regex }, { category: regex }]
          }).sort({ createdAt: -1 }).limit(limit);
          
          if (products.length === 0) {
            const all = await Product.find({});
            products = await this.searchProductsByKeywords(productQuery, all, limit);
          }
          if (products.length === 0) {
            const explicitProductKeywords = /headphone|headphones|earbuds|speaker|laptop|phone|camera|monitor|tablet|charger|keyboard|mouse|tv|television/i;
            if (explicitProductKeywords.test(productQuery)) {
              // If the user asked for a clear product type (e.g., "headphone") and
              // no exact or keyword matches were found, avoid returning semantically
              // similar but unrelated items from the vector store. Leave products
              // empty so the controller can show an appropriate "not available" message.
              products = [];
            } else {
              products = await vectorStore.searchSimilarProducts(productQuery, limit);
            }
          }
        }
      }
      
      let orders = [];
      if (userId && userId !== 'guest') {
        const Order = require('../../models/Order');
        orders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(50).populate('products.productId');
      }
      
      return { products, orders };
    } catch (error) {
      console.error('Error compounding context maps extraction:', error);
      return { products: [], orders: [] };
    }
  }

  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    const recPatterns = ['recommend', 'suggest', 'what should i buy', 'best', 'top rated', 'mostly like', 'prefer', 'favorite', 'product i like', 'which product', 'what product', 'similar', 'comparable', 'alternatives', 'like these', 'like this', 'similar to', 'what else', 'anything like'];
    for (const pattern of recPatterns) {
      if (lowerMessage.includes(pattern)) return 'recommendation';
    }
    
    const intentPatterns = {
      order_stats: ['how many orders', 'order count', 'pending orders', 'shipped orders', 'order statistics', 'order summary', 'my order stats'],
      order_history: ['order history', 'my orders', 'last order', 'recent orders', 'all orders', 'view orders', 'show my orders', 'record of my order'],
      order_tracking: ['track order', 'where is my order', 'order status', 'delivery', 'shipment', 'track my order', 'order id'],
      product_search: ['find product', 'search for', 'looking for', 'need a', 'want to buy', 'product id', 'show me product', 'find me', 'search product', 'give me details', 'details of', 'show details', 'tell me about', 'product details'],
      support: ['help', 'support', 'problem', 'issue', 'not working'],
      feedback: ['feedback', 'review', 'suggestion']
    };
    
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      for (const pattern of patterns) {
        if (lowerMessage.includes(pattern)) return intent;
      }
    }
    return 'general';
  }

  extractEntities(message) {
    const entities = {};
    const lowerMessage = message.toLowerCase();
    
    const orderIdMatch = lowerMessage.match(/order\s*(?:#|id)?\s*:?\s*([a-f0-9]{24}|[a-f0-9]{8,})/i);
    if (orderIdMatch) entities.orderId = orderIdMatch[1];
    
    const productIdMatch = lowerMessage.match(/product\s*(?:id)?\s*:?\s*([a-f0-9]{24}|[a-f0-9]{8,})/i);
    if (productIdMatch) {
      entities.productId = productIdMatch[1];
    } else if (!lowerMessage.includes('order') && !lowerMessage.includes('tracking')) {
      const standaloneIdMatch = lowerMessage.match(/\b([a-f0-9]{8,})\b/);
      if (standaloneIdMatch) entities.productId = standaloneIdMatch[1];
    }
    
    const patterns = [
      /(?:find|search|looking for|need a|need an|want|give me|show me|details of)\s+([a-zA-Z0-9\s]+?)(?:\?|$)/i,
      /(?:product|item)\s+(?:called|named)\s+([a-zA-Z0-9\s]+?)(?:\?|$)/i,
      /([a-zA-Z0-9\s]+?)\s+(?:shirt|jacket|dress|pants|shoes|laptop|phone|headphone|speaker)/i
    ];
    
    for (const pattern of patterns) {
      const match = lowerMessage.match(pattern);
      if (match && match[1] && !entities.productId) {
        entities.productQuery = match[1].trim();
        break;
      }
    }
    
    const priceMatch = lowerMessage.match(/(?:under|below|less than|over|above|more than)\s*\$?(\d+)/i);
    if (priceMatch) entities.priceRange = parseInt(priceMatch[1]);
    
    return entities;
  }
}

module.exports = new RAGService();