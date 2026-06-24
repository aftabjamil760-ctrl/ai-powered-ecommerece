const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  discount: Number,
  category: String,
  stock: Number,
  image: String,
  embeddings: {
    type: [Number],
    select: false,
  },
  ratings: [{
    userId: mongoose.Schema.Types.ObjectId,
    rating: Number,
    review: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
