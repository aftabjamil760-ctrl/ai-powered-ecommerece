const express = require('express');
const { getAllProducts, getTopProducts, searchProducts, getProductDetails } = require('../controllers/productController');
const router = express.Router();

router.get('/', getAllProducts);
router.get('/top', getTopProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductDetails);

module.exports = router;