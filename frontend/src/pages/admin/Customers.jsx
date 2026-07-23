import React, { useEffect, useMemo, useState } from 'react';
import { HiDotsVertical, HiFilter } from 'react-icons/hi';
import analyticsService from '../../utils/analyticsService';
import DashboardLayout, { EmptyState, GradientButton, LoadingSkeleton, SearchInput, SectionCard, StatsCard, StatusBadge } from '../../components/dashboard/Layout';
import { Link } from 'react-router-dom';

const statusTone = (segment) => {
  if (segment === 'vip') return 'purple';
  if (segment === 'regular') return 'blue';
  if (segment === 'new') return 'green';
  return 'slate';
};

const Customers = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState({ totalCustomers: 0, newCustomers: 0, activeCustomers: 0, vipCustomers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await analyticsService.getCustomerAnalytics();
        const result = response.data || response;
        const rows = result.customers || result.topCustomers || [];

        const totalCustomers = result.totalCustomers || rows.length;
        const newCustomers = result.newCustomers || rows.filter((customer) => customer.customerSegment === 'new').length;
        const vipCustomers = rows.filter((customer) => customer.customerSegment === 'vip').length;
        const activeCustomers = rows.filter((customer) => ['regular', 'vip'].includes(customer.customerSegment)).length;

        setMetrics({ totalCustomers, newCustomers, activeCustomers, vipCustomers });
        setCustomers(rows.map((item) => ({
          id: item._id || item.userId?._id || item.userId?.email,
          name: item.userId?.name || item.name || item.userId?.email || 'Customer',
          email: item.userId?.email || item.email || 'unknown@example.com',
          orders: item.totalOrders || item.orderHistory?.length || 0,
          spent: item.totalSpent || item.lifetimeValue || 0,
          status: item.customerSegment || 'new',
          lastOrderDate: item.lastOrderDate,
          segment: item.customerSegment || 'new'
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const query = [customer.name, customer.email].join(' ').toLowerCase();
      const matchesSearch = query.includes(search.toLowerCase());
      const matchesFilter = filter === 'All' || customer.status === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [filter, search, customers]);

  const paginatedCustomers = filteredCustomers.slice((page - 1) * 10, page * 10);

  return (
    <DashboardLayout
      title="Customers"
      subtitle="Track account health, loyalty, and purchase behavior from the real customer database."
      actions={
        <Link to="/admin/reports">
          <GradientButton>Export Report</GradientButton>
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Customers" value={metrics.totalCustomers.toLocaleString()} change="Real customer records" icon={<span className="text-xl">👥</span>} accent="blue" />
        <StatsCard label="Active Customers" value={metrics.activeCustomers.toLocaleString()} change="Purchased recently" icon={<span className="text-xl">⚡</span>} accent="purple" />
        <StatsCard label="New Customers" value={metrics.newCustomers.toLocaleString()} change="Joined this month" icon={<span className="text-xl">🌟</span>} accent="green" />
        <StatsCard label="VIP Customers" value={metrics.vipCustomers.toLocaleString()} change="High lifetime value" icon={<span className="text-xl">💎</span>} accent="amber" />
      </div>

      <SectionCard>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="md:w-[320px]">
              <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <HiFilter className="text-lg" />
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-transparent text-sm text-slate-900 outline-none">
                <option value="All">All</option>
                <option value="new">New</option>
                <option value="regular">Regular</option>
                <option value="vip">VIP</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-slate-500">Showing {filteredCustomers.length} customers</div>
        </div>

        {loading ? (
          <LoadingSkeleton rows={4} />
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState title="No customers found" description="Try widening your search or using a different filter." action={<GradientButton className="mt-4" onClick={() => { setFilter('All'); setSearch(''); }}>Reset Filters</GradientButton>} />
        ) : (
          <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.22em] text-slate-500">
                  <tr>
                    <th className="px-4 py-4">Customer</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">Orders</th>
                    <th className="px-4 py-4">Lifetime Value</th>
                    <th className="px-4 py-4">Segment</th>
                    <th className="px-4 py-4">Last Order</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-semibold text-slate-900">{customer.name}</td>
                      <td className="px-4 py-4 text-slate-500">{customer.email}</td>
                      <td className="px-4 py-4 text-slate-500">{customer.orders}</td>
                      <td className="px-4 py-4 text-slate-500">${customer.spent.toLocaleString()}</td>
                      <td className="px-4 py-4"><StatusBadge label={customer.status.toUpperCase()} tone={statusTone(customer.status)} /></td>
                      <td className="px-4 py-4 text-slate-500">{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-4 text-slate-500">
                        <button type="button" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 hover:bg-slate-100">
                          <HiDotsVertical />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">Page {page} of {Math.max(1, Math.ceil(filteredCustomers.length / 10))}</div>
          <div className="flex gap-2">
            <GradientButton onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>Previous</GradientButton>
            <GradientButton onClick={() => setPage((prev) => Math.min(prev + 1, Math.max(1, Math.ceil(filteredCustomers.length / 10))))}>Next</GradientButton>
          </div>
        </div>
      </SectionCard>
    </DashboardLayout>
  );
};

export default Customers;
