import React from 'react';

const PaymentCard = ({ payment }) => {
    const { id, orderId, amount, currency, gateway, status, createdAt } = payment;

    const statusColors = {
        completed: 'bg-green-500/10 text-green-500 border-green-500/50',
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50',
        failed: 'bg-red-500/10 text-red-500 border-red-500/50',
        refunded: 'bg-blue-500/10 text-blue-500 border-blue-500/50',
        cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/50'
    };

    const gatewayIcons = {
        stripe: '💳',
        easypaisa: '📱',
        jazzcash: '📞',
        bank_transfer: '🏦',
        mock: '🧪'
    };

    return (
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-purple-500/30 transition-all duration-300 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-2xl shadow-inner">
                        {gatewayIcons[gateway.toLowerCase()] || '💰'}
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Transaction ID</div>
                        <div className="text-sm font-mono text-purple-400">{id}</div>
                    </div>
                </div>

                <div className="text-right flex flex-col items-end">
                    <div className="text-2xl font-black text-white">
                        {amount.toLocaleString()} <span className="text-sm font-normal text-gray-400">{currency}</span>
                    </div>
                    <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border ${statusColors[status] || 'bg-gray-500/10'}`}>
                        {status.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-700/50">
                <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Order Ref</div>
                    <div className="text-sm text-gray-300 font-medium">{orderId}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Gateway</div>
                    <div className="text-sm text-gray-300 font-medium capitalize">{gateway}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Date</div>
                    <div className="text-sm text-gray-400">{new Date(createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Time</div>
                    <div className="text-sm text-gray-400">{new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCard;
