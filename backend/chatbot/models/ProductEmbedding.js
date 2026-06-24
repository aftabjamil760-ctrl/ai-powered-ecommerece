const mongoose = require('mongoose');

const productEmbeddingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true,
    index: true
  },
  embedding: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length === 384;
      },
      message: 'Embedding must be an array of 384 numbers'
    }
  },
  text: {
    type: String,
    required: true
  },
  metadata: {
    name: String,
    category: String,
    price: Number,
    discount: Number,
    image: String,
    stock: Number,
    description: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
productEmbeddingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Compound index for faster queries
productEmbeddingSchema.index({ productId: 1, category: 1 });

module.exports = mongoose.model('ProductEmbedding', productEmbeddingSchema);