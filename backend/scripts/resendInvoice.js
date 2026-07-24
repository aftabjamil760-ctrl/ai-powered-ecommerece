require('dotenv').config();
const path = require('path');

const connectDB = require('../config/database');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmation } = require('../utils/emailService');
const { generateOrderInvoice } = require('../utils/invoiceService');

const orderId = process.argv[2];
if (!orderId) {
  console.error('Usage: node resendInvoice.js <orderId>');
  process.exit(1);
}

(async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    const order = await Order.findById(orderId).lean();
    if (!order) {
      console.error('Order not found:', orderId);
      process.exit(2);
    }

    let customer = null;
    if (order.userId) {
      customer = await User.findById(order.userId).lean();
    }

    const emailTo = (customer && customer.email) || order.customerEmail || (order.verification && order.verification.customerEmail) || '';
    console.log('Resolved recipient email:', emailTo);

    let invoicePath = order.invoicePath;
    if (!invoicePath) {
      console.log('Invoice missing; generating invoice...');
      invoicePath = await generateOrderInvoice(order, customer || {});
      console.log('Generated invoice at', invoicePath);
      // attempt to persist invoicePath back to order
      try {
        await Order.findByIdAndUpdate(orderId, { invoicePath });
      } catch (e) {
        console.warn('Failed to persist invoicePath to DB:', e.message);
      }
    } else {
      console.log('Order already has invoicePath:', invoicePath);
    }

    if (!emailTo) {
      console.error('No recipient email available for this order. Aborting send.');
      process.exit(3);
    }

    console.log('Attempting to send order confirmation to', emailTo);
    const info = await sendOrderConfirmation(emailTo, { ...order, invoicePath, customerName: customer?.name || '' });
    console.log('sendOrderConfirmation result:', info);
    process.exit(0);
  } catch (err) {
    console.error('Error in resend script:', err);
    process.exit(4);
  }
})();
