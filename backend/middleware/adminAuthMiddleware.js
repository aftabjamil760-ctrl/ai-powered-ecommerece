const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    // If 'protect' middleware already ran, req.user will be populated
    let user = req.user;

    // If not, try to authenticate here
    if (!user) {
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.userId).select('-password');
      }
    }

    if (user && user.role === 'admin') {
      req.user = user;
      next();
    } else {
      res.status(403).json({ 
        success: false, 
        error: 'Access denied. Administrator privileges required.',
        currentRole: user ? user.role : 'none'
      });
    }
  } catch (error) {
    console.error('Admin Auth Error:', error);
    res.status(401).json({ success: false, error: 'Not authorized, token failed' });
  }
};

module.exports = adminAuth;














