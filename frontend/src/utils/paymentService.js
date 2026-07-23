/**
 * Payment API Service
 */

const API_BASE_URL = '/api/payments';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const createPayment = async (paymentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to initiate payment');
    return data;
  } catch (error) {
    console.error('Error in createPayment:', error);
    throw error;
  }
};

export const getPaymentMethods = async (country = 'PK') => {
  try {
    const response = await fetch(`${API_BASE_URL}/methods/${country}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch payment methods');
    return data.data;
  } catch (error) {
    console.error('Error in getPaymentMethods:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentId, gateway = 'stripe') => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify/${paymentId}?gateway=${gateway}`, {
      headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to verify payment');
    return data;
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    throw error;
  }
};

export const getPaymentHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/history`, {
      headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch payment history');
    return data.data;
  } catch (error) {
    console.error('Error in getPaymentHistory:', error);
    throw error;
  }
};

export const getAdminPaymentHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/history/admin`, {
      headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch admin payment history');
    return data.payments;
  } catch (error) {
    console.error('Error in getAdminPaymentHistory:', error);
    throw error;
  }
};

export const mockPayment = async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mock`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(paymentData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create mock payment');
      return data;
    } catch (error) {
      console.error('Error in mockPayment:', error);
      throw error;
    }
  };
