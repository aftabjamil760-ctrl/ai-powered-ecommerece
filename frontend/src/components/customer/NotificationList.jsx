import React from 'react';

export default function NotificationList() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h2 className="text-lg font-semibold">Notifications</h2>
      <div className="mt-4 space-y-3">
        <div className="rounded-lg border p-4">No new notifications.</div>
      </div>
    </div>
  );
}
