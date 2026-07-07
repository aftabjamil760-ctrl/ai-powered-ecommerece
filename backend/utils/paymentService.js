
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('./logger');

/********************* STRIPE IMPLEMENTATION *********************/

/**
 * Process payment using Stripe Checkout
 * @param {Object} paymentData - Payment details
 * @returns {Object} Payment session result
 */
exports.processStripePayment = async (paymentData) => {
  try {
    const { amount, orderId, customerEmail, currency = 'usd', customerName, customerAddress } = paymentData;
    
    // Stripe expects amount in cents
    const amountInCents = Math.round(amount * 100);

    // Create Stripe customer
    let customerId;
    if (customerEmail) {
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        address: customerAddress,
        metadata: { orderId: orderId.toString() },
      });
      customerId = customer.id;
    }

    // Configure Stripe Checkout Session
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `Order #${orderId}`,
            description: 'E-commerce purchase',
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?status=cancel&orderId=${orderId}`,
      metadata: {
        orderId: orderId.toString(),
        customerEmail: customerEmail || '',
        customerName: customerName || '',
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'AE', 'SA', 'PK'],
      },
    };

    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      success: true,
      gateway: 'stripe',
      paymentId: session.id,
      sessionId: session.id,
      amount,
      currency,
      paymentUrl: session.url,
      customerId,
      expiresAt: new Date(session.expires_at * 1000),
    };
  } catch (error) {
    logger.error('Stripe payment error:', error.message);
    throw new Error(`Stripe payment failed: ${error.message}`);
  }
};

/**
 * Verify Stripe Checkout Session payment status
 * @param {string} sessionId - Stripe session ID
 * @returns {Object} Verification result
 */
exports.verifyStripePayment = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
    const paymentIntent = session.payment_intent;

    return {
      success: session.payment_status === 'paid',
      gateway: 'stripe',
      sessionId: session.id,
      paymentStatus: session.payment_status,
      paymentIntentId: paymentIntent?.id,
      paymentMethod: paymentIntent?.payment_method_types?.[0],
      customerEmail: session.customer_details?.email,
      amount: session.amount_total / 100,
      currency: session.currency,
      metadata: session.metadata,
      timestamp: new Date(session.created * 1000),
    };
  } catch (error) {
    logger.error('Stripe verification error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Refund a Stripe Payment Intent
 * @param {string} paymentId - Payment intent / transaction ID to refund
 * @param {number} amount - Amount to refund
 * @returns {Object} Refund status result
 */
exports.refundStripePayment = async (paymentId, amount) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentId,
      amount: Math.round(amount * 100),
    });

    return {
      success: true,
      gateway: 'stripe',
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      currency: refund.currency,
    };
  } catch (error) {
    logger.error('Stripe refund error:', error.message);
    throw new Error(`Refund failed: ${error.message}`);
  }
};

/**
 * Fallback / Alias processor to handle standardized controller inputs
 */
exports.processPayment = async (paymentData) => {
  return await this.processStripePayment(paymentData);
};

exports.verifyPayment = async (paymentId) => {
  return await this.verifyStripePayment(paymentId);
};
