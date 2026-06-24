import React, { useState, useEffect } from 'react';
import { getTopProducts, searchProducts } from '../utils/productService';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchMessage, setSearchMessage] = useState('');

    useEffect(() => {
        fetchInitialProducts();
    }, []);

    const fetchInitialProducts = async () => {
        try {
            setLoading(true);
            const data = await getTopProducts();
            setProducts(data);
            setSearchMessage('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            fetchInitialProducts();
            return;
        }

        try {
            setLoading(true);
            const data = await searchProducts(searchTerm);
            if (data.message) {
                setSearchMessage(data.message);
                setProducts(data.products || []);
            } else {
                setProducts(data);
                setSearchMessage('');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Our Products
                        </h1>
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </form>
                </div>

                {/* Status Messages */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-8 text-center">
                        {error}
                    </div>
                )}

                {searchMessage && !loading && (
                    <div className="text-gray-400 mb-8 text-lg text-center">
                        {searchMessage}
                    </div>
                )}

                {/* Product Grid */}
                {!loading && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}

                {!loading && products.length === 0 && !searchMessage && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-xl">No products available at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
