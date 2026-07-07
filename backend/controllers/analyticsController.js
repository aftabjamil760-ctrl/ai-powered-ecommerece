
const analyticsService = require('../utils/analyticsService');
const Order = require('../models/Order');
const { CustomerAnalytics } = require('../models/Analytics');

// Get sales overview (today, week, month, year)
exports.getSalesOverview = async (req, res) => {
  try {
    const overview = await analyticsService.getSalesOverview();
    res.json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get sales data for charts
exports.getSalesData = async (req, res) => {
  try {
    const { timeRange = '7days' } = req.query;
    const salesData = await analyticsService.getSalesData(timeRange);
    res.json({ success: true, data: salesData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get top products analytics
exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 10, timeRange = 'month' } = req.query;
    const topProducts = await analyticsService.getTopProducts(parseInt(limit), timeRange);
    res.json({ success: true, data: topProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get customer analytics
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const customerAnalytics = await analyticsService.getCustomerAnalytics();
    res.json({ success: true, data: customerAnalytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get revenue by category
exports.getRevenueByCategory = async (req, res) => {
  try {
    const revenueByCategory = await analyticsService.getRevenueByCategory();
    res.json({ success: true, data: revenueByCategory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get full dashboard statistics in parallel (Top-tier Optimization)
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      salesOverview,
      salesData,
      topProducts,
      customerAnalytics,
      revenueByCategory
    ] = await Promise.all([
      analyticsService.getSalesOverview(),
      analyticsService.getSalesData('7days'),
      analyticsService.getTopProducts(5, 'month'),
      analyticsService.getCustomerAnalytics(),
      analyticsService.getRevenueByCategory()
    ]);

    const totalOrders = salesOverview.year.totalOrders;
    const totalCustomers = customerAnalytics.totalCustomers;
    const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

    res.json({
      success: true,
      data: {
        keyMetrics: {
          totalRevenue: salesOverview.year.totalRevenue,
          totalOrders,
          totalCustomers,
          conversionRate: Number(conversionRate.toFixed(2)),
          averageOrderValue: salesOverview.year.averageOrderValue
        },
        salesOverview,
        salesChartData: salesData,
        topProducts: topProducts.slice(0, 5),
        customerSegments: customerAnalytics.segments,
        topCategories: revenueByCategory.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Export pure JSON analytics data for dashboard integration
exports.exportAnalytics = async (req, res) => {
  try {
    const { type = 'sales', startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.setMonth(now.getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    let data;
    if (type === 'sales') {
      data = await Order.find({ createdAt: { $gte: start, $lte: end } }).populate('products.productId');
    } else if (type === 'customers') {
      data = await CustomerAnalytics.find({ lastOrderDate: { $gte: start, $lte: end } }).populate('userId');
    } else {
      return res.status(400).json({ success: false, error: 'Invalid export type' });
    }

    res.json({ success: true, data, metadata: { type, startDate: start, endDate: end, count: data.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
