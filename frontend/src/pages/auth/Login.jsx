import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
    const cardRef = useRef(null);
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg)' });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const destination = storedUser?.role === 'admin' ? '/admin/dashboard' : '/';
            navigate(destination);
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    }, [navigate]);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
        const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 8;

        setTiltStyle({ transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` });
    };

    const handleMouseLeave = () => {
        setTiltStyle({ transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg)' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            const destination = location.state?.from || (data.user?.role === 'admin' ? '/admin/dashboard' : '/');
            navigate(destination);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
            <div className="pointer-events-none absolute -left-16 top-16 h-72 w-72 rounded-full bg-slate-300/80 blur-3xl"></div>
            <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-slate-200/70 blur-3xl"></div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle,_rgba(148,163,184,0.25),_transparent_40%)]"></div>

            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={tiltStyle}
                className="relative z-10 w-full max-w-md rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_120px_-40px_rgba(15,23,42,0.08)] transition-all duration-300"
            >
                <div className="relative rounded-[1.75rem] bg-white p-10 shadow-sm">
                    <div className="mb-9 text-center">
                        <h2 className="text-5xl font-semibold tracking-tight text-slate-900">Welcome Back</h2>
                        <p className="mt-4 text-sm text-slate-500 max-w-md mx-auto">Sign in to continue to your account</p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-3xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={() => window.location.href = '/api/auth/google'}
                            className="w-full flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-base font-semibold text-slate-900 shadow-sm transition duration-300 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        >
                            <FcGoogle size={24} />
                            Sign in with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm text-slate-500">
                                <span className="bg-white px-3">Or continue with email</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.26em] text-slate-500 mb-3">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="peer w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition duration-300 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-300"
                                placeholder="john@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.26em] text-slate-500 mb-3">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="peer w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition duration-300 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-300"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-3xl bg-slate-900 px-6 py-4 text-base font-semibold text-white shadow-sm transition duration-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-white transition duration-200 hover:text-indigo-300">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
