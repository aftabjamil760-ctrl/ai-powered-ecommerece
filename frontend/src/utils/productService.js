/**
 * Product API Service
 */

const API_BASE_URL = '/api/products';

export const getTopProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/top`);
    if (!response.ok) throw new Error('Failed to fetch top products');
    return await response.json();
  } catch (error) {
    console.error('Error in getTopProducts:', error);
    throw error;
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search products');
    return await response.json();
  } catch (error) {
    console.error('Error in searchProducts:', error);
    throw error;
  }
};

export const getProductDetails = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product details');
    return await response.json();
  } catch (error) {
    console.error('Error in getProductDetails:', error);
    throw error;
  }
};
