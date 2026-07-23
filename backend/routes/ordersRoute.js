const express = require('express');
const { createOrder, paymentSuccess, updateDeliveryStatus, getMyOrders, getAllOrders, downloadInvoice } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuthMiddleware');
const router = express.Router();

router.get('/', protect, getMyOrders);
router.get('/admin', protect, adminAuth, getAllOrders);
router.post('/create', protect, createOrder);
router.post('/payment-success', protect, paymentSuccess);
router.post('/update-delivery', protect, updateDeliveryStatus);
router.get('/:orderId/invoice', protect, downloadInvoice);

module.exports = router;