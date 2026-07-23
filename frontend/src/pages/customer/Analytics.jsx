import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import DashboardLayout from '../../components/dashboard/Layout';
import analyticsService from '../../utils/analyticsService';

const Analytics = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('7days');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        if (!parsedUser || parsedUser.role !== 'admin') {
            navigate('/');
        } else {
            setIsAdmin(true);
        }
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const stats = await analyticsService.getDashboardStats();
            setData(stats.data);
        } catch {
            setError('Failed to load analytics data. Ensure you are logged in as an admin.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [isAdmin]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
            <div className="bg-red-500/10 border border-red-500 p-6 rounded-2xl max-w-md text-center">
                <p className="text-red-500 font-bold mb-4">{error}</p>
                <button onClick={fetchData} className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition-all">Retry</button>
            </div>
        </div>
    );

    const { keyMetrics, salesChartData, topProducts, topCategories, customerSegments } = data;

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <DashboardLayout
            title="Dashboard"
            subtitle="Real-time performance and customer insights dashboard"
            actions={
                <div className="flex bg-gray-800/50 p-1 rounded-2xl border border-gray-700/50 backdrop-blur-xl">
                    {['7days', '30days', '12months'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${timeRange === range ? 'bg-blue-600 shadow-lg shadow-blue-500/20 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {range === '7days' ? '1W' : range === '30days' ? '1M' : '1Y'}
                        </button>
                    ))}
                </div>
            }
        >
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Total Revenue', value: `$${keyMetrics.totalRevenue?.toLocaleString()}`, change: '+12.5%', icon: '💰', color: 'blue' },
                    { label: 'Total Orders', value: keyMetrics.totalOrders, change: '+5.2%', icon: '📦', color: 'indigo' },
                    { label: 'Total Customers', value: keyMetrics.totalCustomers, change: '+8.1%', icon: '👥', color: 'emerald' },
                    { label: 'Conversion Rate', value: `${keyMetrics.conversionRate}%`, change: '-1.4%', icon: '📈', color: 'amber' }
                ].map((card, i) => (
                    <div key={i} className="bg-gray-800/40 border border-gray-700/50 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.color}-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-all duration-700`}></div>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-2xl">{card.icon}</span>
                            <p className="text-gray-400 font-medium text-sm tracking-wide uppercase">{card.label}</p>
                        </div>
                        <div className="flex items-end justify-between">
                            <h2 className="text-3xl font-black">{card.value}</h2>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${card.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {card.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-gray-800/40 border border-gray-700/50 p-8 rounded-[2.5rem] backdrop-blur-xl hover:border-blue-500/20 transition-all duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black flex items-center gap-3">
                            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                            Revenue Trend
                        </h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Dynamic Visualization</p>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesChartData.data}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Performance */}
                <div className="bg-gray-800/40 border border-gray-700/50 p-8 rounded-[2.5rem] backdrop-blur-xl hover:border-indigo-500/20 transition-all duration-500">
                    <h3 className="text-xl font-black flex items-center gap-3 mb-8">
                        <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                        Category Distribution
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={topCategories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="totalRevenue"
                                >
                                    {topCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 space-y-4">
                        {topCategories.map((cat, i) => (
                            <div key={i} className="flex justify-between items-center group cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <span className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">{cat.category}</span>
                                </div>
                                <span className="text-sm font-black text-gray-100">${cat.totalRevenue?.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                {/* Top Products */}
                <div className="bg-gray-800/40 border border-gray-700/50 p-8 rounded-[2.5rem] backdrop-blur-xl">
                    <h3 className="text-xl font-black flex items-center gap-3 mb-8">
                        <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                        Top Selling Products
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-xs uppercase tracking-widest border-b border-gray-700/50">
                                    <th className="pb-4 font-bold">Product</th>
                                    <th className="pb-4 font-bold">Category</th>
                                    <th className="pb-4 font-bold text-center">Sales</th>
                                    <th className="pb-4 font-bold text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/30">
                                {topProducts.map((p, i) => (
                                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-4 font-bold text-sm">
                                            <div className="flex items-center gap-3">
                                                {p.image && <img src={p.image} className="w-8 h-8 rounded-lg object-cover" />}
                                                {p.name}
                                            </div>
                                        </td>
                                        <td className="py-4 text-xs font-semibold text-gray-400">{p.category}</td>
                                        <td className="py-4 text-center font-black text-sm">{p.totalSold}</td>
                                        <td className="py-4 text-right font-black text-blue-400 text-sm">${p.totalRevenue?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Customer Segments */}
                <div className="bg-gray-800/40 border border-gray-700/50 p-8 rounded-[2.5rem] backdrop-blur-xl">
                    <h3 className="text-xl font-black flex items-center gap-3 mb-8">
                        <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
                        Customer Segmentation
                    </h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={customerSegments}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        {customerSegments.map((seg, i) => (
                            <div key={i} className="bg-gray-900/40 p-4 rounded-2xl border border-gray-700/30">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">{seg._id}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-black">{seg.count}</span>
                                    <span className="text-xs text-gray-400 font-medium">customers</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Analytics;
