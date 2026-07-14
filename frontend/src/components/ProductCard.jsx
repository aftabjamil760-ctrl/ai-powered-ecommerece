import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, featured }) => {
    const { _id, name, price, discount, image, category } = product;
    const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    const cardRef = useRef(null);

    const discountedPrice = discount > 0 ? (price - (price * (discount / 100))).toFixed(2) : price.toFixed(2);
    const displayImage = image || 'https://via.placeholder.com/400?text=Product+Image';

    const handleMouseMove = (e) => {
        const node = cardRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const midX = rect.width / 2;
        const midY = rect.height / 2;
        const rotateY = ((x - midX) / midX) * 6;
        const rotateX = -((y - midY) / midY) * 6;
        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    };

    const handleMouseLeave = () => {
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.75)] backdrop-blur-xl transition-all duration-300"
            style={{ transform }}
        >
            <div className={`${featured ? 'absolute inset-x-6 top-6 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500/60 blur-xl opacity-60' : ''}`} />
            <div className="relative flex flex-col gap-5">
                {featured && (
                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200 backdrop-blur-xl shadow-sm shadow-blue-500/10">
                        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg shadow-blue-500/25" />
                        Featured Product
                    </div>
                )}

                <div className={`relative overflow-hidden rounded-[28px] ${featured ? 'h-[360px]' : 'h-[320px]'} bg-slate-950/80 border border-white/10 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.75)]`}>
                    <div className="absolute inset-x-0 -bottom-6 h-20 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent blur-3xl" />
                    <div className="absolute inset-x-0 top-4 h-24 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-2xl" />
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                        <div className="relative h-full w-full max-w-[280px] rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-[0_35px_90px_-25px_rgba(59,130,246,0.3)]">
                            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                            <div className="absolute inset-x-6 top-8 h-4 rounded-full bg-cyan-400/15 backdrop-blur-sm" />
                            <div className="absolute left-6 top-20 h-3 w-16 rounded-full bg-white/10" />
                            <div className="absolute left-6 top-28 h-2 w-24 rounded-full bg-white/5" />
                            <div className="absolute right-6 top-20 h-20 w-20 rounded-full bg-blue-500/10 blur-xl" />
                            <div className="absolute inset-x-8 bottom-10 h-20 rounded-[24px] bg-gradient-to-t from-slate-950 to-transparent" />
                            <img
                                src={displayImage}
                                alt={name}
                                className="relative left-1/2 top-1/2 h-[72%] w-auto -translate-x-1/2 -translate-y-1/2 object-contain transition-transform duration-500 group-hover:scale-105"
                                style={{ boxShadow: '0 40px 120px rgba(59, 130, 246, 0.35)' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                        <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1">{category}</span>
                        {discount > 0 && (
                            <span className="rounded-full border border-pink-400/20 bg-pink-500/10 px-3 py-1 text-pink-200">{discount}% OFF</span>
                        )}
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight text-white">{name}</h3>
                    <p className="text-sm leading-6 text-slate-300 line-clamp-3">
                        {product.description || 'High-quality premium product built for immersive 3D and AI workflows.'}
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-300">${discountedPrice}</span>
                        {discount > 0 && (
                            <span className="text-sm text-slate-500 line-through">${price.toFixed(2)}</span>
                        )}
                    </div>
                </div>

                <Link
                    to={`/product/${_id}`}
                    className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-purple-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(99,102,241,0.9)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;
