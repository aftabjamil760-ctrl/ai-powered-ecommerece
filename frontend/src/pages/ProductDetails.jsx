import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductDetails } from '../utils/productService';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await getProductDetails(id);
                setProduct(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-6 rounded-xl max-w-md text-center">
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p>{error || 'Product not found'}</p>
                    <Link to="/products" className="mt-4 inline-block text-blue-400 hover:underline">Return to products</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumbs / Back button */}
                <Link to="/products" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-7-7a1 1 0 010-1.414l7-7a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Catalog
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
                    {/* Image Section */}
                    <div className="rounded-xl overflow-hidden bg-gray-700 aspect-square">
                        <img
                            src={product.image || 'https://via.placeholder.com/600?text=Product+Image'}
                            alt={product.name}
                            className="w-full h-full object-cover shadow-inner"
                        />
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <span className="text-blue-400 font-medium px-3 py-1 bg-blue-400/10 rounded-full text-sm">
                                {product.category}
                            </span>
                            <h1 className="text-4xl font-bold mt-4 mb-2">{product.name}</h1>
                            <div className="flex items-center gap-2">
                                <div className="flex text-yellow-400">
                                    {/* Simple stars based on rating average or just static for now */}
                                    {"★".repeat(5)}
                                </div>
                                <span className="text-gray-400 text-sm">(0 reviews)</span>
                            </div>
                        </div>

                        <div className="bg-gray-700/50 rounded-xl p-6 mb-8 border border-gray-600">
                            <div className="flex items-end gap-3 mb-2">
                                <span className="text-4xl font-bold text-white">${product.finalPrice}</span>
                                {product.discount > 0 && (
                                    <span className="text-xl text-gray-400 line-through mb-1">${product.price.toFixed(2)}</span>
                                )}
                            </div>
                            {product.discount > 0 && (
                                <div className="text-green-400 font-semibold">
                                    You save {product.discount}%!
                                </div>
                            )}
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-3 text-gray-200">Description</h3>
                            <p className="text-gray-400 leading-relaxed italic">
                                {product.description || "No description provided for this product."}
                            </p>
                        </div>

                        <div className="mt-auto space-y-4">
                            <div className="flex items-center gap-4 text-sm">
                                <div className={`px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    disabled={product.stock === 0}
                                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition shadow-lg ${product.stock > 0
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {product.stock > 0 ? 'Add to Cart' : 'Currently Unavailable'}
                                </button>
                                {product.stock > 0 && (
                                    <button
                                        onClick={() => navigate('/checkout', { state: { product } })}
                                        className="flex-1 py-4 rounded-xl font-bold text-lg transition shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-green-500/20"
                                    >
                                        Buy Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section - Mock for now as backend has ratings array */}
                <div className="mt-12 bg-gray-800 rounded-2xl p-8 border border-gray-700">
                    <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                    {product.ratings && product.ratings.length > 0 ? (
                        <div className="space-y-6">
                            {product.ratings.map((rev, idx) => (
                                <div key={idx} className="border-b border-gray-700 pb-6 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold">User {rev.userId.substring(0, 5)}...</span>
                                        <div className="text-yellow-400">{"★".repeat(rev.rating)}</div>
                                    </div>
                                    <p className="text-gray-400">{rev.review}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <p>No reviews yet. Be the first to review this product!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
