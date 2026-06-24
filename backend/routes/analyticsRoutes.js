const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuthMiddleware');

// All routes require admin authentication
router.use(protect);
router.use(adminAuth);

/**
 * @route   GET /api/analytics/sales-overview
 * @desc    Get sales overview
 * @access  Private (Admin)
 */
router.get('/sales-overview', analyticsController.getSalesOverview);

/**
 * @route   GET /api/analytics/sales-data
 * @desc    Get sales data for charts
 * @access  Private (Admin)
 */
router.get('/sales-data', analyticsController.getSalesData);

/**
 * @route   GET /api/analytics/top-products
 * @desc    Get top products analytics
 * @access  Private (Admin)
 */
router.get('/top-products', analyticsController.getTopProducts);

/**
 * @route   GET /api/analytics/customers
 * @desc    Get customer analytics
 * @access  Private (Admin)
 */
router.get('/customers', analyticsController.getCustomerAnalytics);

/**
 * @route   GET /api/analytics/revenue-by-category
 * @desc    Get revenue by category
 * @access  Private (Admin)
 */
router.get('/revenue-by-category', analyticsController.getRevenueByCategory);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', analyticsController.getDashboardStats);

/**
 * @route   POST /api/analytics/update-daily
 * @desc    Update analytics manually
 * @access  Private (Admin)
 */
router.post('/update-daily', analyticsController.updateDailyAnalytics);

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data
 * @access  Private (Admin)
 */
router.get('/export', analyticsController.exportAnalytics);

module.exports = router;