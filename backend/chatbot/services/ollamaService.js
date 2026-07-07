
require('dotenv').config();
const { ChatOllama, OllamaEmbeddings } = require('@langchain/ollama');
const { createLocalEmbedding } = require('../utils/fallbackUtils');

class OllamaService {
  constructor() {
    this.chatModelName = process.env.OLLAMA_MODEL || process.env.CHATBOT_MODEL || 'qwen2.5:0.5b';
    this.embeddingModelName = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.fallbackMode = String(process.env.CHATBOT_FALLBACK_MODE || 'true').toLowerCase() === 'true';
    
    this.chatFallbackNotified = false;
    this.ollamaAvailable = null;
    this.lastError = null;
    this.availableModels = [];

    // Initialize LangChain Ollama Embeddings class wrapper
    this.embeddings = new OllamaEmbeddings({
      model: this.embeddingModelName,
      baseUrl: this.baseUrl
    });

    this.initializeAvailability().catch((error) => {
      this.lastError = error;
      this.ollamaAvailable = false;
      console.warn('⚠️ Ollama is not reachable yet; chatbot will use fallback responses for now.');
    });
  }

  initializeAvailability = async () => {
    this.ollamaAvailable = await this.checkOllamaAvailability();
    if (this.ollamaAvailable) {
      console.log(`✅ Ollama ready: chat=${this.chatModelName}, embeddings=${this.embeddingModelName}`);
    } else {
      console.warn(`⚠️ Ollama service is unavailable at ${this.baseUrl}.`);
    }
  };

  checkOllamaAvailability = async () => {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Ollama health check returned HTTP status ${response.status}`);
      }
      
      const payload = await response.json();
      this.availableModels = Array.isArray(payload?.models) 
        ? payload.models.map((model) => model?.name || model?.model || '') 
        : [];
        
      return true;
    } catch (error) {
      this.lastError = error;
      return false;
    }
  };

  buildPrompt = (messages) => {
    const promptLines = (messages || [])
      .map((message) => {
        const role = String(message.role || 'user').toUpperCase();
        const content = String(message.content || '').trim();
        return content ? `${role}: ${content}` : null;
      })
      .filter(Boolean);
      
    return `${promptLines.join('\n')}\nASSISTANT:`;
  };

  createFallbackChatResponse = (messages, options = {}) => {
    const lastUserMessage = (messages || [])
      .slice()
      .reverse()
      .find((message) => (message.role || 'user').toLowerCase() === 'user');
      
    const prompt = String(lastUserMessage?.content || 'How can I help you today?').trim();

    if (prompt.length === 0) {
      return 'Hello! I can help with product recommendations, orders, and support.';
    }
    if (/product|buy|shop|recommend|look for|find/i.test(prompt)) {
      return `I can help you browse products. I’m currently using a local fallback response because Ollama is unavailable, but I can still guide you toward relevant items for "${prompt}".`;
    }
    if (/order|delivery|track/i.test(prompt)) {
      return 'I can help with order status. Please share your order ID or email so I can guide you further.';
    }
    
    return `Thanks for your message: "${prompt}". I’m currently using a local fallback response while Ollama is offline. Please ensure Ollama is running locally.`;
  };

  normalizeEmbedding = (embedding) => {
    let values = [];
    if (Array.isArray(embedding)) {
      values = embedding;
    } else if (embedding && Array.isArray(embedding.data)) {
      values = embedding.data;
    }
    return this.ensureEmbeddingDimensions(values);
  };

  ensureEmbeddingDimensions = (values, dimensions = 384) => {
    if (!Array.isArray(values)) return Array(dimensions).fill(0);
    
    const numbers = values.filter((value) => typeof value === 'number' && Number.isFinite(value));
    if (numbers.length === 0) return Array(dimensions).fill(0);
    if (numbers.length === dimensions) return numbers;
    
    if (numbers.length > dimensions) {
      return numbers.slice(0, dimensions);
    }
    
    const padded = [...numbers];
    while (padded.length < dimensions) {
      padded.push(0);
    }
    return padded;
  };

  generateChatCompletion = async (messages, options = {}) => {
    try {
      const formattedMessages = (messages || []).map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : message.role === 'system' ? 'system' : 'user',
        content: String(message.content || '')
      }));

      if (!this.ollamaAvailable && this.fallbackMode) {
        if (!this.chatFallbackNotified) {
          console.info('ℹ️ Ollama chat provider is offline; routing through local fallback matching architecture.');
          this.chatFallbackNotified = true;
        }
        return {
          choices: [{
            message: { content: this.createFallbackChatResponse(formattedMessages, options) }
          }]
        };
      }

      if (this.ollamaAvailable === false && !this.fallbackMode) {
        throw new Error(`Ollama engine unreachable state verified at ${this.baseUrl}`);
      }

      const prompt = this.buildPrompt(formattedMessages);
      const llm = new ChatOllama({
        model: this.chatModelName,
        baseUrl: this.baseUrl,
        temperature: options.temperature ?? 0.7,
        numCtx: options.numCtx ?? 2048,
        numPredict: options.maxTokens ?? 512,
        topP: options.topP ?? 0.95
      });

      const response = await llm.invoke(prompt);
      const content = typeof response?.content === 'string'
        ? response.content
        : String(response?.content || response || '');

      return {
        choices: [{
          message: { content: content.trim() }
        }]
      };
    } catch (error) {
      this.lastError = error;
      if (!this.fallbackMode) throw error;

      if (!this.chatFallbackNotified) {
        console.info('ℹ️ Ollama chat provider runtime exception thrown; switching to local execution context pipelines.');
        this.chatFallbackNotified = true;
      }
      
      return {
        choices: [{
          message: { content: this.createFallbackChatResponse(messages, options) }
        }]
      };
    }
  };

  generateEmbedding = async (text) => {
    try {
      if (!this.ollamaAvailable) {
        return createLocalEmbedding(text);
      }
      const embedding = await this.embeddings.embedQuery(String(text || ''));
      return this.normalizeEmbedding(embedding);
    } catch (error) {
      this.lastError = error;
      if (this.fallbackMode) {
        return createLocalEmbedding(text);
      }
      console.error('Embedding generation runtime crash:', error);
      throw error;
    }
  };

  generateBatchEmbeddings = async (texts) => {
    try {
      if (!this.ollamaAvailable) {
        return (texts || []).map((item) => createLocalEmbedding(item));
      }
      const rawEmbeddings = await this.embeddings.embedDocuments((texts || []).map((item) => String(item || '')));
      return (rawEmbeddings || []).map((embedding) => this.normalizeEmbedding(embedding));
    } catch (error) {
      this.lastError = error;
      if (this.fallbackMode) {
        return (texts || []).map((item) => createLocalEmbedding(item));
      }
      console.error('Batch vector maps compiling failure:', error);
      throw error;
    }
  };
}

module.exports = new OllamaService();