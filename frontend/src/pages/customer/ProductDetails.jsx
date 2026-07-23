import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductDetails } from '../../utils/productService';
import { addToCart } from '../../utils/cartService';
import { products as localProducts } from '../../lib/products';
import CustomerLayout from '../../components/customer/CustomerLayout';
import { EmptyState, GradientButton, LoadingSkeleton, SectionCard, StatusBadge } from '../../components/dashboard/Layout';

const normalizeProduct = (item) => {
    if (!item) return null;

    const normalizedId = item.id ?? item._id;
    const price = item.price ?? item.finalPrice ?? 0;
    const discount = item.discount ?? 0;
    const finalPrice = item.finalPrice ?? (discount ? Math.round(price - (price * discount) / 100) : price);
    const stock = typeof item.stock === 'number'
        ? item.stock
        : item.stock === 'In Stock'
            ? 10
            : item.stock === 'Out of Stock'
                ? 0
                : Number(item.stock) || 0;

    return {
        ...item,
        id: normalizedId,
        _id: item._id ?? normalizedId,
        price,
        finalPrice,
        stock,
        ratings: Array.isArray(item.ratings) ? item.ratings : [],
    };
};

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            let data = null;

            try {
                data = await getProductDetails(id);
            } catch {
                data = null;
            }

            const local = localProducts.find((item) => String(item.id) === String(id) || String(item._id) === String(id));
            const selected = data || local || null;

            if (!selected) {
                setError('Product not found');
                setProduct(null);
            } else {
                setProduct(normalizeProduct(selected));
                setError(null);
            }

            setLoading(false);
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <CustomerLayout>
                <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
                    <LoadingSkeleton rows={3} />
                </div>
            </CustomerLayout>
        );
    }

    if (error || !product) {
        return (
            <CustomerLayout>
                <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
                    <EmptyState
                        title="Product unavailable"
                        description={error || 'Product not found'}
                        action={<Link to="/products"><GradientButton className="mt-4">Return to catalog</GradientButton></Link>}
                    />
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
                <div className="mb-10 rounded-[2rem] bg-slate-950/95 p-8 shadow-soft ring-1 ring-white/5">
                    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{product.category}</p>
                            <h1 className="mt-3 text-4xl font-semibold text-white">{product.name}</h1>
                            <p className="mt-3 max-w-3xl text-sm text-slate-300">{product.description || 'No description provided for this product.'}</p>
                        </div>
                        <Link to="/products"><GradientButton>Back to Catalog</GradientButton></Link>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <SectionCard>
                            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/50">
                                <img src={product.image || 'https://via.placeholder.com/600?text=Product+Image'} alt={product.name} className="h-[420px] w-full object-cover" />
                            </div>
                        </SectionCard>

                        <SectionCard>
                            <div className="mb-4 flex flex-wrap gap-2">
                                <StatusBadge label={product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'} tone={product.stock > 0 ? 'green' : 'red'} />
                                {product.discount > 0 && <StatusBadge label={`${product.discount}% OFF`} tone="purple" />}
                            </div>
                            <div className="mb-5 text-4xl font-semibold text-white">${product.finalPrice}</div>
                            <div className="mb-5 text-sm text-slate-300">{product.description || 'No description provided for this product.'}</div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        addToCart({ ...product, id: product._id ?? product.id, _id: product._id ?? product.id });
                                        navigate('/cart');
                                    }}
                                    className="w-full rounded-2xl bg-foreground px-4 py-2 font-semibold text-background shadow-soft transition hover:opacity-90"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/checkout', { state: { product } })}
                                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 font-semibold text-white shadow-[0_18px_50px_-20px_rgba(16,185,129,0.8)] transition hover:-translate-y-0.5"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </SectionCard>
                    </div>
                </div>

                <SectionCard>
                    <h2 className="mb-4 text-2xl font-semibold text-white">Customer Reviews</h2>
                    {product.ratings.length > 0 ? (
                        <div className="space-y-4">
                            {product.ratings.map((rev, idx) => (
                                <div key={idx} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="font-semibold text-white">User {rev.userId?.substring(0, 5) || 'Guest'}...</span>
                                        <div className="text-amber-300">{'★'.repeat(rev.rating)}</div>
                                    </div>
                                    <p className="text-slate-300">{rev.review}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="No reviews yet" description="Be the first to share your experience with this product." />
                    )}
                </SectionCard>
            </div>
        </CustomerLayout>
    );
};

export default ProductDetails;
