const { 
  DailySales, 
  MonthlyAnalytics, 
  ProductAnalytics, 
  CustomerAnalytics 
} = require('../models/Analytics');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

class AnalyticsService {
  
  /**
   * Update daily sales analytics
   * Should be called via cron job daily at midnight
   */
  async updateDailyAnalytics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Get yesterday's orders
      const orders = await Order.find({
        createdAt: {
          $gte: yesterday,
          $lt: today
        }
      }).populate('products.productId');

      // Calculate metrics
      let totalRevenue = 0;
      let totalOrders = orders.length;
      let totalProductsSold = 0;
      let successfulOrders = 0;
      let failedOrders = 0;
      let pendingOrders = 0;
      const revenueByGateway = {
        stripe: 0,
        easypaisa: 0,
        jazzcash: 0,
        cod: 0
      };
      const productSales = {};

      orders.forEach(order => {
        totalRevenue += order.totalAmount;
        
        // Count orders by status
        if (order.paymentStatus === 'success') successfulOrders++;
        else if (order.paymentStatus === 'failed') failedOrders++;
        else pendingOrders++;

        // Revenue by payment gateway
        if (order.paymentGateway) {
          revenueByGateway[order.paymentGateway] = 
            (revenueByGateway[order.paymentGateway] || 0) + order.totalAmount;
        }

        // Count products sold and track top products
        order.products.forEach(item => {
          totalProductsSold += item.quantity;
          
          const productId = item.productId._id || item.productId;
          if (!productSales[productId]) {
            productSales[productId] = {
              productId: productId,
              name: item.productId.name || 'Unknown',
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;
        });
      });

      // Get top 5 products
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate average order value
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get new customers
      const newCustomers = await User.countDocuments({
        createdAt: {
          $gte: yesterday,
          $lt: today
        },
        isVerified: true
      });

      // Create or update daily sales record
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
        { upsert: true, new: true }
      );

      // Update monthly analytics
      await this.updateMonthlyAnalytics(yesterday);

      console.log('Daily analytics updated:', dailySales.date);
      return dailySales;
    } catch (error) {
      console.error('Error updating daily analytics:', error);
      throw error;
    }
  }

  /**
   * Update monthly analytics
   */
  async updateMonthlyAnalytics(date = new Date()) {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-12
      
      // Get start and end of month
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      // Get all orders for the month
      const orders = await Order.find({
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      }).populate('products.productId');

      // Calculate metrics
      let totalRevenue = 0;
      let totalOrders = orders.length;
      let totalProductsSold = 0;
      const categoryPerformance = {};
      const productSales = {};
      const paymentMethodDistribution = {
        stripe: 0,
        easypaisa: 0,
        jazzcash: 0,
        cod: 0
      };

      orders.forEach(order => {
        totalRevenue += order.totalAmount;
        
        // Payment method distribution
        if (order.paymentGateway) {
          paymentMethodDistribution[order.paymentGateway] = 
            (paymentMethodDistribution[order.paymentGateway] || 0) + 1;
        }

        // Product and category analysis
        order.products.forEach(item => {
          totalProductsSold += item.quantity;
          
          // Track product sales
          const productId = item.productId._id || item.productId;
          if (!productSales[productId]) {
            productSales[productId] = {
              productId: productId,
              name: item.productId.name || 'Unknown',
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;

          // Track category performance
          const category = item.productId.category || 'Uncategorized';
          if (!categoryPerformance[category]) {
            categoryPerformance[category] = {
              category,
              revenue: 0,
              orders: 0,
              productsSold: 0
            };
          }
          categoryPerformance[category].revenue += item.price * item.quantity;
          categoryPerformance[category].productsSold += item.quantity;
        });
      });

      // Convert category performance to array
      const categoryPerformanceArray = Object.values(categoryPerformance)
        .sort((a, b) => b.revenue - a.revenue);

      // Get top 10 products
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Calculate average order value
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get total customers
      const totalCustomers = await User.countDocuments({
        createdAt: { $lte: endOfMonth },
        isVerified: true
      });

      // Get previous month for growth calculation
      const previousMonth = month === 1 ? 12 : month - 1;
      const previousYear = month === 1 ? year - 1 : year;
      const previousMonthData = await MonthlyAnalytics.findOne({
        year: previousYear,
        month: previousMonth
      });

      // Calculate growth
      const revenueGrowth = previousMonthData 
        ? ((totalRevenue - previousMonthData.totalRevenue) / previousMonthData.totalRevenue) * 100
        : 0;
      
      const orderGrowth = previousMonthData 
        ? ((totalOrders - previousMonthData.totalOrders) / previousMonthData.totalOrders) * 100
        : 0;

      const customerGrowth = previousMonthData 
        ? ((totalCustomers - previousMonthData.totalCustomers) / previousMonthData.totalCustomers) * 100
        : 0;

      // Create or update monthly analytics
      const monthlyAnalytics = await MonthlyAnalytics.findOneAndUpdate(
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
        { upsert: true, new: true }
      );

      return monthlyAnalytics;
    } catch (error) {
      console.error('Error updating monthly analytics:', error);
      throw error;
    }
  }

  /**
   * Update product analytics when a product is sold
   */
  async updateProductAnalytics(productId, quantity, revenue) {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const dateKey = today.toISOString().split('T')[0];

      // Find or create product analytics
      let productAnalytics = await ProductAnalytics.findOne({ productId });

      if (!productAnalytics) {
        productAnalytics = new ProductAnalytics({
          productId,
          totalSold: 0,
          totalRevenue: 0
        });
      }

      // Update totals
      productAnalytics.totalSold += quantity;
      productAnalytics.totalRevenue += revenue;

      // Update daily sales
      const todaySale = productAnalytics.dailySales.find(
        sale => sale.date.toISOString().split('T')[0] === dateKey
      );

      if (todaySale) {
        todaySale.quantity += quantity;
        todaySale.revenue += revenue;
      } else {
        productAnalytics.dailySales.push({
          date: today,
          quantity,
          revenue
        });
      }

      // Update monthly sales
      const monthSale = productAnalytics.monthlySales.find(
        sale => sale.year === year && sale.month === month
      );

      if (monthSale) {
        monthSale.quantity += quantity;
        monthSale.revenue += revenue;
      } else {
        productAnalytics.monthlySales.push({
          year,
          month,
          quantity,
          revenue
        });
      }

      // Update conversion rate (you need to track views and addToCart separately)
      // This would be updated from product view tracking

      productAnalytics.lastUpdated = new Date();
      await productAnalytics.save();

      return productAnalytics;
    } catch (error) {
      console.error('Error updating product analytics:', error);
      throw error;
    }
  }

  /**
   * Update customer analytics
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

      // Update totals
      customerAnalytics.totalOrders += 1;
      customerAnalytics.totalSpent += orderData.amount;
      customerAnalytics.lastOrderDate = new Date();

      // Update average order value
      customerAnalytics.averageOrderValue = 
        customerAnalytics.totalSpent / customerAnalytics.totalOrders;

      // Calculate order frequency if more than one order
      if (customerAnalytics.totalOrders > 1 && customerAnalytics.firstOrderDate) {
        const daysSinceFirstOrder = 
          (customerAnalytics.lastOrderDate - customerAnalytics.firstOrderDate) / (1000 * 60 * 60 * 24);
        customerAnalytics.orderFrequency = daysSinceFirstOrder / customerAnalytics.totalOrders;
      }

      // Add to order history
      customerAnalytics.orderHistory.push({
        orderId: orderData.orderId,
        date: new Date(),
        amount: orderData.amount,
        status: orderData.status
      });

      // Keep only last 50 orders
      if (customerAnalytics.orderHistory.length > 50) {
        customerAnalytics.orderHistory = customerAnalytics.orderHistory.slice(-50);
      }

      // Update customer segment
      if (customerAnalytics.totalOrders >= 10) {
        customerAnalytics.customerSegment = 'vip';
      } else if (customerAnalytics.totalOrders >= 3) {
        customerAnalytics.customerSegment = 'regular';
      } else {
        customerAnalytics.customerSegment = 'new';
      }

      // Update lifetime value
      customerAnalytics.lifetimeValue = customerAnalytics.totalSpent;

      customerAnalytics.lastUpdated = new Date();
      await customerAnalytics.save();

      return customerAnalytics;
    } catch (error) {
      console.error('Error updating customer analytics:', error);
      throw error;
    }
  }

  /**
   * Get sales overview (today, week, month, year)
   */
  async getSalesOverview() {
    try {
      const now = new Date();
      
      // Today
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      // This week
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() + (6 - now.getDay()));
      weekEnd.setHours(23, 59, 59, 999);

      // This month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // This year
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      // Get orders for each period
      const [todayOrders, weekOrders, monthOrders, yearOrders] = await Promise.all([
        Order.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
        Order.find({ createdAt: { $gte: weekStart, $lte: weekEnd } }),
        Order.find({ createdAt: { $gte: monthStart, $lte: monthEnd } }),
        Order.find({ createdAt: { $gte: yearStart, $lte: yearEnd } })
      ]);

      // Calculate metrics for each period
      const calculateMetrics = (orders) => {
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = orders.length;
        const successfulOrders = orders.filter(order => order.paymentStatus === 'success').length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
          totalRevenue,
          totalOrders,
          successfulOrders,
          averageOrderValue
        };
      };

      return {
        today: calculateMetrics(todayOrders),
        week: calculateMetrics(weekOrders),
        month: calculateMetrics(monthOrders),
        year: calculateMetrics(yearOrders)
      };
    } catch (error) {
      console.error('Error getting sales overview:', error);
      throw error;
    }
  }

  /**
   * Get sales data for charts (last 7 days, 30 days, 12 months)
   */
  async getSalesData(timeRange = '7days') {
    try {
      const now = new Date();
      let startDate;
      let groupBy;

      switch (timeRange) {
        case '7days':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          groupBy = 'day';
          break;
        case '30days':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          groupBy = 'day';
          break;
        case '12months':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          groupBy = 'month';
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          groupBy = 'day';
      }

      // Get orders in the date range
      const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: now }
      });

      // Group orders by date
      const salesByDate = {};
      orders.forEach(order => {
        let key;
        const orderDate = new Date(order.createdAt);
        
        if (groupBy === 'day') {
          key = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
        } else {
          key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        }

        if (!salesByDate[key]) {
          salesByDate[key] = {
            date: key,
            revenue: 0,
            orders: 0,
            productsSold: 0
          };
        }

        salesByDate[key].revenue += order.totalAmount;
        salesByDate[key].orders += 1;
        salesByDate[key].productsSold += order.products.reduce((sum, item) => sum + item.quantity, 0);
      });

      // Convert to array and sort by date
      const salesData = Object.values(salesByDate).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

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
      console.error('Error getting sales data:', error);
      throw error;
    }
  }

  /**
   * Get top products analytics
   */
  async getTopProducts(limit = 10, timeRange = 'month') {
    try {
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case 'today':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
      }

      // Aggregate product sales
      const topProducts = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: now },
            paymentStatus: 'success'
          }
        },
        { $unwind: '$products' },
        {
          $group: {
            _id: '$products.productId',
            totalSold: { $sum: '$products.quantity' },
            totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
            orderCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
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

      return topProducts;
    } catch (error) {
      console.error('Error getting top products:', error);
      throw error;
    }
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics() {
    try {
      // Get total customers
      const totalCustomers = await User.countDocuments({ isVerified: true });
      
      // Get new customers this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const newCustomers = await User.countDocuments({
        createdAt: { $gte: monthStart },
        isVerified: true
      });

      // Get customer segments
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

      // Get top customers by lifetime value
      const topCustomers = await CustomerAnalytics.find()
        .sort({ lifetimeValue: -1 })
        .limit(10)
        .populate('userId', 'name email')
        .select('userId totalOrders totalSpent lifetimeValue customerSegment');

      return {
        totalCustomers,
        newCustomers,
        segments: customerSegments,
        topCustomers
      };
    } catch (error) {
      console.error('Error getting customer analytics:', error);
      throw error;
    }
  }

  /**
   * Get revenue by category
   */
  async getRevenueByCategory() {
    try {
      const revenueByCategory = await Order.aggregate([
        {
          $match: { paymentStatus: 'success' }
        },
        { $unwind: '$products' },
        {
          $lookup: {
            from: 'products',
            localField: 'products.productId',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $group: {
            _id: '$productDetails.category',
            totalRevenue: { 
              $sum: { $multiply: ['$products.price', '$products.quantity'] } 
            },
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

      return revenueByCategory;
    } catch (error) {
      console.error('Error getting revenue by category:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();