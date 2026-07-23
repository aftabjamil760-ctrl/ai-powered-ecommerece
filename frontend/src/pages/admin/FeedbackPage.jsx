import React, { useState, useEffect } from 'react';
import feedbackService from '../../utils/feedbackService';
import { getMyOrders } from '../../utils/orderService';
import FeedbackForm from '../../components/customer/FeedbackForm';
import DashboardLayout, { EmptyState, GradientButton, LoadingSkeleton, PageHeader, SectionCard, StatusBadge } from '../../components/dashboard/Layout';

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
        <DashboardLayout title="Feedback" subtitle="Loading customer feedback and review activity.">
            <LoadingSkeleton rows={3} />
        </DashboardLayout>
    );

    return (
        <DashboardLayout
            title={isAdmin ? 'Feedback' : 'Feedback Center'}
            subtitle={isAdmin ? 'Review customer sentiment and respond in one premium operations panel.' : 'Share product reflections and keep your review activity organized.'}
            actions={<GradientButton>New Review</GradientButton>}
        >
            <PageHeader
                eyebrow="Customer Voice"
                title={isAdmin ? 'All Customer Feedback' : 'Feedback Center'}
                description="This panel keeps the existing review workflow intact while presenting it with a clean dashboard look."
            />

            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}

            {!isAdmin && orders.length > 0 && (
                <SectionCard>
                    <div className="mb-4">
                        <h3 className="text-2xl font-semibold text-white">Review your recent purchases</h3>
                        <p className="mt-2 text-sm text-slate-300">Submit feedback for products you bought recently.</p>
                    </div>
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="rounded-[22px] border border-white/10 bg-slate-950/40 p-5">
                                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Order ID</p>
                                        <p className="mt-1 font-semibold text-white break-all">{order._id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Order Date</p>
                                        <p className="mt-1 font-semibold text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    {order.products.filter((product) => !product.hasFeedback).map((product) => (
                                        <div key={product.productId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Product</p>
                                            <p className="mt-2 text-sm font-semibold text-white break-all">{product.productId?.name || product.productId}</p>
                                            <div className="mt-4"><FeedbackForm productId={product.productId?._id || product.productId} orderId={order._id} onSuccess={fetchFeedbacks} /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {feedbacks.length === 0 ? (
                <EmptyState title="No feedback found" description="There are no customer reviews in the current collection yet." />
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {feedbacks.map((f) => (
                        <SectionCard key={f._id}>
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div className="flex gap-1 text-amber-300">{[1,2,3,4,5].map((s) => <span key={s}>{s <= f.rating ? '★' : '☆'}</span>)}</div>
                                <span className="text-xs text-slate-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="mb-4 text-slate-300 italic">“{f.comment}”</p>
                            <p className="mb-2 text-xs text-slate-400">Order ID: {f.orderId}</p>
                            <p className="mb-4 text-xs text-slate-400">Product: {f.productId?.name || f.productId}</p>

                            {f.adminReply ? (
                                <div className="rounded-2xl border border-blue-400/25 bg-blue-500/10 p-4">
                                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.30em] text-blue-200">Admin Response</p>
                                    <p className="text-sm text-slate-200">{f.adminReply}</p>
                                </div>
                            ) : isAdmin ? (
                                <div className="mt-4 space-y-2">
                                    <textarea id={`reply-${f._id}`} placeholder="Enter admin reply..." className="w-full rounded-2xl border border-white/10 bg-slate-950/45 p-3 text-sm text-white outline-none focus:border-blue-400" />
                                    <button type="button" onClick={() => { const reply = document.getElementById(`reply-${f._id}`).value; if (reply) handleReply(f._id, reply); }} className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white">Reply</button>
                                </div>
                            ) : (
                                <StatusBadge label="Waiting for admin reply" tone="slate" />
                            )}
                        </SectionCard>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default FeedbackPage;
