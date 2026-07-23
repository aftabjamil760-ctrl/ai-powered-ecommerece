import axios from 'axios';

const API_URL = '/api/analytics';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const analyticsService = {
  getSalesOverview: async () => {
    const response = await axios.get(`${API_URL}/sales-overview`, getHeaders());
    return response.data;
  },
  getSalesData: async (timeRange = '7days') => {
    const response = await axios.get(`${API_URL}/sales-data?timeRange=${timeRange}`, getHeaders());
    return response.data;
  },
  getTopProducts: async (limit = 10, timeRange = 'month') => {
    const response = await axios.get(`${API_URL}/top-products?limit=${limit}&timeRange=${timeRange}`, getHeaders());
    return response.data;
  },
  getCustomerAnalytics: async () => {
    const response = await axios.get(`${API_URL}/customers`, getHeaders());
    return response.data;
  },
  getRevenueByCategory: async () => {
    const response = await axios.get(`${API_URL}/revenue-by-category`, getHeaders());
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await axios.get(`${API_URL}/dashboard`, getHeaders());
    return response.data;
  },
  exportReport: async ({ type = 'orders', startDate, endDate, format = 'csv' }) => {
    const response = await axios.get(`${API_URL}/export`, {
      params: { type, startDate, endDate, format },
      ...getHeaders(),
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response;
  }
};

export default analyticsService;
