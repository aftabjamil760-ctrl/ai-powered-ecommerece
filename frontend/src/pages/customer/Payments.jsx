import React, { useState, useEffect } from 'react';
import { getPaymentHistory } from '../../utils/paymentService';
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
        <DashboardLayout
            title="Payments"
            subtitle="Review payment states, transaction health, and settlement history from one premium operating view."
            actions={<Link to="/products"><GradientButton>Explore Products</GradientButton></Link>}
        >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatsCard label="Payment Volume" value="$12.8K" change="+9.4% vs last week" icon={<span className="text-xl">💸</span>} accent="blue" />
                <StatsCard label="Success Rate" value="98.4%" change="Stable processing" icon={<span className="text-xl">✅</span>} accent="green" />
                <StatsCard label="Pending" value="24" change="3 awaiting review" icon={<span className="text-xl">⏳</span>} accent="amber" />
                <StatsCard label="Refunds" value="8" change="2 claims opened" icon={<span className="text-xl">↩️</span>} accent="purple" />
            </div>

            <PageHeader
                eyebrow="Transaction Center"
                title="Transaction History"
                description="Keep a consistent premium look while preserving the original payment services and state handling."
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
                            <PaymentCard key={payment.id} payment={payment} />
                        ))}
                    </div>
                )}
            </SectionCard>
        </DashboardLayout>
    );
};

export default Payments;
