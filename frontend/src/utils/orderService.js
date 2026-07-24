/**
 * Order API Service
 */

const API_BASE_URL = '/api/orders';

export const createOrder = async (orderData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create order');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
};

export const getMyOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  } catch (error) {
    console.error('Error in getMyOrders:', error);
    throw error;
  }
};

export const getAdminOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch admin orders');
    return data.orders;
  } catch (error) {
    console.error('Error in getAdminOrders:', error);
    throw error;
  }
};

export const confirmPayment = async (orderId, paymentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payment-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, paymentId })
      });
      if (!response.ok) throw new Error('Failed to confirm payment');
      return await response.json();
    } catch (error) {
      console.error('Error in confirmPayment:', error);
      throw error;
    }
  };

export const downloadInvoice = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/${orderId}/invoice`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to download invoice');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error in downloadInvoice:', error);
    throw error;
  }
};

export const resendInvoice = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/${orderId}/resend-invoice`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to resend invoice');
    }

    return data;
  } catch (error) {
    console.error('Error in resendInvoice:', error);
    throw error;
  }
};
