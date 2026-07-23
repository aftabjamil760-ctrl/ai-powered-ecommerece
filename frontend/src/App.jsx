import React, { Component } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifySuccess from './pages/auth/VerifySuccess';
import VerifyCode from './pages/auth/VerifyCode';
import GoogleCallback from './pages/auth/GoogleCallback';
import Home from './pages/Home';
import CustomerProducts from './pages/customer/Products';
import Cart from './pages/customer/Cart';
import CustomerProductDetails from './pages/customer/ProductDetails';
import CustomerOrders from './pages/customer/Orders';
import CustomerCheckout from './pages/customer/Checkout';
import CustomerPayments from './pages/customer/Payments';
import CustomerPaymentStatus from './pages/customer/PaymentStatus';
import CustomerFeedbackPage from './pages/customer/FeedbackPage';
import CustomerSettings from './pages/customer/Settings';
import CustomerNotificationPage from './pages/customer/NotificationPage';
import AdminAnalytics from './pages/admin/Analytics';
import AdminCustomers from './pages/admin/Customers';
import AdminOrders from './pages/admin/Orders';
import AdminPayments from './pages/admin/Payments';
import AdminFeedbackPage from './pages/admin/FeedbackPage';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AdminNotificationPage from './pages/admin/NotificationPage';
import Chatbot from './components/chatbot/Chatbot';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const RoleRoute = ({ allowedRole, children }) => {
  const user = getStoredUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/'} replace />;
  }

  return children;
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-xl w-full rounded-xl border border-red-200 bg-white p-6 shadow-lg">
            <h1 className="text-2xl font-semibold text-red-700">Something went wrong.</h1>
            <p className="mt-2 text-gray-600">An unexpected error occurred while loading the application.</p>
            <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-3 text-sm text-gray-800">
              {this.state.error?.toString()}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


const App = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-success" element={<VerifySuccess />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/google-callback" element={<GoogleCallback />} />

          <Route path="/" element={<Home />} />
          <Route path="/products" element={<CustomerProducts />} />
          <Route path="/cart" element={<RoleRoute allowedRole="customer"><Cart /></RoleRoute>} />
          <Route path="/product/:id" element={<RoleRoute allowedRole="customer"><CustomerProductDetails /></RoleRoute>} />
          <Route path="/orders" element={<RoleRoute allowedRole="customer"><CustomerOrders /></RoleRoute>} />
          <Route path="/checkout" element={<RoleRoute allowedRole="customer"><CustomerCheckout /></RoleRoute>} />
          <Route path="/payments" element={<RoleRoute allowedRole="customer"><CustomerPayments /></RoleRoute>} />
          <Route path="/payment-success" element={<RoleRoute allowedRole="customer"><CustomerPaymentStatus /></RoleRoute>} />
          <Route path="/payment-cancel" element={<RoleRoute allowedRole="customer"><CustomerPaymentStatus /></RoleRoute>} />
          <Route path="/feedback" element={<RoleRoute allowedRole="customer"><CustomerFeedbackPage /></RoleRoute>} />
          <Route path="/settings" element={<RoleRoute allowedRole="customer"><CustomerSettings /></RoleRoute>} />
          <Route path="/chatbot" element={<RoleRoute allowedRole="customer"><Chatbot /></RoleRoute>} />

          <Route path="/admin/dashboard" element={<RoleRoute allowedRole="admin"><AdminAnalytics /></RoleRoute>} />
          <Route path="/admin/products" element={<RoleRoute allowedRole="admin"><CustomerProducts /></RoleRoute>} />
          <Route path="/admin/orders" element={<RoleRoute allowedRole="admin"><AdminOrders /></RoleRoute>} />
          <Route path="/admin/customers" element={<RoleRoute allowedRole="admin"><AdminCustomers /></RoleRoute>} />
          <Route path="/admin/payments" element={<RoleRoute allowedRole="admin"><AdminPayments /></RoleRoute>} />
          <Route path="/admin/feedback" element={<RoleRoute allowedRole="admin"><AdminFeedbackPage /></RoleRoute>} />
          <Route path="/admin/notifications" element={<RoleRoute allowedRole="admin"><AdminNotificationPage /></RoleRoute>} />
          <Route path="/admin/reports" element={<RoleRoute allowedRole="admin"><AdminReports /></RoleRoute>} />
          <Route path="/admin/settings" element={<RoleRoute allowedRole="admin"><AdminSettings /></RoleRoute>} />
          <Route path="/admin/chatbot" element={<RoleRoute allowedRole="admin"><Chatbot /></RoleRoute>} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
