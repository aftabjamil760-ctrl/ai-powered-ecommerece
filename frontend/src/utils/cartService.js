const CART_KEY = 'cart_items';

const getStoredCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const getCart = () => getStoredCart();

export const addToCart = (product, quantity = 1) => {
  const normalizedId = product._id ?? product.id;
  const cart = getStoredCart();
  const existing = cart.find((item) => item.id === normalizedId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, id: normalizedId, _id: product._id ?? normalizedId, quantity });
  }
  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId) => {
  const cart = getStoredCart().filter((item) => item.id !== productId);
  saveCart(cart);
  return cart;
};

export const updateCartQuantity = (productId, quantity) => {
  const cart = getStoredCart().map((item) =>
    item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
  );
  saveCart(cart);
  return cart;
};

export const clearCart = () => {
  saveCart([]);
};
