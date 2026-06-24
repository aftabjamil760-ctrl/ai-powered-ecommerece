import React, { useState, useEffect } from 'react';
import { getPaymentHistory } from '../utils/paymentService';
import PaymentCard from '../components/PaymentCard';
import { Link } from 'react-router-dom';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const data = await getPaymentHistory();
                setPayments(data.payments || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                    <Link to="/" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Transaction History
                    </h1>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center py-20 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                        <p className="text-gray-500 font-medium">Loading your transactions...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-xl text-center shadow-xl">
                        <div className="text-lg font-bold mb-1">Oops! Something went wrong</div>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-dashed border-gray-700">
                        <div className="text-6xl mb-6 opacity-20">💸</div>
                        <p className="text-xl text-gray-500 mb-8 font-medium">No payment history found.</p>
                        <Link to="/products" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl hover:scale-105 transition-transform font-bold shadow-lg shadow-blue-500/20">
                            Explore Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {payments.map(payment => (
                            <PaymentCard key={payment.id} payment={payment} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payments;
