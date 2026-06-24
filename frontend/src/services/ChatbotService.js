// services/chatbotService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ChatbotService {
  constructor() {
    this.sessionId = localStorage.getItem('chatSessionId') || null;
  }

  async sendMessage(message) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/chatbot/message`,
        {
          message,
          sessionId: this.sessionId
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      // Store session ID
      if (response.data.data.sessionId) {
        this.sessionId = response.data.data.sessionId;
        localStorage.setItem('chatSessionId', this.sessionId);
      }

      return response.data.data;
    } catch (error) {
      console.error('Chatbot error:', error);
      throw error.response?.data?.error || 'Failed to send message';
    }
  }

  async getHistory(sessionId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/chatbot/history/${sessionId || this.sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  async getRecommendations(limit = 5) {
    try {
      const response = await axios.get(
        `${API_URL}/chatbot/recommendations?limit=${limit}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  async semanticSearch(query, limit = 10) {
    try {
      const response = await axios.get(
        `${API_URL}/chatbot/search?query=${encodeURIComponent(query)}&limit=${limit}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error searching:', error);
      return [];
    }
  }

  async endSession() {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/chatbot/end-session`,
        { sessionId: this.sessionId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      localStorage.removeItem('chatSessionId');
      this.sessionId = null;
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }
}

export default new ChatbotService();