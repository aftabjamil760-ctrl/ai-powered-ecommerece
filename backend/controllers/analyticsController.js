const analyticsService = require('../utils/analyticsService');
const auth = require('../middleware/authMiddleware');

/**
 * @desc    Get sales overview (today, week, month, year)
 * @route   GET /api/analytics/sales-overview
 * @access  Private (Admin)
 */
exports.getSalesOverview = async (req, res) => {
  try {
    const overview = await analyticsService.getSalesOverview();
    
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Error getting sales overview:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get sales data for charts
 * @route   GET /api/analytics/sales-data
 * @access  Private (Admin)
 */
exports.getSalesData = async (req, res) => {
  try {
    const { timeRange = '7days' } = req.query;
    
    const salesData = await analyticsService.getSalesData(timeRange);
    
    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error getting sales data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get top products analytics
 * @route   GET /api/analytics/top-products
 * @access  Private (Admin)
 */
exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 10, timeRange = 'month' } = req.query;
    
    const topProducts = await analyticsService.getTopProducts(
      parseInt(limit), 
      timeRange
    );
    
    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    console.error('Error getting top products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get customer analytics
 * @route   GET /api/analytics/customers
 * @access  Private (Admin)
 */
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const customerAnalytics = await analyticsService.getCustomerAnalytics();
    
    res.json({
      success: true,
      data: customerAnalytics
    });
  } catch (error) {
    console.error('Error getting customer analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get revenue by category
 * @route   GET /api/analytics/revenue-by-category
 * @access  Private (Admin)
 */
exports.getRevenueByCategory = async (req, res) => {
  try {
    const revenueByCategory = await analyticsService.getRevenueByCategory();
    
    res.json({
      success: true,
      data: revenueByCategory
    });
  } catch (error) {
    console.error('Error getting revenue by category:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/analytics/dashboard
 * @access  Private (Admin)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get all stats in parallel
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

    // Calculate additional stats
    const totalRevenue = salesOverview.year.totalRevenue;
    const totalOrders = salesOverview.year.totalOrders;
    const totalCustomers = customerAnalytics.totalCustomers;
    const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

    res.json({
      success: true,
      data: {
        // Key metrics
        keyMetrics: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          conversionRate: conversionRate.toFixed(2),
          averageOrderValue: salesOverview.year.averageOrderValue
        },
        
        // Sales data
        salesOverview,
        salesChartData: salesData,
        
        // Top performers
        topProducts: topProducts.slice(0, 5),
        
        // Customer insights
        customerSegments: customerAnalytics.segments,
        newCustomers: customerAnalytics.newCustomers,
        
        // Category performance
        topCategories: revenueByCategory.slice(0, 5),
        
        // Recent activity
        recentOrders: [], // You can add this
        recentCustomers: customerAnalytics.topCustomers.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Update analytics manually (for testing)
 * @route   POST /api/analytics/update-daily
 * @access  Private (Admin)
 */
exports.updateDailyAnalytics = async (req, res) => {
  try {
    const updatedAnalytics = await analyticsService.updateDailyAnalytics();
    
    res.json({
      success: true,
      message: 'Daily analytics updated successfully',
      data: updatedAnalytics
    });
  } catch (error) {
    console.error('Error updating daily analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Export analytics data
 * @route   GET /api/analytics/export
 * @access  Private (Admin)
 */
exports.exportAnalytics = async (req, res) => {
  try {
    const { type = 'sales', format = 'json', startDate, endDate } = req.query;
    
    let data;
    const now = new Date();
    const defaultStartDate = new Date(now);
    defaultStartDate.setMonth(now.getMonth() - 1);
    
    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : now;

    switch (type) {
      case 'sales':
        // Get orders in date range
        const orders = await Order.find({
          createdAt: { $gte: start, $lte: end }
        }).populate('products.productId');
        
        data = orders.map(order => ({
          orderId: order._id,
          date: order.createdAt,
          customer: order.userId,
          amount: order.totalAmount,
          status: order.paymentStatus,
          gateway: order.paymentGateway,
          products: order.products.map(p => ({
            name: p.productId.name,
            quantity: p.quantity,
            price: p.price
          }))
        }));
        break;
        
      case 'customers':
        const customers = await CustomerAnalytics.find({
          lastOrderDate: { $gte: start, $lte: end }
        }).populate('userId');
        
        data = customers.map(customer => ({
          customerId: customer.userId._id,
          name: customer.userId.name,
          email: customer.userId.email,
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
          firstOrder: customer.firstOrderDate,
          lastOrder: customer.lastOrderDate,
          segment: customer.customerSegment
        }));
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid export type'
        });
    }

    // Return in requested format
    if (format === 'csv') {
      // Convert to CSV (you'd need a proper CSV library)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-${Date.now()}.csv`);
      res.send(JSON.stringify(data));
    } else {
      res.json({
        success: true,
        data: data,
        metadata: {
          type,
          format,
          startDate: start,
          endDate: end,
          count: data.length
        }
      });
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};