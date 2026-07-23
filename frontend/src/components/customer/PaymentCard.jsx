import React from 'react';

export default function PaymentCard({ payment }) {
  if (!payment) return null;
  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{payment.method || 'Payment'}</div>
          <div className="font-medium">${payment.amount || payment.total || '0.00'}</div>
        </div>
        <div className="text-sm">{payment.status || 'completed'}</div>
      </div>
    </div>
  );
}
