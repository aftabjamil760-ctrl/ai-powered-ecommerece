
const crypto = require('crypto');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');

class MemoryService {
  /**
   * Create or get chat session
   */
  getOrCreateSession = async (userId, sessionId = null) => {
    try {
      if (sessionId) {
        let session = await ChatSession.findOne({ sessionId });

        if (session) {
          session.lastActivity = new Date();
          session.active = true;
          if (!session.userId) session.userId = userId;
          await session.save();
          return session;
        }
      }

      let created = null;
      let attempts = 0;
      while (!created && attempts < 3) {
        attempts += 1;
        const newSession = new ChatSession({
          userId,
          sessionId: sessionId || this.generateSessionId(),
          lastActivity: new Date()
        });

        try {
          created = await newSession.save();
        } catch (error) {
          if (error.code === 11000 && error.keyPattern?.sessionId && !sessionId) {
            continue;
          }
          throw error;
        }
      }

      if (!created) {
        throw new Error('Unable to create a unique chat session.');
      }

      return created;
    } catch (error) {
      console.error('Error getting/creating session:', error);
      throw error;
    }
  };

  /**
   * Generate unique session ID token
   */
  generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  };

  /**
   * Save message to memory with explicit intent guard rails
   */
  saveMessage = async (sessionId, userId, role, content, intent = null, entities = null, metadata = null) => {
    try {
      const validIntents = [
        'general', 'order_tracking', 'order_history', 'order_stats', 
        'product_search', 'recommendation', 'support', 'feedback', 
        'greeting', 'unknown'
      ];
      const safeIntent = intent && validIntents.includes(intent) ? intent : 'general';

      const message = new ChatMessage({
        sessionId,
        userId,
        role,
        content,
        intent: safeIntent,
        entities: entities || {},
        metadata: metadata || {},
        vectorized: false
      });
      await message.save();

      // Update session metrics parameters atomically
      await ChatSession.findOneAndUpdate(
        { sessionId },
        { 
          lastActivity: new Date(),
          $inc: { messageCount: 1 }
        }
      );
      return message;
    } catch (error) {
      console.error('Critical execution fault saving runtime dialogue packet:', error);
      return null;
    }
  };

  /**
   * Get historical chat tracking arrays
   */
  getChatHistory = async (sessionId, limit = 20) => {
    try {
      const messages = await ChatMessage.find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      return messages.reverse();
    } catch (error) {
      console.error('Error getting chat history array:', error);
      return [];
    }
  };

  /**
   * Get recent messages trimmed slice maps for local LLM injection
   */
  getRecentMessages = async (sessionId, limit = 10) => {
    try {
      const messages = await ChatMessage.find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('role content createdAt')
        .lean();
      return messages.reverse();
    } catch (error) {
      console.error('Error compiling recent contextual sequences maps:', error);
      return [];
    }
  };

  /**
   * Summarize conversation based on lexical distribution tracking
   */
  summarizeConversation = async (sessionId) => {
    try {
      const messages = await this.getChatHistory(sessionId, 30);
      if (messages.length === 0) return '';
      
      const topics = [];
      const stopWords = ['please', 'thank', 'would', 'could', 'should', 'about', 'there'];
      
      for (const msg of messages) {
        if (msg.role === 'user') {
          const words = msg.content.toLowerCase().split(/\s+/);
          for (const word of words) {
            const cleanWord = word.replace(/[^a-zA-Z]/g, '');
            if (cleanWord.length > 5 && !stopWords.includes(cleanWord)) {
              topics.push(cleanWord);
            }
          }
        }
      }
      
      const uniqueTopics = [...new Set(topics)].slice(0, 10);
      const generatedSummary = uniqueTopics.length > 0 
        ? `Conversation focused on parameters: ${uniqueTopics.join(', ')}`
        : 'General support inquiry session context';

      await ChatSession.findOneAndUpdate(
        { sessionId },
        { 
          summary: generatedSummary,
          keyTopics: uniqueTopics
        }
      );
      
      return { topics: uniqueTopics, summary: generatedSummary };
    } catch (error) {
      console.error('Telemetry compilation warning under summarizer scope:', error);
      return { topics: [], summary: '' };
    }
  };

  /**
   * Clean up stale/inactive cold records
   */
  cleanupOldSessions = async (days = 7) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const result = await ChatSession.deleteMany({
        lastActivity: { $lt: cutoffDate },
        active: false
      });
      console.log(`🧹 Memory Engine Sweep completed: purged ${result.deletedCount} defunct historical sessions.`);
      return result;
    } catch (error) {
      console.error('Purging runtime execution maps failed safely:', error);
      throw error;
    }
  };

  /**
   * Fetch absolute session state mapping bundles
   */
  getSessionContext = async (sessionId) => {
    try {
      const session = await ChatSession.findOne({ sessionId });
      if (!session) return {};
      
      const recentMessages = await this.getRecentMessages(sessionId, 5);
      return {
        session: {
          id: session.sessionId,
          summary: session.summary,
          keyTopics: session.keyTopics,
          sentiment: session.sentiment,
          lastActivity: session.lastActivity
        },
        recentMessages
      };
    } catch (error) {
      console.error('Error fetching structural pipeline context packets:', error);
      return {};
    }
  };

  getLastSession = async (userId) => {
    try {
      if (!userId) return null;
      const session = await ChatSession.findOne({ userId })
        .sort({ lastActivity: -1 })
        .lean();
      return session;
    } catch (error) {
      console.error('Error finding last chat session:', error);
      return null;
    }
  };

  /**
   * Inject sentiment analysis updates
   */
  updateSentiment = async (sessionId, sentiment) => {
    try {
      await ChatSession.findOneAndUpdate({ sessionId }, { sentiment });
    } catch (error) {
      console.error('Failed to update session telemetry sentiment vector index:', error);
    }
  };

  /**
   * Finalize and seal active interactive execution workflows
   */
  endSession = async (sessionId) => {
    try {
      await ChatSession.findOneAndUpdate(
        { sessionId },
        { 
          active: false,
          updatedAt: new Date()
        }
      );
      
      // Compute final analytics tracking maps seamlessly before lifecycle suspension
      await this.summarizeConversation(sessionId);
    } catch (error) {
      console.error('Error sealing workflow pipeline lifecycle gracefully:', error);
    }
  };
}

module.exports = new MemoryService();