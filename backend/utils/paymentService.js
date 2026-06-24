const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const crypto = require('crypto');

/**
 * Payment Service - Supports Stripe (International) and EasyPaisa (Pakistan)
 */

/********************* STRIPE IMPLEMENTATION (International) *********************/

/**
 * Process payment using Stripe
 * @param {Object} paymentData - Payment details
 * @returns {Object} Payment result
 */
exports.processStripePayment = async (paymentData) => {
  try {
    const { amount, orderId, customerEmail, currency = 'usd', customerName, customerAddress } = paymentData;
    
    // Convert amount to cents
    const amountInCents = Math.round(amount * 100);
    
    // Create Stripe customer (optional)
    let customerId;
    if (customerEmail) {
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        address: customerAddress,
        metadata: {
          orderId: orderId.toString(),
        },
      });
      customerId = customer.id;
    }

    // Create checkout session — Stripe allows only one of customer or customer_email
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
      amount: amount,
      currency: currency,
      paymentUrl: session.url,
      customerId: customerId,
      expiresAt: new Date(session.expires_at * 1000),
    };
  } catch (error) {
    console.error('Stripe payment error:', error.message);
    throw new Error(`Stripe payment failed: ${error.message}`);
  }
};

/**
 * Verify Stripe payment
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
    console.error('Stripe verification error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/********************* EASYPAISA IMPLEMENTATION (Pakistan) *********************/

/**
 * Initialize EasyPaisa payment
 * @param {Object} paymentData - Payment details
 * @returns {Object} Payment initiation result
 */
