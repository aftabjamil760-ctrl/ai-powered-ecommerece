import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import LandingHome from '../../components/home/Home';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token) {
            navigate('/login');
            return;
        }

        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
        }
    }, [navigate]);

    if (!user) return null;

    if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <LandingHome />;
};

export default Home;
