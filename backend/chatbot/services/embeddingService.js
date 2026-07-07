
const ollamaService = require('./ollamaService');

class EmbeddingService {
  constructor() {
    // Single point of configuration for the application's vector processing pipeline
    this.vectorProvider = ollamaService;
  }

  /**
   * Generates a single vector embedding for semantic or semantic-hybrid lookup
   */
  generateEmbedding = async (text) => {
    try {
      return await this.vectorProvider.generateEmbedding(text);
    } catch (error) {
      console.error('Critical execution fault under structural vector extraction sequence:', error);
      throw error;
    }
  };

  /**
   * Generates a batch collection of vector embeddings for bulk product dataset parsing
   */
  generateBatchEmbeddings = async (texts) => {
    try {
      return await this.vectorProvider.generateBatchEmbeddings(texts);
    } catch (error) {
      console.error('Batch vector maps compilation process failure:', error);
      throw error;
    }
  };
}

module.exports = new EmbeddingService();