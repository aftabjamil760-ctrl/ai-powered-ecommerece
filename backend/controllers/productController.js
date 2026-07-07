
const Product = require('../models/Product');

// Get top products (Directly from Local DB for high performance)
exports.getTopProducts = async (req, res) => {
  try {
    // Top creators fetch directly from DB to avoid external API network latency
    const products = await Product.find().sort({ createdAt: -1 }).limit(20);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search products locally using Regex
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
        
    if (!query || query.trim() === '') {
      return res.status(200).json([]);
    }

    const matches = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get product details with calculations
exports.getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
        
    if (!product) return res.status(404).json({ error: 'Product not found' });
        
    // Calculate final price based on discount
    const discountAmount = product.discount ? (product.price * (product.discount / 100)) : 0;
    const finalPrice = product.price - discountAmount;
        
    res.json({
      ...product.toObject(),
      finalPrice: Number(finalPrice.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
