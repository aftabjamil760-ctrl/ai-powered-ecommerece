const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send verification email to user
 * @param {string} email - User's email
 * @param {string} token - Verification token
 */
exports.sendVerificationEmail = async (email, token) => {
  try {
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify/${token}`;
    
    const mailOptions = {
      from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Our E-Commerce Store! 🛍️</h2>
          <p>Thank you for registering. Please verify your email address to complete your registration.</p>
          
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px; color: #555;">Your Verification Code:</p>
            <h1 style="margin: 10px 0; font-size: 32px; letter-spacing: 5px; color: #333;">${token}</h1>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify via Link (Optional)
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
          <p>This code/link will expire in 24 hours.</p>
          <hr>
          <p style="font-size: 12px; color: #999;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send order confirmation email
 * @param {string} email - User's email
 * @param {Object} order - Order details
 */
exports.sendOrderConfirmation = async (email, order) => {
  try {
    const mailOptions = {
      from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmation - #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🎉 Order Confirmed!</h2>
          <p>Thank you for your purchase. Your order has been successfully placed.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
            <p><strong>Status:</strong> ${order.orderStatus}</p>
          </div>
          
          <p>You can track your order from your account dashboard.</p>
          <p>If you have any questions, contact our support team.</p>
          
          <hr>
          <p style="font-size: 12px; color: #999;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending order confirmation:', error);
  }
};

/**
 * Send notification email for feedback reply
 * @param {string} email - User's email
 * @param {Object} feedback - Feedback details
 */
exports.sendFeedbackNotification = async (email, feedback) => {
  try {
    const mailOptions = {
      from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Response to Your Feedback',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>📝 Response to Your Feedback</h2>
          <p>An admin has responded to your feedback:</p>
          
          <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Your Feedback:</strong> ${feedback.comment}</p>
            <p><strong>Admin Response:</strong> ${feedback.adminReply}</p>
          </div>
          
          <p>Thank you for helping us improve our service!</p>
          
          <hr>
          <p style="font-size: 12px; color: #999;">
            This is an automated notification from our feedback system.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Feedback notification email sent to:', email);
  } catch (error) {
    console.error('Error sending feedback notification:', error);
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email
 * @param {string} resetToken - Password reset token
 */
exports.sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🔐 Password Reset</h2>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p>Or use this link: ${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          
          <p style="font-size: 12px; color: #999;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};