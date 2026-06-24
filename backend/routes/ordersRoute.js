const express = require('express');
const { createOrder, paymentSuccess, updateDeliveryStatus, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getMyOrders);
router.post('/create', protect, createOrder);
router.post('/payment-success', protect, paymentSuccess);
router.post('/update-delivery', protect, updateDeliveryStatus);

module.exports = router;