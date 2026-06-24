import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

const VerifySuccess = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden p-8 space-y-8 text-center">
                <div className="flex justify-center">
                    <div className="bg-green-500/10 p-4 rounded-full">
                        <FiCheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white">
                    Email Verified!
                </h2>

                <p className="text-gray-400">
                    Your email address has been successfully verified. You can now access all features of our platform.
                </p>

                <div className="pt-4">
                    <Link
                        to="/login"
                        className="inline-block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200 transform hover:scale-[1.02] shadow-lg"
                    >
                        Proceed to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifySuccess;
