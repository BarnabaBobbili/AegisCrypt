import React from 'react';
import {
    DocumentArrowUpIcon,
    SparklesIcon,
    LockClosedIcon,
    ShareIcon,
} from '@heroicons/react/24/outline';

const HowItWorks = () => {
    const steps = [
        {
            icon: DocumentArrowUpIcon,
            title: 'Upload or Paste',
            description: 'Add your sensitive data - files, text, or documents',
            color: 'blue',
        },
        {
            icon: SparklesIcon,
            title: 'AI Classifies',
            description: 'Machine learning determines sensitivity level automatically',
            color: 'purple',
        },
        {
            icon: LockClosedIcon,
            title: 'Auto-Encrypt',
            description: 'Apply appropriate encryption strength based on classification',
            color: 'green',
        },
        {
            icon: ShareIcon,
            title: 'Share Securely',
            description: 'Get encrypted link with password protection and expiration',
            color: 'orange',
        },
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: {
                bg: 'bg-blue-100',
                icon: 'text-blue-600',
                border: 'border-blue-200',
            },
            purple: {
                bg: 'bg-purple-100',
                icon: 'text-purple-600',
                border: 'border-purple-200',
            },
            green: {
                bg: 'bg-green-100',
                icon: 'text-green-600',
                border: 'border-green-200',
            },
            orange: {
                bg: 'bg-orange-100',
                icon: 'text-orange-600',
                border: 'border-orange-200',
            },
        };
        return colors[color];
    };

    return (
        <div className="bg-gray-50 py-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        How It Works
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Four simple steps to secure your sensitive data with AI-powered encryption
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => {
                        const colors = getColorClasses(step.color);
                        const Icon = step.icon;

                        return (
                            <div key={index} className="relative">
                                {/* Connector Line (hidden on mobile, shown on desktop) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gray-300 z-0">
                                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                                            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                )}

                                {/* Step Card */}
                                <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow z-10">
                                    {/* Step Number */}
                                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                        {index + 1}
                                    </div>

                                    {/* Icon */}
                                    <div className={`w-16 h-16 ${colors.bg} rounded-lg flex items-center justify-center mb-4 border ${colors.border}`}>
                                        <Icon className={`h-8 w-8 ${colors.icon}`} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <p className="text-gray-600 mb-4">
                        Ready to get started?
                    </p>
                    <button
                        onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 text-lg"
                    >
                        Try It Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
