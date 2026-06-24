import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const { _id, name, price, discount, image, category } = product;

    // Calculate discounted price (similar logic to backend but shown here for UI)
    const discountedPrice = discount > 0 ? (price - (price * (discount / 100))).toFixed(2) : price.toFixed(2);

    return (
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
            <div className="relative aspect-square overflow-hidden bg-gray-700">
                <img
                    src={image || 'https://via.placeholder.com/300?text=Product+Image'}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {discount}% OFF
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="text-xs text-blue-400 font-medium mb-1 uppercase tracking-wider">
                    {category}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                    {name}
                </h3>

                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl font-bold text-white">${discountedPrice}</span>
                    {discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">${price.toFixed(2)}</span>
                    )}
                </div>

                <Link
                    to={`/product/${_id}`}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition duration-200"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;
