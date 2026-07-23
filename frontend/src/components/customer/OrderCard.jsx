import React from 'react';
import { downloadInvoice } from '../../utils/orderService';

export default function OrderCard({ order }) {
  if (!order) return null;

  const productLines = order.products?.map((item, idx) => {
    const name = item.productId?.name || item.productId || 'Product';
    return (
      <div key={idx} className="flex items-center justify-between text-sm text-slate-600">
        <span>{name}</span>
        <span className="font-semibold text-slate-900">x{item.quantity}</span>
      </div>
    );
  });

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Order #{order._id || order.id || '—'}</div>
          <div className="mt-2 text-lg font-semibold text-slate-950">{order.products?.length > 0 ? `${order.products.length} item${order.products.length > 1 ? 's' : ''}` : 'Order details'}</div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {order.paymentStatus === 'success' ? 'Paid' : order.paymentStatus === 'failed' ? 'Failed' : 'Pending'}
          </div>
          {order.paymentStatus === 'success' && (
            <button
              onClick={() => downloadInvoice(order._id)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Download Invoice
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {productLines}
        <div className="border-t border-slate-200 pt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">Placed {new Date(order.createdAt).toLocaleDateString()}</div>
          <div className="text-sm font-semibold text-slate-950">Total: ${order.totalAmount?.toFixed(2) ?? '0.00'}</div>
        </div>
      </div>
    </div>
  );
}