exports.initiateEasyPaisaPayment = async (paymentData) => {
  try {
    const { 
      amount, 
      orderId, 
      customerName, 
      customerEmail, 
      customerPhone,
      description = 'E-commerce Purchase'
    } = paymentData;

    // EasyPaisa API credentials from environment
    const storeId = process.env.EASYPAISA_STORE_ID;
    const hashKey = process.env.EASYPAISA_HASH_KEY;
    const merchantId = process.env.EASYPAISA_MERCHANT_ID;

    // Generate transaction ID
    const transactionId = `EP${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Create payload for EasyPaisa
    const payload = {
      storeId: storeId,
      orderId: orderId.toString(),
      transactionAmount: amount.toString(),
      transactionId: transactionId,
      mobileAccountNo: customerPhone.replace(/\D/g, ''), // Remove non-digits
      emailAddress: customerEmail,
      customerName: customerName,
      transactionType: 'MA',
      tokenExpiry: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes expiry
      bankIdentificationNumber: '',
      productDescription: description,
      postBackURL: `${process.env.BASE_URL}/api/payments/easypaisa-callback`,
      redirectURL: `${process.env.FRONTEND_URL}/payment-success?gateway=easypaisa&transactionId=${transactionId}&orderId=${orderId}`,
    };

    // Generate hash
    const hashString = `${storeId}${orderId}${amount}${transactionId}${customerPhone}${hashKey}`;
    const hash = crypto.createHash('sha256').update(hashString).digest('hex');
    payload.hash = hash;

    // Make API call to EasyPaisa
    const easypaisaUrl = process.env.EASYPAISA_API_URL || 'https://easypay.easypaisa.com.pk/easypay/Index.jsf';
    
    // For EasyPaisa, we typically redirect to their payment page
    // Store transaction details in database
    const paymentRequest = {
      gateway: 'easypaisa',
      transactionId: transactionId,
      orderId: orderId,
      amount: amount,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      status: 'initiated',
      initiatedAt: new Date(),
      payload: payload,
    };

    // Save to database (you need to implement this)
    // await PaymentTransaction.create(paymentRequest);

    return {
      success: true,
      gateway: 'easypaisa',
      transactionId: transactionId,
      orderId: orderId,
      amount: amount,
      paymentUrl: `${easypaisaUrl}?${new URLSearchParams(payload).toString()}`,
      redirectRequired: true,
      message: 'Redirect to EasyPaisa payment page',
    };
  } catch (error) {
    console.error('EasyPaisa payment initiation error:', error);
    throw new Error(`EasyPaisa payment failed: ${error.message}`);
  }
};

/**
 * Verify EasyPaisa payment callback
 * @param {Object} callbackData - Callback data from EasyPaisa
 * @returns {Object} Verification result
 */
exports.verifyEasyPaisaCallback = async (callbackData) => {
  try {
    const {
      transactionId,
      orderId,
      amount,
      status,
      responseCode,
      responseDesc,
      dateTime,
      hash,
    } = callbackData;

    // Verify hash
    const storeId = process.env.EASYPAISA_STORE_ID;
    const hashKey = process.env.EASYPAISA_HASH_KEY;
    
    const hashString = `${storeId}${orderId}${amount}${transactionId}${status}${responseCode}${dateTime}${hashKey}`;
    const calculatedHash = crypto.createHash('sha256').update(hashString).digest('hex');

    if (calculatedHash !== hash) {
      throw new Error('Invalid hash received from EasyPaisa');
    }

    // Map EasyPaisa status to our status
    let paymentStatus = 'failed';
    let isSuccess = false;
    
    if (status === '000' || responseCode === '0000') {
      paymentStatus = 'paid';
      isSuccess = true;
    } else if (status === '001' || responseCode === '0001') {
      paymentStatus = 'pending';
    } else if (status === '002' || responseCode === '0002') {
      paymentStatus = 'cancelled';
    }

    return {
      success: isSuccess,
      gateway: 'easypaisa',
      transactionId: transactionId,
      orderId: orderId,
      amount: parseFloat(amount),
      status: paymentStatus,
      responseCode: responseCode,
      responseMessage: responseDesc,
      transactionDate: new Date(dateTime),
      isVerified: true,
    };
  } catch (error) {
    console.error('EasyPaisa verification error:', error);
    return {
      success: false,
      error: error.message,
      isVerified: false,
    };
  }
};

/**
 * Check EasyPaisa payment status
 * @param {string} transactionId - Transaction ID
 * @returns {Object} Payment status
 */
exports.checkEasyPaisaStatus = async (transactionId) => {
  try {
    // This would call EasyPaisa's status check API
    // Since EasyPaisa doesn't have a public status API, we rely on callbacks
    // You might need to implement database lookup
    
    return {
      success: true,
      gateway: 'easypaisa',
      transactionId: transactionId,
      status: 'pending', // Default status
      message: 'Check transaction status in your EasyPaisa merchant portal',
    };
  } catch (error) {
    console.error('EasyPaisa status check error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/********************* UNIFIED PAYMENT PROCESSOR *********************/

/**
 * Unified payment processor - routes to appropriate gateway
 * @param {Object} paymentData - Payment details
 * @param {string} gateway - Payment gateway ('stripe' or 'easypaisa')
 * @returns {Object} Payment result
 */
exports.processPayment = async (paymentData, gateway = 'stripe') => {
  try {
    let result;
    
    switch (gateway.toLowerCase()) {
      case 'stripe':
        result = await this.processStripePayment(paymentData);
        break;
        
      case 'easypaisa':
        result = await this.initiateEasyPaisaPayment(paymentData);
        break;
        
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
    
    // Log payment initiation
    console.log(`Payment initiated via ${gateway}:`, {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      transactionId: result.transactionId || result.paymentId,
    });
    
    return result;
  } catch (error) {
    console.error(`Payment processing error for ${gateway}:`, error);
    throw error;
  }
};

/**
 * Verify payment based on gateway
 * @param {string} paymentId - Payment/Transaction ID
 * @param {string} gateway - Payment gateway
 * @returns {Object} Verification result
 */
exports.verifyPayment = async (paymentId, gateway = 'stripe', additionalData = {}) => {
  try {
    let result;
    
    switch (gateway.toLowerCase()) {
      case 'stripe':
        result = await this.verifyStripePayment(paymentId);
        break;
        
      case 'easypaisa':
        if (additionalData.callbackData) {
          result = await this.verifyEasyPaisaCallback(additionalData.callbackData);
        } else {
          result = await this.checkEasyPaisaStatus(paymentId);
        }
        break;
        
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
    
    return result;
  } catch (error) {
    console.error(`Payment verification error for ${gateway}:`, error);
    return {
      success: false,
      gateway: gateway,
      error: error.message,
    };
  }
};

/********************* MOCK PAYMENT FOR TESTING *********************/

/**
 * Mock payment processor for development/testing
 */
exports.mockProcessPayment = async (paymentData) => {
  console.log('Mock payment processing:', paymentData);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    gateway: 'mock',
    paymentId: `mock_pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: paymentData.amount,
    currency: paymentData.currency || 'PKR',
    paymentUrl: `${process.env.BASE_URL}/api/payments/mock-success?amount=${paymentData.amount}&orderId=${paymentData.orderId}`,
    isMock: true,
  };
};

/**
 * Get payment status
 * @param {string} paymentId - Payment ID
 * @param {string} gateway - Payment gateway
 * @returns {Object} Payment status
 */
exports.getPaymentStatus = async (paymentId, gateway = 'stripe') => {
  try {
    switch (gateway) {
      case 'stripe':
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        return {
          gateway: 'stripe',
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          paymentMethod: paymentIntent.payment_method_types?.[0],
          customerId: paymentIntent.customer,
          metadata: paymentIntent.metadata,
          timestamp: new Date(paymentIntent.created * 1000),
        };
        
      case 'easypaisa':
        // For EasyPaisa, you'd need to check your database
        return {
          gateway: 'easypaisa',
          status: 'pending_check',
          transactionId: paymentId,
          message: 'Check EasyPaisa merchant portal for status',
        };
        
      default:
        return {
          gateway: gateway,
          status: 'unknown',
          message: 'Gateway not supported for status check',
        };
    }
  } catch (error) {
    console.error('Error fetching payment status:', error);
    
    // Return mock status for testing
    return {
      gateway: gateway,
      status: 'completed',
      amount: 0,
      method: 'card',
      isMock: true,
      timestamp: new Date(),
    };
  }
};

