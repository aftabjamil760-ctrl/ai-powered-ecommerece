import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyPayment } from '../utils/paymentService';
import { confirmPayment } from '../utils/orderService';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // processing, success, error
    const [orderDetails, setOrderDetails] = useState(null);
    const [error, setError] = useState('');

    const sessionId = searchParams.get('session_id');
    const transactionId = searchParams.get('transactionId');
    const orderId = searchParams.get('orderId');
    const gateway = searchParams.get('gateway') || 'stripe';
    const paramStatus = searchParams.get('status'); // Alternative manual status

    useEffect(() => {
        const handleVerification = async () => {
            // Manual status override (e.g., from cancel_url)
            if (paramStatus === 'cancel') {
                setStatus('error');
                setError('Payment was cancelled by the user.');
                return;
            }

            const idToVerify = sessionId || transactionId;

            if (!idToVerify) {
                setStatus('error');
                setError('No transaction reference found to verify.');
                return;
            }

            try {
                const result = await verifyPayment(idToVerify, gateway);
                if (result.success) {
                    setStatus('success');
                    setOrderDetails(result.data);

                    // Mark order as paid/shipped in our DB (idempotent on backend)
                    const resolvedOrderId = orderId || result.data?.metadata?.orderId;
                    if (resolvedOrderId) {
                        try {
                            await confirmPayment(resolvedOrderId, idToVerify);
                        } catch (e) {
                            // If this fails, payment is still successful; user can refresh/orders later
                            console.error('Failed to confirm order in DB:', e);
                        }
                    }
                } else {
                    setStatus('error');
                    setError(result.error || 'Verification failed');
                }
            } catch (err) {
                setStatus('error');
                setError(err.message);
            }
        };

        handleVerification();
    }, [sessionId, transactionId, gateway, paramStatus]);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
            <div className="max-w-lg w-full bg-gray-800 rounded-3xl border border-gray-700 p-10 text-center shadow-2xl overflow-hidden relative">
                {/* Background Glow */}
                <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[100px] opacity-20 ${status === 'success' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>

                {status === 'processing' && (
                    <div className="relative z-10">
                        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mx-auto mb-8"></div>
                        <h1 className="text-3xl font-black mb-4">Verifying Payment</h1>
                        <p className="text-gray-400">Please Wait... We are confirming your transaction with the provider.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="relative z-10 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-green-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Payment Successful!</h1>
                        <p className="text-gray-400 mb-8 px-4">Thank you for your purchase. Your order has been confirmed.</p>

                        <div className="bg-gray-700/50 rounded-2xl p-6 mb-10 border border-gray-600/50 text-left space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 uppercase font-bold text-[10px] tracking-widest">Order ID</span>
                                <span className="font-mono text-gray-300">{orderId || orderDetails?.metadata?.orderId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 uppercase font-bold text-[10px] tracking-widest">Amount Paid</span>
                                <span className="text-white font-black">${orderDetails?.amount || '...'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 uppercase font-bold text-[10px] tracking-widest">Gateway</span>
                                <span className="text-blue-400 font-bold capitalize">{gateway}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Link to="/orders" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] transition-transform">
                                View My Orders
                            </Link>
                            <Link to="/products" className="text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="relative z-10 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-red-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-black mb-4 text-red-400">Payment Failed</h1>
                        <p className="text-gray-400 mb-10 px-4">{error || 'Something went wrong during the payment process. Please try again or contact support.'}</p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-2xl font-black text-lg transition-colors border border-gray-600"
                            >
                                Try Again
                            </button>
                            <Link to="/" className="text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentStatus;
