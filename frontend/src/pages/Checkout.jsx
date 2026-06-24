import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { createOrder } from '../utils/orderService';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const product = location.state?.product;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
    });

    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!product) {
            navigate('/products');
        }
    }, [product, navigate]);

    if (!product) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const calculateTotal = () => {
        return (product.finalPrice * quantity).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const orderData = {
                products: [
                    {
                        productId: product._id,
                        quantity: quantity,
                        price: product.price
                    }
                ],
                deliveryAddress: address
            };

            const result = await createOrder(orderData);

            if (result.paymentUrl) {
                window.location.href = result.paymentUrl;
                return;
            }

            setError('Payment could not be initiated. Please try again.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8 text-center">
                <div className="bg-gray-800 p-12 rounded-2xl border border-green-500 shadow-2xl shadow-green-500/10">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
                    <p className="text-gray-400 mb-6">Payment confirmed. Redirecting to your orders...</p>
                    <Link to="/orders" className="text-blue-400 hover:underline">View My Orders Now</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <Link to={`/product/${product._id}`} className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-7-7a1 1 0 010-1.414l7-7a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Product
                </Link>

                <h1 className="text-4xl font-bold mb-12">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Order Summary Side */}
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 h-fit sticky top-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Order Summary
                        </h2>

                        <div className="flex gap-4 mb-6 pb-6 border-b border-gray-700">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-200">{product.name}</h3>
                                <p className="text-sm text-gray-400">{product.category}</p>
                                <div className="mt-2 flex items-center gap-4">
                                    <label className="text-xs text-gray-500 uppercase">Quantity:</label>
                                    <select
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-sm"
                                    >
                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-gray-400">
                                <span>Unit Price</span>
                                <span>${product.finalPrice}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400">
                                <span>Quantity</span>
                                <span>x{quantity}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400">
                                <span>Shipping</span>
                                <span className="text-green-400">Free</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                                <span className="text-xl font-bold">Total</span>
                                <span className="text-3xl font-black text-white">${calculateTotal()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Shipping Details
                        </h2>

                        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Street Address</label>
                                <input
                                    required
                                    type="text"
                                    name="street"
                                    value={address.street}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    placeholder="123 Shopping St"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                                    <input
                                        required
                                        type="text"
                                        name="city"
                                        value={address.city}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="New York"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">State / Province</label>
                                    <input
                                        required
                                        type="text"
                                        name="state"
                                        value={address.state}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="NY"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Zip / Postal Code</label>
                                    <input
                                        required
                                        type="text"
                                        name="zip"
                                        value={address.zip}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="10001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Country</label>
                                    <input
                                        required
                                        type="text"
                                        name="country"
                                        value={address.country}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="USA"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg ${loading ? 'bg-gray-700 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/20'
                                    }`}
                            >
                                {loading ? 'Processing...' : 'Confirm Order & Pay'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
