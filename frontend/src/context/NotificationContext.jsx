import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const intervalRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setNotifications([]);
                setUnreadCount(0);
                return;
            }

            const res = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 2500,
            });

            const notificationList = Array.isArray(res.data) ? res.data : [];
            setNotifications(notificationList);
            setUnreadCount(notificationList.filter((n) => !n.isRead).length);
        } catch {
            setNotifications([]);
            setUnreadCount(0);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 2500,
            });
            fetchNotifications();
        } catch {
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        fetchNotifications();
        intervalRef.current = setInterval(fetchNotifications, 30000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
