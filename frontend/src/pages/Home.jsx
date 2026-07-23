import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import LandingHome from '../components/customer/home/Home.jsx';

const Home = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
        }
    }, []);

    if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <LandingHome />;
};

export default Home;
