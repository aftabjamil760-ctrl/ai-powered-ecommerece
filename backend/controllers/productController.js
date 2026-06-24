const Product = require('../models/Product');

const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ecommerence-store/1.0; +https://example.com)',
        Accept: 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Fetch failed ${response.status}: ${errorBody}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

// Get top products (synced with FakeStoreAPI)
exports.getTopProducts = async (req, res) => {
  try {
    // Always include locally seeded test products first (useful for Stripe testing)
    const localTestProducts = await Product.find({ category: 'test' }).sort({ createdAt: -1 }).limit(10);

    // 1. Fetch from External API
    const externalProducts = await fetchWithTimeout('https://fakestoreapi.com/products');

    // 2. Map and Sync with MongoDB
    const syncedProducts = [];
    
    for (const item of externalProducts) {
      // Map external fields to our Product model
      const productData = {
        name: item.title,
        description: item.description,
        price: item.price,
        discount: Math.floor(Math.random() * 20), // FakeStoreAPI doesn't have discounts, adding random ones
        category: item.category,
        image: item.image,
        stock: Math.floor(Math.random() * 100) + 1,
      };

      // Find by name or some unique criteria, update if exists, else create
      let product = await Product.findOneAndUpdate(
        { name: productData.name },
        productData,
        { upsert: true, new: true }
      );
      
      syncedProducts.push(product);
    }

    res.json([...localTestProducts, ...syncedProducts].slice(0, 20)); // Return the top 20
  } catch (error) {
    console.error('Error fetching external products:', error);
    // Fallback: return what we have in DB if external fetch fails
    const products = await Product.find().limit(20);
    res.json(products);
  }
};

// Search products (fetching-then-filtering from internet)
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(200).json({ 
        message: 'Please enter a search term',
        products: [] 
      });
    }

    // First search local DB (includes seeded test products)
    const localMatches = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).limit(50);

    if (localMatches.length > 0) {
      return res.json(localMatches);
    }
    // No local matches — do not query external product APIs here. Return a
    // clear 'no results' response so the frontend can inform the user.
    return res.status(200).json({
      message: `No products found matching "${query}" in the local catalog.`,
      products: []
    });
  } catch (error) {
    console.error('Error searching external products:', error);
    // Fallback to local search if internet is down
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(products);
  }
};

// Get product details
exports.getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Calculate discounted price
    const discountedPrice = product.price - (product.price * (product.discount / 100));
    
    res.json({
      ...product.toObject(),
      discountedPrice,
      finalPrice: discountedPrice.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};