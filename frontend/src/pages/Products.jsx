import React, { useState, useEffect } from 'react';
import { getTopProducts, searchProducts } from '../utils/productService';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

const fallbackProducts = [
    {
        _id: 'fallback-1',
        name: 'Lumen Forge 3D Design Laptop',
        description: 'High-performance workstation laptop crafted for 3D artists and developers with premium RTX graphics and a vivid HDR display.',
        price: 2299,
        discount: 10,
        category: 'Laptop',
        stock: 12,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=90'
    },
    {
        _id: 'fallback-2',
        name: 'Horizon Pro VR Headset',
        description: 'Immersive VR headset engineered for cinematic 3D experiences with precise motion tracking and lightweight comfort.',
        price: 849,
        discount: 12,
        category: 'VR',
        stock: 30,
        image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=90'
    },
    {
        _id: 'fallback-3',
        name: 'Aurora 3D OLED Monitor',
        description: 'Edge-to-edge 4K OLED display with premium color fidelity, HDR, and a glass-slim chassis for modern workspaces.',
        price: 1599,
        discount: 14,
        category: 'Monitor',
        stock: 18,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=90'
    },
    {
        _id: 'fallback-4',
        name: 'Nova Echo Soundbar',
        description: '3D surround soundbar with Dolby Atmos support, immersive audio staging, and a glass-metal acoustic design.',
        price: 499,
        discount: 15,
        category: 'Audio',
        stock: 20,
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=90'
    }
];

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
            setError(null);
            const data = await getTopProducts();
            const productList = Array.isArray(data) ? data : [];
            setProducts(productList.length > 0 ? productList : fallbackProducts);
            setSearchMessage(productList.length === 0 ? 'Showing demo products while the store has no catalog items.' : '');
        } catch (err) {
            setError(err.message || 'Unable to load products.');
            setProducts(fallbackProducts);
            setSearchMessage('Using local demo products because the API could not be reached.');
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
        <div className="min-h-screen bg-[#050914] text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#08112b] to-[#050b18]" />
            <div className="pointer-events-none absolute -top-28 -left-28 h-72 w-72 rounded-full bg-gradient-to-tr from-violet-500/20 via-blue-400/10 to-transparent blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-24 right-10 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-transparent blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute top-20 right-1/2 h-40 w-40 rounded-full bg-gradient-to-r from-cyan-400/15 to-purple-500/0 blur-2xl" />

            <div className="relative max-w-7xl mx-auto px-6 py-10">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-[0_40px_120px_-70px_rgba(67,56,202,0.65)] p-8 lg:p-10 mb-10">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <div className="max-w-xl">
                            <p className="text-sm uppercase tracking-[0.35em] text-slate-400 mb-4">Premium AI Marketplace</p>
                            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
                                Explore the latest AI hardware collection
                            </h1>
                            <p className="mt-4 text-slate-300 max-w-2xl leading-8">
                                Discover premium products with futuristic design, performance-grade components, and marketplace quality crafted for modern creatives, developers, and AI professionals.
                            </p>
                        </div>
                        <form onSubmit={handleSearch} className="relative w-full max-w-md">
                            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full rounded-3xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-slate-100 shadow-inner shadow-slate-950/40 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-500" />
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-3xl mb-8 text-center">
                        {error}
                    </div>
                )}

                {searchMessage && !loading && (
                    <div className="text-slate-400 mb-8 text-lg text-center">
                        {searchMessage}
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {products.map((product, index) => (
                            <ProductCard key={product._id} product={product} featured={index === 0} />
                        ))}
                    </div>
                )}

                {!loading && products.length === 0 && !searchMessage && (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-xl">No products available at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
