import React, { useState } from 'react';
import FeedbackForm from './FeedbackForm';

const OrderCard = ({ order }) => {
    const [showFeedback, setShowFeedback] = useState(false);
    const { _id, createdAt, totalAmount, paymentStatus, orderStatus, products } = order;

    const statusColors = {
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50',
        success: 'bg-green-500/10 text-green-500 border-green-500/50',
        failed: 'bg-red-500/10 text-red-500 border-red-500/50',
        processing: 'bg-blue-500/10 text-blue-500 border-blue-500/50',
        shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/50',
        delivered: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50',
        cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/50'
    };

    const getProductId = (productRef) => {
        if (!productRef) return '';
        if (typeof productRef === 'string') return productRef;
        if (typeof productRef === 'object') {
            const id = productRef._id || productRef.id;
            return id ? id.toString() : '';
        }
        return String(productRef);
    };

    const getProductName = (productRef) => {
        if (typeof productRef === 'object' && productRef !== null) {
            if (productRef.name) return productRef.name;
            if (productRef.product?.name) return productRef.product.name;
        }
        return 'Product';
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500/30 transition-all duration-300">
            <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Order ID</div>
                    <div className="text-sm font-mono text-blue-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{_id}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Date</div>
                    <div className="text-sm text-gray-300">{new Date(createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[paymentStatus] || 'bg-gray-500/10'}`}>
                        Payment: {paymentStatus.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[orderStatus] || 'bg-gray-500/10'}`}>
                        {orderStatus.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-700 pt-4 mb-4">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-2">Items</div>
                <div className="space-y-2">
                    {products.map((item, idx) => {
                        const productId = getProductId(item.productId);
                        const productName = getProductName(item.productId);
                        const safePrice = typeof item.price === 'number' ? item.price : 0;
                        const safeQuantity = Number(item.quantity) || 1;

                        return (
                            <div key={idx} className="flex justify-between items-center text-sm gap-3">
                                <span className="text-gray-400 flex-1">
                                    <span className="text-gray-200 font-medium">{productName}</span>
                                    {productId && (
                                        <span className="ml-2 text-gray-300 font-mono text-xs">{productId.slice(0, 8)}...</span>
                                    )}
                                    <span className="ml-2">x {safeQuantity}</span>
                                </span>
                                <span className="text-white font-medium">${safePrice.toFixed(2)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-200">Total Amount</span>
                <span className="text-2xl font-black text-white">${totalAmount.toFixed(2)}</span>
            </div>

            {orderStatus === 'delivered' && (
                <div className="mt-4 border-t border-gray-700 pt-4">
                    <button
                        onClick={() => setShowFeedback(!showFeedback)}
                        className="w-full bg-blue-600/20 text-blue-400 border border-blue-500/30 py-2 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all"
                    >
                        {showFeedback ? 'Close Review' : 'Review Order'}
                    </button>
                    {showFeedback && (
                        <div className="mt-4">
                            {products.map((item, idx) => {
                                const productId = getProductId(item.productId);
                                return (
                                    <div key={idx} className="mb-4 last:mb-0">
                                        <p className="text-gray-300 text-sm mb-2">Reviewing: {getProductName(item.productId)} {productId ? `${productId.slice(0, 8)}...` : ''}</p>
                                        <FeedbackForm
                                            productId={productId || item.productId}
                                            orderId={_id}
                                            onSuccess={() => {
                                                setShowFeedback(false);
                                                alert('Thank you for your feedback!');
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderCard;
