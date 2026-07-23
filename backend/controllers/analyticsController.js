
const analyticsService = require('../utils/analyticsService');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
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
    const { type = 'orders', startDate, endDate, format = 'json' } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = endDate ? new Date(endDate) : new Date();

    if (format === 'csv') {
      let header = [];
      let rows = [];

      if (type === 'orders') {
        const orders = await Order.find({ createdAt: { $gte: start, $lte: end } })
          .sort({ createdAt: -1 })
          .populate('userId', 'name email')
          .populate('products.productId', 'name category');

        header = [
          'Order ID',
          'Customer Name',
          'Customer Email',
          'Order Date',
          'Payment Status',
          'Order Status',
          'Product Name',
          'Product Category',
          'Product Quantity',
          'Product Price',
          'Line Total',
          'Order Total',
          'Currency'
        ];

        rows = orders.flatMap((order) =>
          order.products.map((product) => [
            order._id,
            order.userId?.name || 'Unknown',
            order.userId?.email || 'Unknown',
            order.createdAt.toISOString(),
            order.paymentStatus,
            order.orderStatus,
            product.productId?.name || 'Unknown Product',
            product.productId?.category || 'Unknown Category',
            product.quantity,
            product.price,
            (product.price * product.quantity).toFixed(2),
            order.totalAmount.toFixed(2),
            order.currency || 'USD'
          ])
        );
      } else if (type === 'customers') {
        const customers = await CustomerAnalytics.find({ lastOrderDate: { $gte: start, $lte: end } })
          .populate('userId', 'name email');

        header = [
          'Customer ID',
          'Name',
          'Email',
          'Total Orders',
          'Total Spent',
          'Lifetime Value',
          'Customer Segment',
          'First Order Date',
          'Last Order Date'
        ];

        rows = customers.map((customer) => [
          customer.userId?._id || customer._id,
          customer.userId?.name || 'Unknown',
          customer.userId?.email || 'Unknown',
          customer.totalOrders || 0,
          customer.totalSpent?.toFixed(2) || '0.00',
          customer.lifetimeValue?.toFixed(2) || '0.00',
          customer.customerSegment || 'new',
          customer.firstOrderDate ? customer.firstOrderDate.toISOString() : '',
          customer.lastOrderDate ? customer.lastOrderDate.toISOString() : ''
        ]);
      } else if (type === 'payments') {
        const payments = await Payment.find({ createdAt: { $gte: start, $lte: end } })
          .sort({ createdAt: -1 })
          .populate('userId', 'name email')
          .populate('orderId', 'totalAmount paymentStatus');

        header = [
          'Payment ID',
          'Transaction ID',
          'User Name',
          'User Email',
          'Order ID',
          'Order Total',
          'Order Status',
          'Amount',
          'Currency',
          'Gateway',
          'Status',
          'Created At'
        ];

        rows = payments.map((payment) => [
          payment._id,
          payment.transactionId || '',
          payment.userId?.name || 'Unknown',
          payment.userId?.email || 'Unknown',
          payment.orderId?._id || '',
          payment.orderId?.totalAmount?.toFixed(2) || '0.00',
          payment.orderId?.paymentStatus || '',
          payment.amount?.toFixed(2) || '0.00',
          payment.currency || 'USD',
          payment.gateway || '',
          payment.status || '',
          payment.createdAt ? payment.createdAt.toISOString() : ''
        ]);
      } else {
        return res.status(400).json({ success: false, error: 'Invalid export type for CSV' });
      }

      const csv = [header, ...rows]
        .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const filename = `report_${type}_${start.toISOString().slice(0, 10)}_${end.toISOString().slice(0, 10)}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    }

    let data;
    if (type === 'orders') {
      data = await Order.find({ createdAt: { $gte: start, $lte: end } }).populate('products.productId');
    } else if (type === 'customers') {
      data = await CustomerAnalytics.find({ lastOrderDate: { $gte: start, $lte: end } }).populate('userId');
    } else if (type === 'payments') {
      data = await Payment.find({ createdAt: { $gte: start, $lte: end } })
        .populate('userId', 'name email')
        .populate('orderId', 'totalAmount paymentStatus');
    } else {
      return res.status(400).json({ success: false, error: 'Invalid export type' });
    }

    res.json({ success: true, data, metadata: { type, startDate: start, endDate: end, count: data.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
