const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');

class MemoryService {
  /**
   * Create or get chat session
   */
  async getOrCreateSession(userId, sessionId = null) {
    try {
      if (sessionId) {
        // Try to find existing session
        let session = await ChatSession.findOne({ 
          sessionId,
          userId,
          active: true
        });

        if (session) {
          // Update last activity
          session.lastActivity = new Date();
          await session.save();
          return session;
        }
      }

      // Create new session
      const newSession = new ChatSession({
        userId,
        sessionId: sessionId || this.generateSessionId(),
        lastActivity: new Date()
      });

      await newSession.save();
      return newSession;
    } catch (error) {
      console.error('Error getting/creating session:', error);
      throw error;
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save message to memory
   */
  async saveMessage(sessionId, userId, role, content, intent = null, entities = null, metadata = null) {
    try {
      const message = new ChatMessage({
        sessionId,
        userId,
        role,
        content,
        intent: intent || 'general',
        entities: entities || {},
        metadata: metadata || {},
        vectorized: false
      });

      await message.save();

      // Update session's last activity
      await ChatSession.findOneAndUpdate(
        { sessionId },
        { 
          lastActivity: new Date(),
          $inc: { messageCount: 1 }
        }
      );

      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  /**
   * Get chat history
   */
  async getChatHistory(sessionId, limit = 20) {
    try {
      const messages = await ChatMessage.find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return messages.reverse();
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  /**
   * Get recent messages for context
   */
  async getRecentMessages(sessionId, limit = 10) {
    try {
      const messages = await ChatMessage.find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('role content createdAt')
        .lean();

      return messages.reverse();
    } catch (error) {
      console.error('Error getting recent messages:', error);
      return [];
    }
  }

  /**
   * Summarize conversation
   */
  async summarizeConversation(sessionId) {
    try {
      const messages = await this.getChatHistory(sessionId, 30);
      
      if (messages.length === 0) {
        return '';
      }

      // Extract key topics
      const topics = [];
      for (const msg of messages) {
        if (msg.role === 'user') {
          // Simple topic extraction (could use AI for better summarization)
          const words = msg.content.toLowerCase().split(' ');
          for (const word of words) {
            if (word.length > 5 && !['please', 'thank', 'would', 'could'].includes(word)) {
              topics.push(word);
            }
          }
        }
      }

      // Get unique topics
      const uniqueTopics = [...new Set(topics)].slice(0, 10);

      // Update session summary
      await ChatSession.findOneAndUpdate(
        { sessionId },
        { 
          summary: `Conversation about: ${uniqueTopics.join(', ')}`,
          keyTopics: uniqueTopics
        }
      );

      return {
        topics: uniqueTopics,
        summary: `Conversation about: ${uniqueTopics.join(', ')}`
      };
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      return { topics: [], summary: '' };
    }
  }

  /**
   * Clean up old sessions
   */
  async cleanupOldSessions(days = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await ChatSession.deleteMany({
        lastActivity: { $lt: cutoffDate },
        active: false
      });

      console.log(`Cleaned up ${result.deletedCount} old sessions`);
      return result;
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      throw error;
    }
  }

  /**
   * Get session context with user preferences
   */
  async getSessionContext(sessionId) {
    try {
      const session = await ChatSession.findOne({ sessionId });
      
      if (!session) {
        return {};
      }

      // Get recent messages for context
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
      console.error('Error getting session context:', error);
      return {};
    }
  }

  /**
   * Update session sentiment
   */
  async updateSentiment(sessionId, sentiment) {
    try {
      await ChatSession.findOneAndUpdate(
        { sessionId },
        { sentiment }
      );
    } catch (error) {
      console.error('Error updating sentiment:', error);
    }
  }

  /**
   * End session
   */
  async endSession(sessionId) {
    try {
      await ChatSession.findOneAndUpdate(
        { sessionId },
        { 
          active: false,
          updatedAt: new Date()
        }
      );
      
      // Summarize before ending
      await this.summarizeConversation(sessionId);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }
}

module.exports = new MemoryService();
async function saveMessage(sessionId, userId, role, content, intent = null, entities = null, metadata = null) {
  try {
    // Ensure intent is valid
    const validIntents = ['general', 'order_tracking', 'product_search', 'recommendation', 'support', 'feedback', 'greeting', 'unknown'];
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

    // Update session's last activity
    await ChatSession.findOneAndUpdate(
      { sessionId },
      { 
        lastActivity: new Date(),
        $inc: { messageCount: 1 }
      }
    );

    return message;
  } catch (error) {
    console.error('Error saving message:', error);
    // Don't throw, just log the error
    return null;
  }
}