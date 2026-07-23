import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
  const location = useLocation();
  const from = location.state?.from || '/products';
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
            navigate('/verify-code', { state: { email: formData.email, from } });
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

            <div className="relative z-10 w-full max-w-xl">
                <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.22),transparent_45%)]"></div>
                    <div className="relative rounded-[1.75rem] bg-white p-10 shadow-sm">
                        <div className="mb-9 text-center">
                            <h2 className="text-5xl font-semibold tracking-tight text-slate-900">
                                Create Account
                            </h2>
                            <p className="mt-4 text-sm text-slate-500 max-w-md mx-auto">
                                Join us and start your journey.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 rounded-3xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
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
                                    className="peer w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition duration-300 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-300"
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
                                    className="peer w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition duration-300 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-300"
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
                                        className="peer w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 pr-14 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition duration-300 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-300"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-500 transition duration-300 hover:border-slate-400 hover:text-slate-900 focus:outline-none"
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-3xl bg-slate-900 px-6 py-4 text-base font-semibold text-white shadow-sm transition duration-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
