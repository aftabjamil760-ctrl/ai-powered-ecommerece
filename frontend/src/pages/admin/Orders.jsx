import React, { useState, useEffect } from 'react';
import { getAdminOrders, downloadInvoice } from '../../utils/orderService';
import { Link } from 'react-router-dom';
import DashboardLayout, { EmptyState, GradientButton, LoadingSkeleton, PageHeader, SearchInput, SectionCard } from '../../components/dashboard/Layout';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await getAdminOrders();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <DashboardLayout
            title="Orders"
            subtitle="Monitor fulfillment, review payment states, and keep every purchase aligned with your premium storefront dashboard."
            actions={<Link to="/products"><GradientButton>Start Shopping</GradientButton></Link>}
        >
            <PageHeader
                eyebrow="Order Center"
                title="My Order History"
                description="Your orders are surfaced with the same premium layout and glass cards used across the full commerce workspace."
                actions={<SearchInput placeholder="Search orders..." />}
            />

            <SectionCard>
                {loading ? (
                    <LoadingSkeleton rows={3} />
                ) : error ? (
                    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
                ) : orders.length === 0 ? (
                    <EmptyState title="No orders yet" description="No customer orders have been recorded yet." action={<Link to="/products"><GradientButton className="mt-4">Explore Products</GradientButton></Link>} />
                ) : (
                    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
                        <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                            <div className="col-span-2">Order ID</div>
                            <div className="col-span-2">Customer</div>
                            <div className="col-span-2">Products</div>
                            <div className="col-span-2">Total</div>
                            <div className="col-span-1">Payment</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-1">Invoice</div>
                        </div>
                        {orders.map((order) => (
                            <div key={order._id} className="grid grid-cols-12 gap-4 border-b border-slate-100 px-4 py-4 last:border-0 hover:bg-slate-50 transition-colors">
                                <div className="col-span-2 font-mono text-sm text-slate-700">#{order._id.slice(-6)}</div>
                                <div className="col-span-2 text-sm text-slate-900">{order.userId?.name || 'Guest'}<br /><span className="text-slate-500 text-xs">{order.userId?.email || 'no-email'}</span></div>
                                <div className="col-span-2 text-sm text-slate-700">
                                    {order.products?.map((item, idx) => (
                                        <div key={idx} className="truncate">{item.productId?.name || 'Product'} x{item.quantity}</div>
                                    ))}
                                </div>
                                <div className="col-span-2 text-sm font-semibold text-slate-900">${order.totalAmount?.toFixed(2) ?? '0.00'}</div>
                                <div className="col-span-1 text-sm font-semibold text-slate-900">{order.paymentStatus || 'pending'}</div>
                                <div className="col-span-1 text-sm font-semibold text-slate-900">{order.orderStatus || 'processing'}</div>
                                <div className="col-span-2 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                <div className="col-span-1">
                                    {order.paymentStatus === 'success' ? (
                                        <button onClick={() => downloadInvoice(order._id)} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                                            Download
                                        </button>
                                    ) : (
                                        <span className="text-xs text-slate-400">N/A</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </DashboardLayout>
    );
};

export default Orders;
