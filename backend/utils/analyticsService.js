
const { 
  DailySales, 
  MonthlyAnalytics, 
  ProductAnalytics, 
  CustomerAnalytics 
} = require('../models/Analytics');
const Order = require('../models/Order');
const User = require('../models/User');
const logger = require('./logger');

class AnalyticsService {
  /**
   * Update daily sales analytics (Stripe & Standardized Orders Only)
   */
  async updateDailyAnalytics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Get yesterday's orders
      const orders = await Order.find({
        createdAt: { $gte: yesterday, $lt: today }
      }).populate('products.productId');

      let totalRevenue = 0;
      let totalOrders = orders.length;
      let totalProductsSold = 0;
      let successfulOrders = 0;
      let failedOrders = 0;
      let pendingOrders = 0;

      const revenueByGateway = { stripe: 0 };
      const productSales = {};

      orders.forEach(order => {
        totalRevenue += order.totalAmount;

        if (order.paymentStatus === 'success') successfulOrders++;
        else if (order.paymentStatus === 'failed') failedOrders++;
        else pendingOrders++;

        if (order.paymentGateway === 'stripe') {
          revenueByGateway.stripe += order.totalAmount;
        }

        order.products.forEach(item => {
          totalProductsSold += item.quantity;
          const productId = item.productId._id || item.productId;
          
          if (!productSales[productId]) {
            productSales[productId] = {
              productId,
              name: item.productId.name || 'Unknown',
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const newCustomers = await User.countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
        isVerified: true
      });

      const dailySales = await DailySales.findOneAndUpdate(
        { date: yesterday },
        {
          date: yesterday,
          totalOrders,
          totalRevenue,
          totalProductsSold,
          averageOrderValue,
          successfulOrders,
          failedOrders,
          pendingOrders,
          revenueByGateway,
          topProducts,
          newCustomers,
          returningCustomers: totalOrders - newCustomers
        },
        { upsert: true, returnDocument: 'after' }
      );

      await this.updateMonthlyAnalytics(yesterday);
      logger.success('Daily analytics updated for:', dailySales.date);
      return dailySales;
    } catch (error) {
      logger.error('Error updating daily analytics:', error);
      throw error;
    }
  }

  /**
   * Update monthly analytics
   */
  async updateMonthlyAnalytics(date = new Date()) {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      const orders = await Order.find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }).populate('products.productId');

      let totalRevenue = 0;
      let totalOrders = orders.length;
      let totalProductsSold = 0;
      
      const categoryPerformance = {};
      const productSales = {};
      const paymentMethodDistribution = { stripe: 0 };

      orders.forEach(order => {
        totalRevenue += order.totalAmount;

        if (order.paymentGateway === 'stripe') {
          paymentMethodDistribution.stripe += 1;
        }

        order.products.forEach(item => {
          totalProductsSold += item.quantity;
          const productId = item.productId._id || item.productId;
          
          if (!productSales[productId]) {
            productSales[productId] = {
              productId,
              name: item.productId.name || 'Unknown',
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;

          const category = item.productId.category || 'Uncategorized';
          if (!categoryPerformance[category]) {
            categoryPerformance[category] = { category, revenue: 0, orders: 0, productsSold: 0 };
          }
          categoryPerformance[category].revenue += item.price * item.quantity;
          categoryPerformance[category].productsSold += item.quantity;
          categoryPerformance[category].orders += 1;
        });
      });

      const categoryPerformanceArray = Object.values(categoryPerformance).sort((a, b) => b.revenue - a.revenue);
      const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const totalCustomers = await User.countDocuments({ createdAt: { $lte: endOfMonth }, isVerified: true });

      const previousMonth = month === 1 ? 12 : month - 1;
      const previousYear = month === 1 ? year - 1 : year;
      const previousMonthData = await MonthlyAnalytics.findOne({ year: previousYear, month: previousMonth });

      const revenueGrowth = previousMonthData ? ((totalRevenue - previousMonthData.totalRevenue) / previousMonthData.totalRevenue) * 100 : 0;
      const orderGrowth = previousMonthData ? ((totalOrders - previousMonthData.totalOrders) / previousMonthData.totalOrders) * 100 : 0;
      const customerGrowth = previousMonthData ? ((totalCustomers - previousMonthData.totalCustomers) / previousMonthData.totalCustomers) * 100 : 0;

      return await MonthlyAnalytics.findOneAndUpdate(
        { year, month },
        {
          year,
          month,
          totalOrders,
          totalRevenue,
          totalProductsSold,
          averageOrderValue,
          revenueGrowth,
          orderGrowth,
          totalCustomers,
          customerGrowth,
          categoryPerformance: categoryPerformanceArray,
          paymentMethodDistribution,
          topProducts,
          updatedAt: new Date()
        },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (error) {
      logger.error('Error updating monthly analytics:', error);
      throw error;
    }
  }

  /**
   * Update product analytics tracker
   */
  async updateProductAnalytics(productId, quantity, revenue) {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const dateKey = today.toISOString().split('T')[0];

      let productAnalytics = await ProductAnalytics.findOne({ productId });
      if (!productAnalytics) {
        productAnalytics = new ProductAnalytics({ productId, totalSold: 0, totalRevenue: 0 });
      }

      productAnalytics.totalSold += quantity;
      productAnalytics.totalRevenue += revenue;

      const todaySale = productAnalytics.dailySales.find(sale => sale.date.toISOString().split('T')[0] === dateKey);
      if (todaySale) {
        todaySale.quantity += quantity;
        todaySale.revenue += revenue;
      } else {
        productAnalytics.dailySales.push({ date: today, quantity, revenue });
      }

      const monthSale = productAnalytics.monthlySales.find(sale => sale.year === year && sale.month === month);
      if (monthSale) {
        monthSale.quantity += quantity;
        monthSale.revenue += revenue;
      } else {
        productAnalytics.monthlySales.push({ year, month, quantity, revenue });
      }

      productAnalytics.lastUpdated = new Date();
      await productAnalytics.save();
      return productAnalytics;
    } catch (error) {
      logger.error('Error updating product analytics:', error);
      throw error;
    }
  }

  /**
   * Update customer lifecycle metrics & Segmentation
   */
  async updateCustomerAnalytics(userId, orderData) {
    try {
      let customerAnalytics = await CustomerAnalytics.findOne({ userId });
      if (!customerAnalytics) {
        customerAnalytics = new CustomerAnalytics({
          userId,
          totalOrders: 0,
          totalSpent: 0,
          firstOrderDate: new Date(),
          orderHistory: []
        });
      }

      customerAnalytics.totalOrders += 1;
      customerAnalytics.totalSpent += orderData.amount;
      customerAnalytics.lastOrderDate = new Date();
      customerAnalytics.averageOrderValue = customerAnalytics.totalSpent / customerAnalytics.totalOrders;

      if (customerAnalytics.totalOrders > 1 && customerAnalytics.firstOrderDate) {
        const daysSinceFirstOrder = (customerAnalytics.lastOrderDate - customerAnalytics.firstOrderDate) / (1000 * 60 * 60 * 24);
        customerAnalytics.orderFrequency = daysSinceFirstOrder / customerAnalytics.totalOrders;
      }

      customerAnalytics.orderHistory.push({
        orderId: orderData.orderId,
        date: new Date(),
        amount: orderData.amount,
        status: orderData.status
      });

      if (customerAnalytics.orderHistory.length > 50) {
        customerAnalytics.orderHistory = customerAnalytics.orderHistory.slice(-50);
      }

      if (customerAnalytics.totalOrders >= 10) customerAnalytics.customerSegment = 'vip';
      else if (customerAnalytics.totalOrders >= 3) customerAnalytics.customerSegment = 'regular';
      else customerAnalytics.customerSegment = 'new';

      customerAnalytics.lifetimeValue = customerAnalytics.totalSpent;
      customerAnalytics.lastUpdated = new Date();
      
      await customerAnalytics.save();
      return customerAnalytics;
    } catch (error) {
      logger.error('Error updating customer analytics:', error);
      throw error;
    }
  }

  /**
   * Get sales overview for dashboard tiles
   */
  async getSalesOverview() {
    try {
      const now = new Date();

      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() + (6 - weekEnd.getDay()));

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      const [todayOrders, weekOrders, monthOrders, yearOrders] = await Promise.all([
        Order.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
        Order.find({ createdAt: { $gte: weekStart, $lte: weekEnd } }),
        Order.find({ createdAt: { $gte: monthStart, $lte: monthEnd } }),
        Order.find({ createdAt: { $gte: yearStart, $lte: yearEnd } })
      ]);

      const calculateMetrics = (orders) => {
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = orders.length;
        return {
          totalRevenue,
          totalOrders,
          successfulOrders: orders.filter(order => order.paymentStatus === 'success').length,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        };
      };

      return {
        today: calculateMetrics(todayOrders),
        week: calculateMetrics(weekOrders),
        month: calculateMetrics(monthOrders),
        year: calculateMetrics(yearOrders)
      };
    } catch (error) {
      logger.error('Error getting sales overview:', error);
      throw error;
    }
  }

  /**
   * Get historical sales data for rendering chart lines
   */
  async getSalesData(timeRange = '7days') {
    try {
      const now = new Date();
      let startDate;
      let groupBy = 'day';

      if (timeRange === '30days') {
        startDate = new Date(now.setDate(now.getDate() - 30));
      } else if (timeRange === '12months') {
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        groupBy = 'month';
      } else {
        startDate = new Date(now.setDate(now.getDate() - 7));
      }

      const orders = await Order.find({ createdAt: { $gte: startDate, $lte: new Date() } });
      const salesByDate = {};

      orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const key = groupBy === 'day' 
          ? orderDate.toISOString().split('T')[0]
          : `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

        if (!salesByDate[key]) {
          salesByDate[key] = { date: key, revenue: 0, orders: 0, productsSold: 0 };
        }
        salesByDate[key].revenue += order.totalAmount;
        salesByDate[key].orders += 1;
        salesByDate[key].productsSold += order.products.reduce((sum, item) => sum + item.quantity, 0);
      });

      const salesData = Object.values(salesByDate).sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        timeRange,
        groupBy,
        data: salesData,
        summary: {
          totalRevenue: salesData.reduce((sum, item) => sum + item.revenue, 0),
          totalOrders: salesData.reduce((sum, item) => sum + item.orders, 0),
          totalProductsSold: salesData.reduce((sum, item) => sum + item.productsSold, 0)
        }
      };
    } catch (error) {
      logger.error('Error getting sales data:', error);
      throw error;
    }
  }

  /**
   * Get top performance items via MongoDB aggregation pipelines
   */
  async getTopProducts(limit = 10, timeRange = 'month') {
    try {
      const now = new Date();
      let startDate = new Date();

      if (timeRange === 'today') startDate.setHours(0, 0, 0, 0);
      else if (timeRange === 'week') startDate.setDate(now.getDate() - 7);
      else if (timeRange === 'year') startDate.setFullYear(now.getFullYear() - 1);
      else startDate.setMonth(now.getMonth() - 1);

      return await Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: now }, paymentStatus: 'success' } },
        { $unwind: '$products' },
        {
          $group: {
            _id: '$products.productId',
            totalSold: { $sum: '$products.quantity' },
            totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
            orderCount: { $sum: 1 }
          }
        },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
        { $unwind: '$productDetails' },
        {
          $project: {
            productId: '$_id',
            name: '$productDetails.name',
            category: '$productDetails.category',
            price: '$productDetails.price',
            image: '$productDetails.image',
            totalSold: 1,
            totalRevenue: 1,
            orderCount: 1,
            averagePrice: { $divide: ['$totalRevenue', '$totalSold'] }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: limit }
      ]);
    } catch (error) {
      logger.error('Error getting top products:', error);
      throw error;
    }
  }

  /**
   * Get segmented customer analytics
   */
  async getCustomerAnalytics() {
    try {
      const totalCustomers = await User.countDocuments({ isVerified: true });
      
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const newCustomers = await User.countDocuments({ createdAt: { $gte: monthStart }, isVerified: true });
      
      const customerSegments = await CustomerAnalytics.aggregate([
        {
          $group: {
            _id: '$customerSegment',
            count: { $sum: 1 },
            avgLifetimeValue: { $avg: '$lifetimeValue' },
            avgOrders: { $avg: '$totalOrders' }
          }
        }
      ]);

      const topCustomers = await CustomerAnalytics.find()
        .sort({ lifetimeValue: -1 })
        .limit(10)
        .populate('userId', 'name email')
        .select('userId totalOrders totalSpent lifetimeValue customerSegment');

      return { totalCustomers, newCustomers, segments: customerSegments, topCustomers };
    } catch (error) {
      logger.error('Error getting customer analytics:', error);
      throw error;
    }
  }

  /**
   * Get distribution of revenue across product categories
   */
  async getRevenueByCategory() {
    try {
      return await Order.aggregate([
        { $match: { paymentStatus: 'success' } },
        { $unwind: '$products' },
        { $lookup: { from: 'products', localField: 'products.productId', foreignField: '_id', as: 'productDetails' } },
        { $unwind: '$productDetails' },
        {
          $group: {
            _id: '$productDetails.category',
            totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
            totalProductsSold: { $sum: '$products.quantity' },
            orderCount: { $sum: 1 }
          }
        },
        {
          $project: {
            category: '$_id',
            totalRevenue: 1,
            totalProductsSold: 1,
            orderCount: 1,
            averageOrderValue: { $divide: ['$totalRevenue', '$orderCount'] }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]);
    } catch (error) {
      logger.error('Error getting revenue by category:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
