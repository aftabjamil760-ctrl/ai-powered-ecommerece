
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, verifyEmailOTP, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Local Auth Routes
router.post('/register', register);
router.post('/verify-email', verifyEmailOTP);
router.post('/login', login);

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token for Google authenticated user
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
    // Redirect to frontend with token & user info
    res.redirect(`${process.env.PORTFOLIO_URL}/google-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role || 'customer'
    }))}`);
  }
);

// Delete User Route (Protected)
router.delete('/delete', protect, deleteAccount);

module.exports = router;
