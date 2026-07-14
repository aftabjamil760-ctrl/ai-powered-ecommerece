import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // alert('Registration successful! Please check your email to verify your account.');
            navigate('/verify-code', { state: { email: formData.email } });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#05070f] px-4 py-12">
            <div className="pointer-events-none absolute -left-16 top-16 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl animate-float-slow"></div>
            <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl animate-float-slow"></div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle,_rgba(99,102,241,0.18),_transparent_40%)]"></div>

            <div className="relative z-10 w-full max-w-xl">
                <div className="glass-card relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_120px_-40px_rgba(15,23,42,0.8)]">
                    <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.22),transparent_45%)]"></div>
                    <div className="relative rounded-[1.75rem] bg-[#09101f]/95 backdrop-blur-2xl p-10 shadow-[0_20px_80px_-30px_rgba(15,23,42,0.9)] border border-white/10">
                        <div className="mb-9 text-center">
                            <h2 className="text-5xl font-semibold tracking-tight text-white">
                                Create Account
                            </h2>
                            <p className="mt-4 text-sm text-slate-400 max-w-md mx-auto">
                                Join us and start your journey.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 rounded-3xl border border-[#ff4d6d]/20 bg-[#ff4d6d]/10 px-5 py-4 text-sm text-[#ffccd6] shadow-[0_12px_40px_-20px_rgba(255,77,109,0.45)]">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-[0.26em] text-slate-500 mb-3">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="peer w-full rounded-3xl border border-white/10 bg-[#0e172d]/90 px-5 py-4 text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition duration-300 focus:border-indigo-400 focus:bg-[#13204b]/90 focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-[0.26em] text-slate-500 mb-3">
                                    Email Address
                                </label>
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
                                <label className="block text-xs font-semibold uppercase tracking-[0.26em] text-slate-500 mb-3">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="peer w-full rounded-3xl border border-white/10 bg-[#0e172d]/90 px-5 py-4 pr-14 text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition duration-300 focus:border-indigo-400 focus:bg-[#13204b]/90 focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition duration-300 hover:border-indigo-400 hover:text-white focus:outline-none"
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-6 py-4 text-base font-semibold text-white shadow-[0_24px_80px_-32px_rgba(124,58,237,0.75)] transition duration-300 hover:scale-[1.01] hover:shadow-[0_28px_90px_-32px_rgba(168,85,247,0.7)] focus:outline-none focus:ring-2 focus:ring-indigo-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-white transition duration-200 hover:text-indigo-300">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
