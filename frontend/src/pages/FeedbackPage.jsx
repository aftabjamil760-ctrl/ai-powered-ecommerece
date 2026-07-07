import React, { useState, useEffect } from 'react';
import feedbackService from '../utils/feedbackService';
import { getMyOrders } from '../utils/orderService';
import FeedbackForm from '../components/FeedbackForm';

const FeedbackPage = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const feedbackData = user.role === 'admin'
                ? await feedbackService.getAllFeedback()
                : await feedbackService.getUserFeedback();

            setFeedbacks(feedbackData);
            setIsAdmin(user.role === 'admin');

            if (user.role !== 'admin') {
                const myOrders = await getMyOrders();
                const feedbackKeys = new Set(feedbackData.map((f) => `${f.orderId}-${f.productId?._id || f.productId}`));
                const pendingOrders = myOrders
                    .filter((order) => order.orderStatus === 'delivered' || order.paymentStatus === 'success')
                    .map((order) => ({
                        ...order,
                        products: order.products.map((product) => ({
                            ...product,
                            hasFeedback: feedbackKeys.has(`${order._id}-${product.productId}`),
                        })),
                    }))
                    .filter((order) => order.products.some((product) => !product.hasFeedback));

                setOrders(pendingOrders);
            }
        } catch (err) {
            setError('Failed to load feedback');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFeedback = async (productId, orderId, rating, comment) => {
        try {
            await feedbackService.submitFeedback({ productId, orderId, rating, comment });
            fetchFeedbacks();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit feedback');
        }
    };

    const handleReply = async (feedbackId, reply) => {
        try {
            await feedbackService.replyToFeedback({ feedbackId, reply });
            fetchFeedbacks();
        } catch (err) {
            alert('Failed to send reply');
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">
                    {isAdmin ? 'All Customer Feedback' : 'Feedback Center'}
                </h2>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {!isAdmin && orders.length > 0 && (
                <div className="mb-10">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Review your recent purchases</h3>
                        <p className="text-gray-500">Submit feedback for products you bought recently.</p>
                    </div>
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order ID</p>
                                        <p className="font-semibold text-gray-900 break-all">{order._id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Order Date</p>
                                        <p className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    {order.products.filter((product) => !product.hasFeedback).map((product) => (
                                        <div key={product.productId} className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                            <p className="text-sm text-gray-500 mb-2">Product</p>
                                            <p className="text-sm font-semibold text-gray-900 break-all mb-4">
                                                {product.productId?.name || product.productId}
                                            </p>
                                            <FeedbackForm
                                                productId={product.productId?._id || product.productId}
                                                orderId={order._id}
                                                onSuccess={fetchFeedbacks}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {feedbacks.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-lg">No feedback found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {feedbacks.map((f) => (
                        <div key={f._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <span key={s} className={s <= f.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-700 italic mb-4">"{f.comment}"</p>
                            <p className="text-xs text-gray-400 mb-4">Order ID: {f.orderId}</p>
                            <p className="text-xs text-gray-400 mb-4">Product: {f.productId?.name || f.productId}</p>

                            {f.adminReply ? (
                                <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-indigo-500">
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Admin Response</p>
                                    <p className="text-gray-600 text-sm">{f.adminReply}</p>
                                </div>
                            ) : isAdmin ? (
                                <div className="mt-4">
                                    <textarea
                                        placeholder="Enter admin reply..."
                                        className="w-full p-2 text-sm border rounded-lg mb-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                                        id={`reply-${f._id}`}
                                    />
                                    <button
                                        onClick={() => {
                                            const reply = document.getElementById(`reply-${f._id}`).value;
                                            if (reply) handleReply(f._id, reply);
                                        }}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
                                    >
                                        Reply
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">Waiting for admin reply...</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedbackPage;