/**
 * Refund payment
 * @param {string} paymentId - Payment ID to refund
 * @param {number} amount - Amount to refund
 * @param {string} gateway - Payment gateway
 * @returns {Object} Refund result
 */
exports.refundPayment = async (paymentId, amount, gateway = 'stripe') => {
  try {
    switch (gateway) {
      case 'stripe':
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
        
      case 'easypaisa':
        // EasyPaisa refunds typically require manual processing
        return {
          success: false,
          gateway: 'easypaisa',
          message: 'Refunds for EasyPaisa require manual processing through merchant portal',
        };
        
      default:
        throw new Error(`Refund not supported for gateway: ${gateway}`);
    }
  } catch (error) {
    console.error('Refund error:', error);
    throw new Error(`Refund failed: ${error.message}`);
  }
};

/********************* PAYMENT GATEWAY DETECTION *********************/

/**
 * Detect appropriate payment gateway based on country and amount
 * @param {string} country - Customer country
 * @param {number} amount - Payment amount
 * @param {string} currency - Payment currency
 * @returns {string} Recommended gateway
 */
exports.detectPaymentGateway = (country = 'PK', currency = 'PKR') => {
  const countryCode = country.toUpperCase();
  const currencyCode = currency.toUpperCase();
  
  // For Pakistan, recommend EasyPaisa for PKR payments
  if (countryCode === 'PK' && currencyCode === 'PKR') {
    return 'easypaisa';
  }
  
  // For international, use Stripe
  if (['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'AED'].includes(currencyCode)) {
    return 'stripe';
  }
  
  // Default to Stripe for other cases
  return 'stripe';
};

/**
 * Get available payment methods for a country
 * @param {string} country - Country code
 * @returns {Array} Available payment methods
 */
exports.getAvailablePaymentMethods = (country = 'PK') => {
  const countryCode = country.toUpperCase();
  
  const methods = {
    PK: [
      { id: 'easypaisa', name: 'EasyPaisa', type: 'wallet', icon: '💳' },
      { id: 'jazzcash', name: 'JazzCash', type: 'wallet', icon: '📱' },
      { id: 'bank_transfer', name: 'Bank Transfer', type: 'bank', icon: '🏦' },
      { id: 'cod', name: 'Cash on Delivery', type: 'cod', icon: '💵' },
    ],
    US: [
      { id: 'stripe_card', name: 'Credit/Debit Card', type: 'card', icon: '💳' },
      { id: 'paypal', name: 'PayPal', type: 'wallet', icon: '🔗' },
      { id: 'apple_pay', name: 'Apple Pay', type: 'wallet', icon: '🍎' },
    ],
    default: [
      { id: 'stripe_card', name: 'Credit/Debit Card', type: 'card', icon: '💳' },
      { id: 'paypal', name: 'PayPal', type: 'wallet', icon: '🔗' },
    ],
  };
  
  return methods[countryCode] || methods.default;
};
/**
 * Save payment record to database
 * @param {Object} paymentData - Payment data
 * @returns {Object} Saved payment record
 */
exports.savePaymentRecord = async (paymentData) => {
  try {
    // Import Payment model if needed
    // const Payment = require('../models/Payment');
    
    // Create payment record
    const paymentRecord = {
      userId: paymentData.userId,
      orderId: paymentData.orderId,
      gateway: paymentData.gateway,
      transactionId: paymentData.transactionId || paymentData.paymentId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: 'initiated',
      paymentDetails: paymentData,
      createdAt: new Date(),
    };
    
    // Save to database
    // const savedPayment = await Payment.create(paymentRecord);
    // return savedPayment;
    
    return paymentRecord; // For now, return the record
  } catch (error) {
    console.error('Error saving payment record:', error);
    throw error;
  }
};

/**
 * Update payment status
 * @param {string} transactionId - Transaction ID
 * @param {string} status - New status
 * @param {Object} updateData - Additional update data
 * @returns {Object} Updated payment
 */
exports.updatePaymentStatus = async (transactionId, status, updateData = {}) => {
  try {
    // Import Payment model if needed
    // const Payment = require('../models/Payment');
    
    const update = {
      status: status,
      updatedAt: new Date(),
      ...updateData,
    };
    
    // Update in database
    // const updatedPayment = await Payment.findOneAndUpdate(
    //   { transactionId: transactionId },
    //   update,
    //   { new: true }
    // );
    
    // return updatedPayment;
    
    return { transactionId, status, ...update }; // For now, return mock
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};