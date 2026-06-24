import React, { Component } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifySuccess from './pages/VerifySuccess';
import VerifyCode from './pages/VerifyCode';
import GoogleCallback from './pages/GoogleCallback';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import Payments from './pages/Payments';
import PaymentStatus from './pages/PaymentStatus';
import FeedbackPage from './pages/FeedbackPage';
import Analytics from './pages/Analytics';
import Chatbot from './components/Chatbot';

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
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payment-success" element={<PaymentStatus />} />
          <Route path="/payment-cancel" element={<PaymentStatus />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-success" element={<VerifySuccess />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/google-callback" element={<GoogleCallback />} />
          # Add Chatbot route
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;