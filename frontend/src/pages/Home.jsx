import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import {
    HiOutlineShoppingCart,
    HiOutlineClipboardList,
    HiOutlineCreditCard,
    HiOutlineChatAlt2,
    HiOutlineChartBar,
    HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState('customer');
    const [showChatbot, setShowChatbot] = useState(false);
    const cardRefs = useRef(new Map());

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token) {
            navigate('/login');
        } else {
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setUserRole(parsedUser.role || 'customer');
            }
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Determine API URL: Use env if available or fallback to relative path for proxy
                // Note: Frontend proxy in vite/package.json usually handles relative paths
                await fetch('/api/auth/delete', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Error deleting account:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    if (!user) return null; // or a loading spinner

    const handleMouseMove = (e, id) => {
        const node = cardRefs.current.get(id);
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top; // y position within the element.
        const midX = rect.width / 2;
        const midY = rect.height / 2;
        const rotateY = ((x - midX) / midX) * 6; // max 6deg
        const rotateX = -((y - midY) / midY) * 6; // max 6deg
        node.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        node.style.transition = 'transform 0s';
    };

    const handleMouseLeave = (id) => {
        const node = cardRefs.current.get(id);
        if (!node) return;
        node.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        node.style.transition = 'transform 400ms cubic-bezier(.2,.8,.2,1)';
    };

    return (
        <div className="min-h-screen text-white p-8 bg-[#071029] relative overflow-hidden">

            {/* Background Orbs */}
            <div className="absolute -top-40 -left-20 w-80 h-80 bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-400 rounded-full opacity-30 blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-700 rounded-full opacity-25 blur-3xl animate-pulse delay-150" />
            <div className="absolute top-10 right-1/2 w-64 h-64 bg-gradient-to-r from-pink-500 to-violet-600 rounded-full opacity-10 blur-2xl" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header / Navbar */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-6">
                        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            E-Commerce Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur rounded-2xl px-3 py-2 border border-white/6">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-semibold text-white shadow-sm">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400">{user.name}</div>
                                <div className="text-xs text-gray-400">{user.email}</div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 text-sm font-semibold shadow-md hover:brightness-105 transition">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Welcome card */}
                <div className="bg-white/4 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/6 mb-8">
                    <h2 className="text-2xl font-semibold mb-2">Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400">{user.name}</span>!</h2>
                    <p className="text-gray-300">You have successfully logged in. This is your protected dashboard.</p>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Explore Products */}
                    <div
                        ref={(el) => cardRefs.current.set('products', el)}
                        onMouseMove={(e) => handleMouseMove(e, 'products')}
                        onMouseLeave={() => handleMouseLeave('products')}
                        onClick={() => navigate('/products')}
                        className="relative bg-white/3 backdrop-blur-xl rounded-2xl p-6 cursor-pointer border border-white/6 hover:shadow-2xl transition-transform duration-300 hover:-translate-y-2"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
                                <HiOutlineShoppingCart size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-blue-200">Explore Products</h3>
                                <p className="text-sm text-gray-300">Browse our latest collection</p>
                            </div>
                        </div>
                    </div>

                    {/* Orders */}
                    <div
                        ref={(el) => cardRefs.current.set('orders', el)}
                        onMouseMove={(e) => handleMouseMove(e, 'orders')}
                        onMouseLeave={() => handleMouseLeave('orders')}
                        onClick={() => navigate('/orders')}
                        className="relative bg-white/3 backdrop-blur-xl rounded-2xl p-6 cursor-pointer border border-white/6 hover:shadow-2xl transition-transform duration-300 hover:-translate-y-2"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
                                <HiOutlineClipboardList size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-purple-200">Orders</h3>
                                <p className="text-sm text-gray-300">View your order history</p>
                            </div>
                        </div>
                    </div>

                    {/* Payments */}
                    <div
                        ref={(el) => cardRefs.current.set('payments', el)}
                        onMouseMove={(e) => handleMouseMove(e, 'payments')}
                        onMouseLeave={() => handleMouseLeave('payments')}
                        onClick={() => navigate('/payments')}
                        className="relative bg-white/3 backdrop-blur-xl rounded-2xl p-6 cursor-pointer border border-white/6 hover:shadow-2xl transition-transform duration-300 hover:-translate-y-2"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-400 to-teal-500 text-white shadow-md">
                                <HiOutlineCreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-green-200">Payments</h3>
                                <p className="text-sm text-gray-300">Manage transaction history</p>
                            </div>
                        </div>
                    </div>

                    {/* Feedback */}
                    <div
                        ref={(el) => cardRefs.current.set('feedback', el)}
                        onMouseMove={(e) => handleMouseMove(e, 'feedback')}
                        onMouseLeave={() => handleMouseLeave('feedback')}
                        onClick={() => navigate('/feedback')}
                        className="relative bg-white/3 backdrop-blur-xl rounded-2xl p-6 cursor-pointer border border-white/6 hover:shadow-2xl transition-transform duration-300 hover:-translate-y-2"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                                <HiOutlineChatAlt2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-purple-200">Feedback</h3>
                                <p className="text-sm text-gray-300">See reviews and responses for orders</p>
                            </div>
                        </div>
                    </div>

                    {/* Analytics - keep visibility logic */}
                    {user.role === 'admin' && (
                        <div
                            ref={(el) => cardRefs.current.set('analytics', el)}
                            onMouseMove={(e) => handleMouseMove(e, 'analytics')}
                            onMouseLeave={() => handleMouseLeave('analytics')}
                            onClick={() => navigate('/analytics')}
                            className="relative bg-white/3 backdrop-blur-xl rounded-2xl p-6 cursor-pointer border border-white/6 hover:shadow-2xl transition-transform duration-300 hover:-translate-y-2"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-md">
                                    <HiOutlineChartBar size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-yellow-200">Analytics</h3>
                                    <p className="text-sm text-gray-300">View site performance and reports</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Support */}
                    <div
                        ref={(el) => cardRefs.current.set('support', el)}
                        onMouseMove={(e) => handleMouseMove(e, 'support')}
                        onMouseLeave={() => handleMouseLeave('support')}
                        className="relative bg-white/3 backdrop-blur-xl rounded-2xl p-6 cursor-pointer border border-white/6 hover:shadow-2xl transition-transform duration-300 hover:-translate-y-2"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-400 to-green-500 text-white shadow-md">
                                <HiOutlineQuestionMarkCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-green-200">Support</h3>
                                <p className="text-sm text-gray-300">Get help with your purchases</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chatbot trigger */}
            <button
                type="button"
                onClick={() => setShowChatbot(true)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl shadow-xl transition transform-gpu duration-200 hover:scale-105"
                aria-label="Open chatbot"
            >
                🤖
            </button>

            {showChatbot && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowChatbot(false)}
                >
                    <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setShowChatbot(false)}
                            className="absolute right-2 top-2 z-10 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-700 shadow hover:bg-white"
                        >
                            ✕
                        </button>
                        <Chatbot />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
