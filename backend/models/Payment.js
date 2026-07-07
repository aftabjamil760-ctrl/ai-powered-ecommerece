
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  gateway: {
    type: String,
    enum: ['stripe'], // باقی تمام گیٹ ویز ریموو کر دیے گئے ہیں
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD', // سٹرائپ کے لیے ڈیفالٹ USD کر دیا گیا ہے
    enum: ['USD', 'EUR', 'GBP', 'PKR']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card'] // صرف کارڈ پیمنٹ باقی رکھی ہے
  },
  paymentDetails: {
    type: Object,
    default: {}
  },
  metadata: {
    type: Object,
    default: {}
  },
  refundedAmount: {
    type: Number,
    default: 0
  },
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: String,
    createdAt: Date
  }],
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
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
