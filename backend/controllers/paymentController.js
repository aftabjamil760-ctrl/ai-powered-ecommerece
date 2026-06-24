const paymentService = require('../utils/paymentService');

/**
 * @desc    Create payment session
 * @route   POST /api/payments/create
 * @access  Private
 */
exports.createPayment = async (req, res) => {
  try {
    const { orderId, amount, currency, gateway, customerDetails } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!orderId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment details' });
    }

    // Detect gateway if not specified
    const selectedGateway = gateway || paymentService.detectPaymentGateway(
      customerDetails?.country || 'PK',
      currency || 'PKR'
    );

    // Prepare payment data
    const paymentData = {
      orderId,
      amount,
      currency: currency || (selectedGateway === 'easypaisa' ? 'PKR' : 'USD'),
      customerEmail: req.user.email,
      customerName: req.user.name,
      customerPhone: customerDetails?.phone,
      customerAddress: customerDetails?.address,
      customerCountry: customerDetails?.country || 'PK',
    };

    // Process payment
    const result = await paymentService.processPayment(paymentData, selectedGateway);

    // Save payment record to database (implement as needed)
    // await PaymentRecord.create({
    //   userId,
    //   orderId,
    //   gateway: selectedGateway,
    //   transactionId: result.transactionId || result.paymentId,
    //   amount,
    //   currency,
    //   status: 'initiated',
    // });

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      data: result
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * @desc    Handle EasyPaisa payment callback/webhook
 * @route   POST /api/payments/easypaisa-callback
 * @access  Public
 */
exports.handleEasyPaisaCallback = async (req, res) => {
  try {
    console.log('EasyPaisa callback received:', req.body);
    
    // Verify the callback
    const verification = await paymentService.verifyEasyPaisaCallback(req.body);
    
    if (verification.isVerified) {
      // Update order status in database
      // await Order.findByIdAndUpdate(verification.orderId, {
      //   paymentStatus: verification.status === 'paid' ? 'paid' : 'failed',
      //   transactionId: verification.transactionId,
      // });
      
      // Send success response to EasyPaisa
      res.status(200).send('OK');
    } else {
      res.status(400).send('Invalid callback');
    }
  } catch (error) {
    console.error('EasyPaisa callback error:', error);
    res.status(500).send('Error processing callback');
  }
};

/**
 * @desc    Handle Stripe webhook
 * @route   POST /api/payments/stripe-webhook
 * @access  Public
 */
exports.handleStripeWebhook = async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment succeeded:', session.id);
        
        // Update order status
        // await Order.findByIdAndUpdate(session.metadata.orderId, {
        //   paymentStatus: 'paid',
        //   paymentId: session.payment_intent,
        // });
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful:', paymentIntent.id);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        break;
        
      case 'payment_intent.canceled':
        const canceledPayment = event.data.object;
        console.log('Payment canceled:', canceledPayment.id);
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
};

/**
 * @desc    Verify payment status
 * @route   GET /api/payments/verify/:paymentId
 * @access  Private
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { gateway = 'stripe' } = req.query;

    const verification = await paymentService.verifyPayment(paymentId, gateway);

    if (verification.success) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: verification
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed',
        details: verification
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * @desc    Get available payment methods for a country
 * @route   GET /api/payments/methods/:country
 * @access  Public
 */
exports.getPaymentMethods = (req, res) => {
  try {
    const country = req.params.country || 'PK';
    const methods = paymentService.getAvailablePaymentMethods(country);
    
    res.json({
      success: true,
      data: {
        country,
        methods,
        defaultGateway: paymentService.detectPaymentGateway(country),
      }
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * @desc    Get payment status
 * @route   GET /api/payments/status/:paymentId
 * @access  Private
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { gateway = 'stripe' } = req.query;

    const status = await paymentService.getPaymentStatus(paymentId, gateway);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * @desc    Refund payment
 * @route   POST /api/payments/refund
 * @access  Private
 */
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId, amount, gateway = 'stripe', reason } = req.body;
    
    if (!paymentId || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid refund details' 
      });
    }

    const refund = await paymentService.refundPayment(paymentId, amount, gateway);

    if (refund.success) {
      res.json({
        success: true,
        message: 'Refund initiated successfully',
        data: refund
      });
    } else {
      res.status(400).json({
        success: false,
        error: refund.message || 'Refund failed'
      });
    }
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * @desc    Mock payment for testing
 * @route   POST /api/payments/mock
 * @access  Private (Development only)
 */
exports.mockPayment = async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        success: false,
        error: 'Mock payments not allowed in production' 
      });
    }

    const { orderId, amount, currency = 'PKR' } = req.body;
    
    if (!orderId || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid payment details' 
      });
    }

    const mockResult = await paymentService.mockProcessPayment({
      orderId,
      amount,
      currency,
      customerEmail: req.user?.email || 'test@example.com',
    });

    res.json({
      success: true,
      message: 'Mock payment created successfully',
      data: mockResult
    });
  } catch (error) {
    console.error('Mock payment error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * @desc    Get payment history for user
 * @route   GET /api/payments/history
 * @access  Private
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    // This would typically query your Payment model
    // const payments = await Payment.find({ userId })
    //   .sort({ createdAt: -1 })
    //   .skip((page - 1) * limit)
    //   .limit(parseInt(limit));

    // For now, return mock data
    const mockPayments = [
      {
        id: 'pay_123456',
        orderId: 'order_001',
        amount: 5000,
        currency: 'PKR',
        gateway: 'easypaisa',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'pay_789012',
        orderId: 'order_002',
        amount: 2500,
        currency: 'USD',
        gateway: 'stripe',
        status: 'completed',
        createdAt: new Date(Date.now() - 172800000),
      },
    ];

    res.json({
      success: true,
      data: {
        payments: mockPayments,
        page: parseInt(page),
        limit: parseInt(limit),
        total: 2,
        pages: 1,
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};