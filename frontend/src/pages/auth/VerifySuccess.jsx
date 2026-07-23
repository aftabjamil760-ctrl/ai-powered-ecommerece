import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

const VerifySuccess = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-sm overflow-hidden p-8 space-y-8 text-center border border-slate-200">
                <div className="flex justify-center">
                    <div className="bg-emerald-100 p-4 rounded-full">
                        <FiCheckCircle className="w-16 h-16 text-emerald-600" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-slate-900">
                    Email Verified!
                </h2>

                <p className="text-slate-500">
                    Your email address has been successfully verified. You can now access all features of our platform.
                </p>

                <div className="pt-4">
                    <Link
                        to="/login"
                        className="inline-block w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-3xl hover:bg-slate-800 transition duration-200 shadow-sm"
                    >
                        Proceed to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifySuccess;
