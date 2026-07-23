import React, { useState, useEffect } from 'react';
import { getAdminPaymentHistory } from '../../utils/paymentService';
import PaymentCard from '../../components/customer/PaymentCard';
import { Link } from 'react-router-dom';
import DashboardLayout, { EmptyState, GradientButton, LoadingSkeleton, PageHeader, SectionCard, StatsCard } from '../../components/dashboard/Layout';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const data = await getAdminPaymentHistory();
                setPayments(data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const totalVolume = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const successCount = payments.filter(payment => payment.status === 'completed').length;
    const pendingCount = payments.filter(payment => payment.status === 'pending').length;
    const refundsCount = payments.filter(payment => payment.status === 'refunded').length;
    const successRate = payments.length ? Math.round((successCount / payments.length) * 100) : 0;

    return (
        <DashboardLayout
            title="Payments"
            subtitle="Review payment states, transaction health, and settlement history from one premium operating view."
            actions={<Link to="/products"><GradientButton>Explore Products</GradientButton></Link>}
        >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatsCard label="Payment Volume" value={`$${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} change="Based on stored payment records" icon={<span className="text-xl">💸</span>} accent="blue" />
                <StatsCard label="Success Rate" value={`${successRate}%`} change={`${successCount} completed`} icon={<span className="text-xl">✅</span>} accent="green" />
                <StatsCard label="Pending" value={pendingCount} change="Awaiting confirmation" icon={<span className="text-xl">⏳</span>} accent="amber" />
                <StatsCard label="Refunds" value={refundsCount} change="Recorded refunds" icon={<span className="text-xl">↩️</span>} accent="purple" />
            </div>

            <PageHeader
                eyebrow="Transaction Center"
                title="Transaction History"
                description="Real payment records from the database are shown below with gateway, status, and customer details."
            />

            <SectionCard>
                {loading ? (
                    <LoadingSkeleton rows={3} />
                ) : error ? (
                    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
                ) : payments.length === 0 ? (
                    <EmptyState title="No payment history found" description="Payment activity will appear here once transactions are created." action={<Link to="/products"><GradientButton className="mt-4">Explore Products</GradientButton></Link>} />
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {payments.map(payment => (
                            <PaymentCard key={payment._id || payment.id || payment.transactionId} payment={payment} />
                        ))}
                    </div>
                )}
            </SectionCard>
        </DashboardLayout>
    );
};

export default Payments;
