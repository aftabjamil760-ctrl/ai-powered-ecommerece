// services/chatbotService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ChatbotService {
  constructor() {
    this.role = 'customer';
    this.sessionId = null;
  }

  getSessionKey(role = 'customer') {
    return `chatSessionId_${role}`;
  }

  getSessionId(role = 'customer') {
    return localStorage.getItem(this.getSessionKey(role));
  }

  setSessionId(sessionId, role = 'customer') {
    if (!sessionId) return;
    localStorage.setItem(this.getSessionKey(role), sessionId);
    if (role === this.role) {
      this.sessionId = sessionId;
    }
  }

  clearSessionId(role = 'customer') {
    localStorage.removeItem(this.getSessionKey(role));
    if (role === this.role) {
      this.sessionId = null;
    }
  }

  async loadSession(role = 'customer') {
    this.role = role;
    this.sessionId = this.getSessionId(role);

    if (this.sessionId) {
      return this.sessionId;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      const response = await axios.get(`${API_URL}/chatbot/session`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sessionId = response.data?.data?.sessionId || null;
      if (sessionId) {
        this.setSessionId(sessionId, role);
      }
      return sessionId;
    } catch (error) {
      console.error('Error loading last chatbot session:', error);
      return null;
    }
  }

  async sendMessage(message, apiPath = '/chatbot/message/customer', role = 'customer') {
    try {
      this.role = role;
      this.sessionId = this.getSessionId(role);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}${apiPath}`,
        {
          message,
          sessionId: this.sessionId
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      // Store session ID
      if (response.data.data?.sessionId) {
        this.setSessionId(response.data.data.sessionId, role);
      }

      return response.data.data;
    } catch (error) {
      console.error('Chatbot error:', error);
      throw error.response?.data?.error || 'Failed to send message';
    }
  }

  async getHistory(sessionId = null, role = 'customer') {
    try {
      this.role = role;
      let id = sessionId || this.getSessionId(role);
      if (!id) {
        id = await this.loadSession(role);
      }
      if (!id) {
        return [];
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/chatbot/history/${id}`,
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