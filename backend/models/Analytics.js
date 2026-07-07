
const mongoose = require('mongoose');

// Daily Sales Analytics Schema
const dailySalesSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalProductsSold: { type: Number, default: 0 },
  averageOrderValue: { type: Number, default: 0 },
  successfulOrders: { type: Number, default: 0 },
  failedOrders: { type: Number, default: 0 },
  pendingOrders: { type: Number, default: 0 },
  revenueByGateway: {
    stripe: { type: Number, default: 0 } // صرف سٹرائپ باقی رکھا گیا ہے
  },
  topProducts: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    revenue: Number
  }],
  newCustomers: { type: Number, default: 0 },
  returningCustomers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Monthly Analytics Schema
const monthlyAnalyticsSchema = new mongoose.Schema({
  year: { type: Number, required: true, index: true },
  month: { type: Number, required: true, min: 1, max: 12, index: true },
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalProductsSold: { type: Number, default: 0 },
  averageOrderValue: { type: Number, default: 0 },
  revenueGrowth: { type: Number, default: 0 },
  orderGrowth: { type: Number, default: 0 },
  totalCustomers: { type: Number, default: 0 },
  customerGrowth: { type: Number, default: 0 },
  categoryPerformance: [{
    category: String,
    revenue: Number,
    orders: Number,
    productsSold: Number
  }],
  paymentMethodDistribution: {
    stripe: { type: Number, default: 0 } // صرف سٹرائپ باقی رکھا گیا ہے
  },
  topProducts: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    revenue: Number
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Product Analytics Schema
const productAnalyticsSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  totalSold: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  dailySales: [{ date: Date, quantity: Number, revenue: Number }],
  monthlySales: [{ year: Number, month: Number, quantity: Number, revenue: Number }],
  views: { type: Number, default: 0 },
  addToCart: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Customer Analytics Schema
const customerAnalyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  averageOrderValue: { type: Number, default: 0 },
  firstOrderDate: Date,
  lastOrderDate: Date,
  favoriteCategories: [String],
  lifetimeValue: { type: Number, default: 0 },
  customerSegment: { type: String, enum: ['new', 'regular', 'vip', 'inactive'], default: 'new' },
  orderHistory: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    date: Date,
    amount: Number,
    status: String
  }],
  lastUpdated: { type: Date, default: Date.now }
});

const DailySales = mongoose.model('DailySales', dailySalesSchema);
const MonthlyAnalytics = mongoose.model('MonthlyAnalytics', monthlyAnalyticsSchema);
const ProductAnalytics = mongoose.model('ProductAnalytics', productAnalyticsSchema);
const CustomerAnalytics = mongoose.model('CustomerAnalytics', customerAnalyticsSchema);

module.exports = {
  DailySales,
  MonthlyAnalytics,
  ProductAnalytics,
  CustomerAnalytics
};
