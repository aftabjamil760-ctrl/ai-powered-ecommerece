import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createOrder } from '../../utils/orderService';
import { getCart } from '../../utils/cartService';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
    });

    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const sourceProduct = location.state?.product;
        const fallbackCartItem = getCart()[0] || null;
        const selectedProduct = sourceProduct || fallbackCartItem;

        if (!selectedProduct) {
            navigate('/products');
            return;
        }

        const normalizedId = selectedProduct.id ?? selectedProduct._id;
        const price = selectedProduct.price ?? selectedProduct.finalPrice ?? 0;
        const discount = selectedProduct.discount ?? 0;
        const finalPrice = selectedProduct.finalPrice ?? (discount ? Math.round(price - (price * discount) / 100) : price);

        setProduct({
            ...selectedProduct,
            id: normalizedId,
            _id: selectedProduct._id ?? normalizedId,
            price,
            finalPrice,
        });
    }, [location.state, navigate]);

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
                        productId: product._id || product.id,
                        quantity,
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

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950 p-8">
            <div className="max-w-6xl mx-auto">
                <Link to={`/product/${product._id}`} className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8 transition gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-7-7a1 1 0 010-1.414l7-7a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Product
                </Link>

                <h1 className="text-4xl font-bold mb-12">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Order Summary Side */}
                    <div className="bg-white rounded-[32px] p-8 border border-slate-200 h-fit sticky top-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-950">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Order Summary
                        </h2>

                        <div className="flex gap-4 mb-6 pb-6 border-b border-slate-200">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-950">{product.name}</h3>
                                <p className="text-sm text-slate-500">{product.category}</p>
                                <div className="mt-2 flex items-center gap-4">
                                    <label className="text-xs text-slate-500 uppercase">Quantity:</label>
                                    <select
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-sm text-slate-900"
                                    >
                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-slate-500">
                                <span>Unit Price</span>
                                <span>${product.finalPrice}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500">
                                <span>Quantity</span>
                                <span>x{quantity}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500">
                                <span>Shipping</span>
                                <span className="text-emerald-600">Free</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                <span className="text-xl font-bold text-slate-950">Total</span>
                                <span className="text-3xl font-black text-slate-950">${calculateTotal()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-950">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Shipping Details
                        </h2>

                        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Street Address</label>
                                <input
                                    required
                                    type="text"
                                    name="street"
                                    value={address.street}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    placeholder="123 Shopping St"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                                    <input
                                        required
                                        type="text"
                                        name="city"
                                        value={address.city}
                                        onChange={handleInputChange}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="New York"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">State / Province</label>
                                    <input
                                        required
                                        type="text"
                                        name="state"
                                        value={address.state}
                                        onChange={handleInputChange}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="NY"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Zip / Postal Code</label>
                                    <input
                                        required
                                        type="text"
                                        name="zip"
                                        value={address.zip}
                                        onChange={handleInputChange}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="10001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                                    <input
                                        required
                                        type="text"
                                        name="country"
                                        value={address.country}
                                        onChange={handleInputChange}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
