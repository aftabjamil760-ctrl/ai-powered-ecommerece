import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
    const cardRef = useRef(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg)' });
    const navigate = useNavigate();

    useEffect(() => {
        // If user already logged in, redirect to home
        if (localStorage.getItem('token')) {
            navigate('/');
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

            navigate('/'); // Redirect to dashboard/home
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#05070f] px-4 py-12">
            <div className="pointer-events-none absolute -left-16 top-16 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl animate-pulse"></div>
            <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl animate-pulse"></div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle,_rgba(99,102,241,0.18),_transparent_40%)]"></div>

            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={tiltStyle}
                className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_120px_-40px_rgba(15,23,42,0.8)] backdrop-blur-2xl transition-all duration-300"
            >
                <div className="relative rounded-[1.75rem] bg-[#09101f]/95 backdrop-blur-2xl p-10 border border-white/10 shadow-[0_20px_80px_-30px_rgba(15,23,42,0.9)]">
                    <div className="mb-9 text-center">
                        <h2 className="text-5xl font-semibold tracking-tight text-white">Welcome Back</h2>
                        <p className="mt-4 text-sm text-slate-400 max-w-md mx-auto">Sign in to continue to your account</p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-3xl border border-[#ff4d6d]/20 bg-[#ff4d6d]/10 px-5 py-4 text-sm text-[#ffccd6] shadow-[0_12px_40px_-20px_rgba(255,77,109,0.45)]">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={() => window.location.href = '/api/auth/google'}
                            className="w-full flex items-center justify-center gap-3 rounded-3xl bg-[#0e172d]/90 px-5 py-4 text-base font-semibold text-white shadow-[0_20px_80px_-40px_rgba(15,23,42,0.7)] transition duration-300 hover:scale-[1.02] hover:bg-[#13204b]/80 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                        >
                            <FcGoogle size={24} />
                            Sign in with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm text-slate-400">
                                <span className="bg-[#09101f] px-3">Or continue with email</span>
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
                                className="peer w-full rounded-3xl border border-white/10 bg-[#0e172d]/90 px-5 py-4 text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition duration-300 focus:border-indigo-400 focus:bg-[#13204b]/90 focus:ring-2 focus:ring-indigo-500/20"
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
                                className="peer w-full rounded-3xl border border-white/10 bg-[#0e172d]/90 px-5 py-4 text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition duration-300 focus:border-indigo-400 focus:bg-[#13204b]/90 focus:ring-2 focus:ring-indigo-500/20"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-6 py-4 text-base font-semibold text-white shadow-[0_24px_80px_-32px_rgba(124,58,237,0.75)] transition duration-300 hover:scale-[1.01] hover:shadow-[0_28px_90px_-32px_rgba(168,85,247,0.7)] focus:outline-none focus:ring-2 focus:ring-indigo-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
