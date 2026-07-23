import React, { useState, useEffect } from 'react';
import { getMyOrders } from '../../utils/orderService';
import OrderCard from '../../components/customer/OrderCard';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import { EmptyState, GradientButton, LoadingSkeleton } from '../../components/dashboard/Layout';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await getMyOrders();
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
        <CustomerLayout>
            <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
                <div className="mb-8 flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Order Center</p>
                        <h1 className="mt-3 text-4xl font-semibold text-slate-950">My Order History</h1>
                        <p className="mt-3 max-w-3xl text-sm text-slate-600">Review your purchases and keep track of every checkout in a clean light layout.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link to="/products" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Start Shopping</Link>
                        <input
                            type="search"
                            placeholder="Search orders..."
                            className="min-w-[260px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <LoadingSkeleton rows={3} />
                    ) : error ? (
                        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
                    ) : orders.length === 0 ? (
                        <EmptyState title="No orders yet" description="You haven’t placed any orders yet. Start shopping to see order activity here." action={<Link to="/products"><GradientButton className="mt-4">Explore Products</GradientButton></Link>} />
                    ) : (
                        <div className="space-y-6">
                            {orders.map(order => (
                                <OrderCard key={order._id} order={order} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
};

export default Orders;
