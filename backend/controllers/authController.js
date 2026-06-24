const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/emailService');
const bcrypt = require('bcryptjs');
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Create 6-digit verification code
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create user
    const user = new User({
      name,
      email,
      password,
      verificationToken,
      isVerified: false
    });
    
    await user.save();
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken);
    
    res.status(201).json({ 
        message: 'Registration successful. Please verify your email.',
        email: email // Send email back for potential auto-fill
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Existing link verification (keep for backward compatibility or link clicks)
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) return res.status(400).send('Invalid or expired token.');
    
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    // Redirect to frontend success page
    res.redirect(`${process.env.PORTFOLIO_URL}/verify-success`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// New Manual Code Verification
exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const user = await User.findOne({ 
        email: email, 
        verificationToken: code 
    });
    
    if (!user) return res.status(400).json({ error: 'Invalid verification code' });
    
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    res.json({ message: 'Email verified successfully', success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    // Check if email is verified
    if (!user.isVerified) return res.status(400).json({ error: 'Please verify your email first' });
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};