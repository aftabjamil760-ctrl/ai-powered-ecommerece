const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
  deliveryAddress: Object,
  paymentId: String,
  invoicePath: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);