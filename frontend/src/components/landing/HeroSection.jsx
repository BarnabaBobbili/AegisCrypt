import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheckIcon, SparklesIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const HeroSection = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const scrollToDemo = () => {
        document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-gradient-to-b from-blue-50 to-white py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Content */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                            <SparklesIcon className="h-4 w-4" />
                            AI-Powered Security
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Adaptive Encryption with{' '}
                            <span className="text-blue-600">AI Classification</span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Automatically classify data sensitivity and apply the right encryption strength.
                            Secure your files in seconds with machine learning-powered security policies.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 text-lg"
                                >
                                    Go to Dashboard →
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={scrollToDemo}
                                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 text-lg"
                                    >
                                        Try Free Encryption
                                    </button>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg border-2 border-gray-300 transition-all duration-200 text-lg"
                                    >
                                        Sign Up / Login
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                                <span>AES-256 Encryption</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <LockClosedIcon className="h-5 w-5 text-green-600" />
                                <span>Zero-Knowledge</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="h-5 w-5 text-green-600" />
                                <span>AI-Powered</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Visual */}
                    <div className="relative">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                            {/* Mock UI Preview */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <LockClosedIcon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">Encryption Status</div>
                                            <div className="text-xs text-gray-500">Real-time classification</div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        Active
                                    </div>
                                </div>

                                {/* Classification Result Mock */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Sensitivity Level</span>
                                        <span className="text-sm font-bold text-blue-600">Confidential</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                    <div className="text-xs text-gray-600 mt-2">Confidence: 85%</div>
                                </div>

                                {/* Encryption Details Mock */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="text-xs text-gray-500 mb-1">Algorithm</div>
                                        <div className="text-sm font-semibold text-gray-900">AES-256-GCM</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="text-xs text-gray-500 mb-1">Hash</div>
                                        <div className="text-sm font-semibold text-gray-900">SHA-512</div>
                                    </div>
                                </div>

                                {/* Action Button Mock */}
                                <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg mt-4">
                                    Encrypt File
                                </button>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold">
                            Free to Use
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
