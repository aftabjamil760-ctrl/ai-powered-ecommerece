import axios from 'axios';

const API_URL = '/api/notifications';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const notificationService = {
  getNotifications: async () => {
    const response = await axios.get(API_URL, getHeaders());
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await axios.put(`${API_URL}/${id}/read`, {}, getHeaders());
    return response.data;
  }
};

export default notificationService;
