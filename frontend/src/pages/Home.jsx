import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chatbot from '../components/Chatbot';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState('customer');
    const [showChatbot, setShowChatbot] = useState(false);

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

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        E-Commerce Dashboard
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/20 transition duration-200"
                    >
                        Delete Account & Logout
                    </button>
                </div>

                <div className="bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4">Welcome back, {user.name}!</h2>
                    <p className="text-gray-400 mb-6">
                        You have successfully logged in. This is your protected dashboard.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div
                            onClick={() => navigate('/products')}
                            className="bg-gray-700/50 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition duration-200 border border-blue-500/30"
                        >
                            <h3 className="font-bold mb-2 text-blue-400">Explore Products</h3>
                            <p className="text-sm text-gray-400">Browse our latest collection</p>
                        </div>
                        <div
                            onClick={() => navigate('/orders')}
                            className="bg-gray-700/50 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition duration-200"
                        >
                            <h3 className="font-bold mb-2 text-purple-400">Orders</h3>
                            <p className="text-sm text-gray-400">View your order history</p>
                        </div>
                        <div
                            onClick={() => navigate('/payments')}
                            className="bg-gray-700/50 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition duration-200"
                        >
                            <h3 className="font-bold mb-2 text-green-400">Payments</h3>
                            <p className="text-sm text-gray-400">Manage transaction history</p>
                        </div>
                        <div
                            onClick={() => navigate('/feedback')}
                            className="bg-gray-700/50 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition duration-200 border border-purple-500/30"
                        >
                            <h3 className="font-bold mb-2 text-purple-400">Feedback</h3>
                            <p className="text-sm text-gray-400">See reviews and responses for orders</p>
                        </div>
                        {user.role === 'admin' && (
                            <div
                                onClick={() => navigate('/analytics')}
                                className="bg-gray-700/50 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition duration-200 border border-yellow-500/30"
                            >
                                <h3 className="font-bold mb-2 text-yellow-400">Analytics</h3>
                                <p className="text-sm text-gray-400">View site performance and reports</p>
                            </div>
                        )}
                        <div className="bg-gray-700/50 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition duration-200">
                            <h3 className="font-bold mb-2 text-green-400">Support</h3>
                            <p className="text-sm text-gray-400">Get help with your purchases</p>
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={() => setShowChatbot(true)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-3xl shadow-lg transition duration-200 hover:scale-105"
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
