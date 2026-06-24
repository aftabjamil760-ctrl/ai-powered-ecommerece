import React from 'react';
import { useNotifications } from '../context/NotificationContext';

const NotificationList = () => {
    const { notifications, markAsRead } = useNotifications();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">Notifications</h2>
            {notifications.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-lg italic">No notifications yet. You're all caught up!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((n) => (
                        <div
                            key={n._id}
                            className={`p-5 rounded-2xl shadow-sm border transition-all flex items-start justify-between ${n.isRead ? 'bg-white border-gray-100' : 'bg-indigo-50 border-indigo-200'
                                }`}
                        >
                            <div className="flex-1">
                                <p className={`text-gray-800 ${n.isRead ? 'font-normal' : 'font-semibold'}`}>
                                    {n.message}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                                        {n.type?.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            {!n.isRead && (
                                <button
                                    onClick={() => markAsRead(n._id)}
                                    className="ml-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1 rounded-lg border border-indigo-200 shadow-sm transition-all"
                                >
                                    Mark Read
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationList;
