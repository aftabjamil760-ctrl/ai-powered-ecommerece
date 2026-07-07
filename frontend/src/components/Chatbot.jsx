import React, { useState, useEffect, useRef } from 'react';
import chatbotService from '../services/ChatbotService';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [userRole, setUserRole] = useState('customer');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser?.role) {
      setUserRole(storedUser.role);
    }

    loadRecommendations();
    loadHistory(storedUser?.role || 'customer');
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async (role = 'customer') => {
    try {
      const history = await chatbotService.getHistory(null, role);
      if (history.length > 0) {
        setMessages(history.map(msg => ({
          id: msg._id,
          text: msg.content,
          sender: msg.role === 'user' ? 'user' : 'bot',
          timestamp: msg.createdAt
        })));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const items = await chatbotService.getRecommendations(3);
      setRecommendations(items);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const endpoint = userRole === 'admin' ? '/chatbot/message/admin' : '/chatbot/message/customer';

    try {
      const response = await chatbotService.sendMessage(input, endpoint, userRole);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.response,
        sender: 'bot',
        timestamp: new Date(),
        intent: response.intent,
        orderStatus: response.orderStatus,
        recommendations: response.recommendations,
        productMeta: response.productMeta,
        products: response.products,
        orders: response.orders
      };

      setMessages(prev => [...prev, botMessage]);

      if (response.recommendations?.length > 0) {
        setRecommendations(response.recommendations);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div>
          <h3>{userRole === 'admin' ? '🧠 Admin AI Assistant' : '🤖 Shopping Assistant'}</h3>
          <p className="chatbot-role-note">
            {userRole === 'admin'
              ? 'Ask about sales, inventory, feedback, and store analytics.'
              : 'Ask about products, orders, recommendations, or search help.'}
          </p>
        </div>
        <span className="status-badge">Online</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>👋 Hello! I'm your AI shopping assistant.</p>
            <p>I can help you with:</p>
            <ul>
              <li>🔍 Finding products</li>
              <li>📦 Tracking orders</li>
              <li>💡 Recommendations</li>
              <li>🛍️ General inquiries</li>
            </ul>
            {recommendations.length > 0 && (
              <div className="quick-recommendations">
                <p>🔥 Popular products:</p>
                <div className="recommendation-grid">
                  {recommendations.map((item) => (
                    <button key={item.id} className="rec-btn">
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              <span className="sender">{msg.sender === 'user' ? 'You' : '🤖'}</span>
              <p>{msg.text}</p>
              {msg.orderStatus && (
                <div className="order-status">
                  <h4>📦 Order Status</h4>
                  <p>Status: <strong>{msg.orderStatus.status}</strong></p>
                  <p>Payment: {msg.orderStatus.paymentStatus}</p>
                  <p>Total: ${msg.orderStatus.totalAmount}</p>
                  {msg.orderStatus.products && (
                    <div className="order-products">
                      {msg.orderStatus.products.map((item, i) => (
                        <span key={i}>{item.name} x{item.quantity}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {msg.orders && msg.orders.length > 0 && (
                <div className="order-history">
                  <h4>📋 Your Order History ({msg.orders.length})</h4>
                  <div className="orders-list">
                    {msg.orders.map((order, idx) => {
                      const statusColors = {
                        pending: '#fbbf24',
                        success: '#10b981',
                        failed: '#ef4444',
                        processing: '#3b82f6',
                        shipped: '#a855f7',
                        delivered: '#10b981',
                        cancelled: '#9ca3af'
                      };
                      const paymentBadgeColor = statusColors[order.paymentStatus] || '#6b7280';
                      const orderBadgeColor = statusColors[order.orderStatus] || '#6b7280';
                      
                      return (
                        <div key={idx} className="order-item">
                          <div className="order-header">
                            <span className="order-id">Order #{order._id.substring(0, 8)}...</span>
                            <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="order-badges">
                            <span className="badge" style={{backgroundColor: paymentBadgeColor + '20', color: paymentBadgeColor}}>
                              💳 {order.paymentStatus.toUpperCase()}
                            </span>
                            <span className="badge" style={{backgroundColor: orderBadgeColor + '20', color: orderBadgeColor}}>
                              📦 {order.orderStatus.toUpperCase()}
                            </span>
                          </div>
                          <div className="order-amount">
                            Total: <strong>${order.totalAmount.toFixed(2)}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="recommendations">
                  <p>💡 You might also like:</p>
                  {msg.recommendations.map((item) => (
                    <button key={item.id} className="rec-btn">
                      {item.name} - ${item.price}
                    </button>
                  ))}
                </div>
              )}
              {(msg.productMeta || (msg.products && msg.products.length > 0)) && (() => {
                const product = msg.productMeta || msg.products[0];
                const imageUrl = product.image || null;
                const pageUrl = product.pageUrl || null;

                return (
                  <div className="product-card">
                    {imageUrl && (
                      <div className="product-image-wrapper">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="product-image"
                        />
                      </div>
                    )}
                    <div className="product-details">
                      <h4>{product.name}</h4>
                      <p className="product-category">{product.category}</p>
                      <p className="product-price">${product.discountedPrice ?? product.price}</p>
                      {product.discount > 0 && (
                        <p className="product-discount">{product.discount}% off</p>
                      )}
                      {product.stock !== null && product.stock !== undefined && (
                        <p className="product-stock">Stock available: {product.stock}</p>
                      )}
                      {product.description && (
                        <p className="product-description">{product.description}</p>
                      )}
                      <div className="product-action-row">
                        {pageUrl && (
                          <a
                            href={pageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="product-btn"
                          >
                            View product page
                          </a>
                        )}
                        {imageUrl && (
                          <a
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="product-btn product-btn-secondary"
                          >
                            View image
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
              <span className="timestamp">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message bot-message">
            <div className="message-content">
              <span className="sender">🤖</span>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={userRole === 'admin'
            ? 'Ask sales, inventory, or feedback analytics questions...'
            : 'Find products, track orders, or ask for recommendations...'}
          rows={2}
          disabled={isLoading}
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? '⏳' : 'Send'}
        </button>
      </div>

      <style jsx>{`
        .chatbot-container {
          display: flex;
          flex-direction: column;
          height: 600px;
          max-width: 500px;
          margin: 0 auto;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .chatbot-header {
          padding: 16px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chatbot-header h3 {
          margin: 0;
          font-weight: 600;
        }

        .chatbot-role-note {
          margin: 4px 0 0;
          font-size: 13px;
          color: rgba(255,255,255,0.85);
        }

        .status-badge {
          font-size: 12px;
          background: #4caf50;
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-weight: 500;
        }

        .chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #f8f9fa;
        }

        .welcome-message {
          text-align: center;
          color: #666;
          padding: 20px 0;
        }

        .welcome-message ul {
          list-style: none;
          padding: 0;
          text-align: left;
          max-width: 300px;
          margin: 10px auto;
        }

        .welcome-message ul li {
          padding: 4px 0;
        }

        .message {
          margin-bottom: 16px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .user-message .message-content {
          background: #007bff;
          color: white;
          margin-left: auto;
        }

        .bot-message .message-content {
          background: white;
          color: #333;
        }

        .message-content {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          position: relative;
        }

        .sender {
          font-size: 12px;
          font-weight: 600;
          opacity: 0.7;
          display: block;
          margin-bottom: 4px;
        }

        .message-content p {
          margin: 0 0 8px 0;
          word-wrap: break-word;
        }

        .timestamp {
          font-size: 10px;
          opacity: 0.6;
          display: block;
          margin-top: 4px;
        }

        .order-status {
          background: #f0f8ff;
          padding: 12px;
          border-radius: 8px;
          margin-top: 8px;
          font-size: 14px;
        }

        .order-status h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .order-status p {
          margin: 4px 0;
        }

        .order-products {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 8px;
        }

        .order-products span {
          background: #e3f2fd;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .recommendations {
          margin-top: 12px;
        }

        .recommendations p {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .rec-btn {
          background: #e8f5e9;
          border: none;
          padding: 6px 14px;
          border-radius: 16px;
          font-size: 12px;
          color: #2e7d32;
          cursor: pointer;
          margin: 2px 4px;
          transition: all 0.2s;
        }

        .product-card {
          display: flex;
          gap: 12px;
          margin-top: 12px;
          padding: 14px;
          border-radius: 12px;
          background: #f5f7ff;
          border: 1px solid #dbe4ff;
        }

        .product-image-wrapper {
          width: 120px;
          min-width: 120px;
          overflow: hidden;
          border-radius: 12px;
          background: #fff;
          border: 1px solid #e2e8f0;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .product-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .product-details h4 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
        }

        .product-category,
        .product-description,
        .product-stock,
        .product-discount,
        .product-price {
          margin: 0;
          font-size: 13px;
          line-height: 1.4;
          color: #374151;
        }

        .product-price {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
        }

        .product-action-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .product-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 9999px;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          font-size: 13px;
          transition: background 0.2s;
        }

        .product-btn:hover {
          background: #2563eb;
        }

        .product-btn-secondary {
          background: #eef2ff;
          color: #4338ca;
        }

        .product-btn-secondary:hover {
          background: #e0e7ff;
        }

        .rec-btn:hover {
          background: #c8e6c9;
          transform: scale(1.05);
        }

        .quick-recommendations {
          margin-top: 16px;
          background: white;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .quick-recommendations p {
          font-weight: 600;
          margin-bottom: 8px;
        }

        .recommendation-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .chat-input {
          display: flex;
          gap: 10px;
          padding: 16px;
          background: white;
          border-top: 1px solid #e0e0e0;
        }

        .chat-input textarea {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 20px;
          resize: none;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.4;
          color: #111827;
          background-color: #ffffff;
          outline: none;
          transition: border-color 0.3s;
        }

        .chat-input textarea::placeholder {
          color: #9ca3af;
        }

        .chat-input textarea:focus {
          border-color: #667eea;
        }

        .chat-input textarea:disabled {
          opacity: 0.5;
        }

        .chat-input button {
          padding: 10px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .chat-input button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
        }

        .chat-input button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 4px 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #999;
          border-radius: 50%;
          animation: typing 1.4s infinite both;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% { transform: scale(1); opacity: 0.4; }
          30% { transform: scale(1.2); opacity: 1; }
        }

        .error .message-content {
          background: #f44336;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;