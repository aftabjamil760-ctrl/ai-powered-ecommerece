import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineSparkles, HiOutlineChatAlt2 } from 'react-icons/hi';
import chatbotService from '../../services/ChatbotService';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [userRole, setUserRole] = useState('customer');
  const [cardTransform, setCardTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
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

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateY = ((x - midX) / midX) * 4;
    const rotateX = -((y - midY) / midY) * 4;
    setCardTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseLeave = () => {
    setCardTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
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
    <div
      className="min-h-[calc(100vh-3rem)] p-4 sm:p-6 lg:p-10 bg-[#050914] relative overflow-hidden flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#071029] to-[#060d1f]" />
      <div className="absolute -top-32 -left-28 w-80 h-80 rounded-full bg-gradient-to-tr from-purple-600 via-blue-500 to-cyan-400 opacity-20 blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500 via-purple-700 to-indigo-600 opacity-15 blur-3xl animate-pulse" />
      <div className="absolute top-16 right-20 w-44 h-44 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] opacity-10 blur-2xl" />

      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_35px_120px_-60px_rgba(56,189,248,0.5)]"
        style={{ transform: cardTransform, transition: 'transform 0.3s ease-out' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20">
                <HiOutlineChatAlt2 size={24} />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  {userRole === 'admin' ? 'Admin AI Assistant' : 'Shopping Assistant'}
                </h3>
                <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl">
                  {userRole === 'admin'
                    ? 'Ask about sales, inventory, feedback, and store analytics.'
                    : 'Ask about products, orders, recommendations, or search help.'}
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-sm shadow-slate-900/10">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md">
                <HiOutlineSparkles size={18} />
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Premium AI</p>
                <p className="text-sm font-semibold text-white">Enterprise ready</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-4 mb-6 h-[calc(100vh-22rem)] min-h-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.6)] backdrop-blur-xl">
          <div className="h-full overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
            {messages.length === 0 && (
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-center text-slate-300 shadow-inner shadow-black/10">
                <p className="text-lg font-semibold text-white">👋 Hello! I'm your AI shopping assistant.</p>
                <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">I can help you with analyzing sales, inventory, feedback, and product performance while keeping the same assistant experience.</p>
                {recommendations.length > 0 && (
                  <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl">
                    <p className="text-sm font-semibold text-slate-300 mb-3">🔥 Popular products:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {recommendations.map((item) => (
                        <button key={item.id} className="rounded-full border border-white/10 bg-slate-900/90 px-4 py-2 text-sm text-slate-200 transition hover:border-blue-400 hover:text-white">
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={msg.sender === 'user' ? 'w-full sm:max-w-xl' : 'w-full sm:max-w-xl'}>
                  <div className={`group mb-4 inline-flex max-w-full flex-col gap-3 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={msg.sender === 'user' ? 'rounded-[26px] rounded-br-[10px] bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 p-5 shadow-[0_20px_80px_-40px_rgba(67,56,202,0.8)] transition-transform duration-300 hover:-translate-y-1' : 'rounded-[26px] rounded-bl-[10px] bg-slate-900/85 border border-white/10 p-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1'}>
                      <div className="flex items-center gap-3 text-sm text-slate-300 mb-2">
                        <span className="text-white font-semibold">{msg.sender === 'user' ? 'You' : 'AI Assistant'}</span>
                        <span className="text-slate-500">•</span>
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>
                      <p className={msg.sender === 'user' ? 'text-white text-sm leading-7' : 'text-slate-100 text-sm leading-7'}>{msg.text}</p>
                    </div>
                    {msg.orderStatus && (
                      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300 shadow-lg shadow-black/20">
                        <h4 className="mb-2 text-sm font-semibold text-white">📦 Order Status</h4>
                        <p>Status: <strong>{msg.orderStatus.status}</strong></p>
                        <p>Payment: {msg.orderStatus.paymentStatus}</p>
                        <p>Total: ${msg.orderStatus.totalAmount}</p>
                        {msg.orderStatus.products && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.orderStatus.products.map((item, i) => (
                              <span key={i} className="rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-300">{item.name} x{item.quantity}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {msg.orders && msg.orders.length > 0 && (
                      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300 shadow-lg shadow-black/20">
                        <h4 className="mb-3 text-sm font-semibold text-white">📋 Your Order History ({msg.orders.length})</h4>
                        <div className="flex flex-col gap-3">
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
                              <div key={idx} className="rounded-3xl border border-white/10 bg-slate-950/85 p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <span className="text-sm font-medium text-slate-100">Order #{order._id.substring(0, 8)}...</span>
                                  <span className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: paymentBadgeColor + '20', color: paymentBadgeColor }}>
                                    💳 {order.paymentStatus.toUpperCase()}
                                  </span>
                                  <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: orderBadgeColor + '20', color: orderBadgeColor }}>
                                    📦 {order.orderStatus.toUpperCase()}
                                  </span>
                                </div>
                                <div className="mt-3 text-sm text-slate-300">Total: <strong className="text-white">${order.totalAmount.toFixed(2)}</strong></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300 shadow-lg shadow-black/20">
                        <p className="mb-3 text-sm font-semibold text-white">💡 You might also like:</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.recommendations.map((item) => (
                            <button key={item.id} className="rounded-full border border-white/10 bg-slate-900/90 px-4 py-2 text-sm text-slate-200 transition hover:border-blue-400 hover:text-white">
                              {item.name} - ${item.price}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {(msg.productMeta || (msg.products && msg.products.length > 0)) && (() => {
                      const product = msg.productMeta || msg.products[0];
                      const imageUrl = product.image || null;
                      const pageUrl = product.pageUrl || null;

                      return (
                        <div className="rounded-3xl border border-white/10 bg-slate-950/85 p-4 shadow-lg shadow-black/20">
                          <div className="flex flex-col gap-4 sm:flex-row">
                            {imageUrl && (
                              <div className="min-w-[120px] overflow-hidden rounded-3xl bg-slate-900/80 p-2">
                                <img src={imageUrl} alt={product.name} className="h-full w-full rounded-3xl object-cover" />
                              </div>
                            )}
                            <div className="flex-1 space-y-2 text-sm text-slate-300">
                              <h4 className="text-white text-base font-semibold">{product.name}</h4>
                              <p className="text-slate-400">{product.category}</p>
                              <p className="text-slate-100 font-semibold">${product.discountedPrice ?? product.price}</p>
                              {product.discount > 0 && <p className="text-slate-400">{product.discount}% off</p>}
                              {product.stock !== null && product.stock !== undefined && <p className="text-slate-400">Stock available: {product.stock}</p>}
                              {product.description && <p className="text-slate-400">{product.description}</p>}
                              <div className="flex flex-wrap gap-3 pt-2">
                                {pageUrl && (
                                  <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110">
                                    View product page
                                  </a>
                                )}
                                {imageUrl && (
                                  <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10">
                                    View image
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-[24px] rounded-bl-[10px] bg-slate-900/85 border border-white/10 p-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl">
                  <div className="flex items-center gap-3 text-sm text-slate-300 mb-3">
                    <span className="font-semibold text-white">🤖 AI Assistant</span>
                    <span className="text-slate-500">•</span>
                    <span>{formatTime(new Date())}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-500 animate-[pulse_1.4s_ease-in-out_infinite]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-500 animate-[pulse_1.4s_ease-in-out_infinite_0.2s]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-500 animate-[pulse_1.4s_ease-in-out_infinite_0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 bg-slate-950/70 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={userRole === 'admin'
                ? 'Ask sales, inventory, or feedback analytics questions...'
                : 'Find products, track orders, or ask for recommendations...'}
              rows={2}
              disabled={isLoading}
              className="min-h-[64px] w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 shadow-inner shadow-black/20 outline-none transition duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="inline-flex h-14 items-center justify-center rounded-3xl bg-gradient-to-r from-purple-600 to-blue-500 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? '⏳ Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
