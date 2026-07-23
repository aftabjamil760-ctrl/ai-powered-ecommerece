import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));

                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                // Redirect to dashboard
                navigate('/');
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <p>Processing login...</p>
        </div>
    );
};

export default GoogleCallback;
