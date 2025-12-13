import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    SparklesIcon,
    LockClosedIcon,
    ShareIcon,
    ClockIcon,
    ArrowDownTrayIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

const FeaturesGrid = () => {
    const navigate = useNavigate();

    const freeFeatures = [
        {
            icon: SparklesIcon,
            title: 'AI-Powered Classification',
            description: 'Automatic sensitivity detection using machine learning',
        },
        {
            icon: LockClosedIcon,
            title: 'File Encryption',
            description: 'Secure encryption up to 10MB with AES-256-GCM',
        },
        {
            icon: ShareIcon,
            title: 'Shareable Links',
            description: 'Generate secure links to share encrypted files',
        },
        {
            icon: ShieldCheckIcon,
            title: 'Password Protection',
            description: 'Add optional password for extra security',
        },
        {
            icon: ClockIcon,
            title: 'Expiration Settings',
            description: 'Set automatic expiration for shared links',
        },
        {
            icon: ArrowDownTrayIcon,
            title: 'Download Limits',
            description: 'Control maximum number of downloads',
        },
    ];

    const premiumFeatures = [
        {
            icon: LockClosedIcon,
            title: 'Encryption History',
            description: 'View and manage all your encrypted files',
        },
        {
            icon: LockClosedIcon,
            title: 'Saved Decryption Keys',
            description: 'Access your encrypted data anytime',
        },
        {
            icon: ShieldCheckIcon,
            title: 'Custom Policies',
            description: 'Create custom encryption policies',
        },
        {
            icon: ChartBarIcon,
            title: 'Analytics Dashboard',
            description: 'Track encryption statistics and trends',
        },
        {
            icon: ChartBarIcon,
            title: 'Performance Benchmarks',
            description: 'Test and compare encryption algorithms',
        },
        {
            icon: UserGroupIcon,
            title: 'Multi-Factor Authentication',
            description: 'Enhanced security with 2FA',
        },
    ];

    return (
        <div className="bg-white py-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Powerful Features for Everyone
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Start with our free tier and upgrade when you need more
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Free Features */}
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border-2 border-green-200 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Forever</h3>
                                <p className="text-gray-600">No credit card required</p>
                            </div>
                            <div className="px-4 py-2 bg-green-500 text-white rounded-full font-bold text-sm">
                                $0
                            </div>
                        </div>

                        <div className="space-y-4">
                            {freeFeatures.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                                            <p className="text-sm text-gray-600">{feature.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-full mt-6 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 text-lg"
                        >
                            Start Free Now
                        </button>
                    </div>

                    {/* Premium Features */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Access</h3>
                                <p className="text-gray-600">Advanced features for power users</p>
                            </div>
                            <div className="px-4 py-2 bg-blue-600 text-white rounded-full font-bold text-sm">
                                Sign Up
                            </div>
                        </div>

                        <div className="space-y-4">
                            {premiumFeatures.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Icon className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                                            <p className="text-sm text-gray-600">{feature.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full mt-6 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 text-lg"
                        >
                            Sign Up for Free
                        </button>
                    </div>
                </div>

                {/* Bottom Note */}
                <div className="text-center mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700">
                        <strong>All users get:</strong> AES-256 encryption, zero-knowledge architecture,
                        GDPR-ready privacy, and open-source transparency
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FeaturesGrid;
