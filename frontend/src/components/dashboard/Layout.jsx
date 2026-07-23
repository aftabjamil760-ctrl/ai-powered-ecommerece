import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CustomerLayout from '../customer/CustomerLayout';
import {
  HiChartBar,
  HiChatAlt2,
  HiClipboardList,
  HiCog,
  HiCreditCard,
  HiHome,
  HiLogout,
  HiMenu,
  HiOutlineCollection,
  HiSearch,
  HiUsers,
} from 'react-icons/hi';
import { useNotifications } from '../../context/NotificationContext';
import Navbar from '../customer/home/Navbar';
import Footer from '../customer/home/Footer';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: HiHome },
  { label: 'Products', path: '/admin/products', icon: HiOutlineCollection },
  { label: 'Orders', path: '/admin/orders', icon: HiClipboardList },
  { label: 'Customers', path: '/admin/customers', icon: HiUsers },
  { label: 'Payments', path: '/admin/payments', icon: HiCreditCard },
  { label: 'Feedback', path: '/admin/feedback', icon: HiChatAlt2 },
  { label: 'Reports', path: '/admin/reports', icon: HiChartBar },
  { label: 'Settings', path: '/admin/settings', icon: HiCog },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sidebar = (
    <aside className="w-full lg:w-80 lg:min-h-screen">
      <div className="sticky top-4 rounded-[28px] border border-slate-800 bg-[#110a2d]/90 p-4 shadow-2xl shadow-black/40">
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0b071d]/90 px-4 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-slate-400">Apex</p>
            <h1 className="mt-1 text-xl font-semibold text-white">Commerce AI</h1>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl border border-slate-700 bg-slate-950/70 p-2 text-slate-200 lg:hidden"
          >
            <HiMenu size={18} />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  navigate(item.path);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-300 ${
                  active
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="text-lg" />
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-left text-rose-200 transition hover:bg-rose-500/20"
          >
            <HiLogout className="text-lg" />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/30"
        >
          <HiMenu size={18} />
          Menu
        </button>
        {mobileOpen && <div className="mb-4">{sidebar}</div>}
      </div>
      <div className="hidden lg:block">{sidebar}</div>
    </>
  );
};

export const TopNavbar = ({ actions }) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="mb-8 rounded-[28px] border border-slate-800 bg-[#0f1228]/95 p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/90 px-4 py-2">
          <HiSearch className="text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
        </div>

        {/* Center Icons */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/notifications')}
            className="relative rounded-full p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          <button className="p-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-full transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 015.646 5.646 9 9 0 0120.354 15.354z" />
            </svg>
          </button>

          <button className="p-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-full transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </button>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-xs font-bold text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="text-xs font-semibold text-white">{user?.name || 'Admin'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/20 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-slate-800 bg-[#0f1228]/95 p-6 shadow-[0_25px_80px_-45px_rgba(99,102,241,0.95)] backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between">
    <div>
      {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-slate-400">{eyebrow}</p>}
      <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">{title}</h1>
      {description && <p className="mt-3 max-w-3xl text-sm text-slate-400">{description}</p>}
    </div>
    {actions}
  </div>
);

export const SectionCard = ({ children, className = '' }) => (
  <motion.section
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className={`rounded-[26px] border border-slate-800 bg-[#0e122c]/90 p-5 shadow-[0_30px_80px_-45px_rgba(37,99,235,0.65)] backdrop-blur-xl ${className}`}
  >
    {children}
  </motion.section>
);

export const StatsCard = ({ label, value, change, icon, accent = 'blue' }) => {
  const accentMap = {
    blue: 'from-blue-500/20 to-cyan-500/10 text-blue-300',
    purple: 'from-purple-500/20 to-fuchsia-500/10 text-purple-300',
    green: 'from-emerald-500/20 to-teal-500/10 text-emerald-300',
    amber: 'from-amber-500/20 to-orange-500/10 text-amber-300',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-[24px] border border-slate-800 bg-[#0f1228]/90 p-5 shadow-[0_22px_60px_-35px_rgba(99,102,241,0.95)] backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{label}</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{value}</h3>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br px-3 py-2 ${accentMap[accent]}`}>{icon}</div>
      </div>
      <div className="mt-4 text-sm text-emerald-300">{change}</div>
    </motion.div>
  );
};

export const GradientButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_20px_60px_-30px_rgba(99,102,241,0.9)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const SearchInput = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative">
    <HiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
    />
  </div>
);

export const StatusBadge = ({ label, tone = 'blue' }) => {
  const tones = {
    blue: 'border-blue-400/25 bg-blue-400/10 text-blue-200',
    purple: 'border-purple-400/25 bg-purple-400/10 text-purple-200',
    green: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
    amber: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
    red: 'border-rose-400/25 bg-rose-400/10 text-rose-200',
    slate: 'border-slate-400/25 bg-slate-400/10 text-slate-200',
  };

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{label}</span>;
};

export const EmptyState = ({ title, description, action }) => (
  <div className="rounded-[24px] border border-dashed border-slate-700 bg-slate-950/40 px-6 py-12 text-center">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-3xl">✨</div>
    <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
    {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
    {action}
  </div>
);

export const LoadingSkeleton = ({ rows = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="rounded-[24px] border border-slate-800 bg-slate-950/90 p-4">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-800" />
        <div className="mt-3 h-10 animate-pulse rounded-2xl bg-slate-800" />
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-slate-800" />
      </div>
    ))}
  </div>
);

const customerNavItems = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Orders', path: '/orders' },
  { label: 'Payments', path: '/payments' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Settings', path: '/settings' },
];

const CustomerPublicLayout = ({ title, subtitle, actions, children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-lg font-bold text-white shadow-lg">A</div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">Apex Sport</div>
              <div className="text-sm font-semibold text-slate-900">Premium Storefront</div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {customerNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${location.pathname === item.path
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {actions}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6 lg:py-8">
        <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_-40px_rgba(15,23,42,0.35)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-slate-500">Premium Control Center</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
        </div>
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export const DashboardLayout = ({ title, subtitle, actions, children }) => {
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }

  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  if (!isAdmin) {
    return (
      <CustomerLayout>
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-black/5">
            <div className="mb-6 max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Premium Storefront</p>
              <h1 className="mt-3 text-4xl font-display text-foreground">{title}</h1>
              {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
              {actions && <div className="mt-6">{actions}</div>}
            </div>
            {children}
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a1f] text-slate-100">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -right-10 top-1/3 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-[1600px] px-4 py-4 lg:px-6 lg:py-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <Sidebar />
          <main className="min-w-0 flex-1">
            <TopNavbar title={title} subtitle={subtitle} actions={actions} />
            <div className="space-y-6">{children}</div>
          </main>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/admin/chatbot')}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-[0_18px_50px_-20px_rgba(99,102,241,0.95)] transition duration-300 hover:-translate-y-1 hover:scale-105"
        aria-label="Open admin chatbot"
      >
        <HiChatAlt2 size={24} />
      </button>
    </div>
  );
};

export default DashboardLayout;
