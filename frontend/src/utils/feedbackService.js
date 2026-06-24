import axios from 'axios';

const API_URL = '/api/feedback';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const feedbackService = {
  submitFeedback: async (feedbackData) => {
    const response = await axios.post(`${API_URL}/submit`, feedbackData, getHeaders());
    return response.data;
  },
  replyToFeedback: async (replyData) => {
    const response = await axios.post(`${API_URL}/reply`, replyData, getHeaders());
    return response.data;
  },
  getUserFeedback: async () => {
    const response = await axios.get(`${API_URL}/user`, getHeaders());
    return response.data;
  },
  getAllFeedback: async () => {
    const response = await axios.get(`${API_URL}/admin`, getHeaders());
    return response.data;
  }
};

export default feedbackService;
