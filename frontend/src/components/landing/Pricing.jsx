import React from 'react';
import { useNavigate } from 'react-router-dom';
import useScrollReveal from '../../hooks/useScrollReveal';
import { useTheme } from '../../hooks/useTheme';
import {
    CheckIcon,
    SparklesIcon,
} from '@heroicons/react/24/solid';

const Pricing = () => {
    const navigate = useNavigate();
    const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });
    const { isDark } = useTheme();

    const plans = [
        {
            name: 'Free',
            price: '$0',
            description: 'Perfect for getting started',
            features: [
                'AI-Powered Classification',
                'File encryption up to 10MB',
                '7-day shareable links',
                'Password protection',
                'Basic support',
            ],
            cta: 'Start Free',
            ctaAction: () => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }),
            popular: false,
            gradient: 'from-green-600 to-emerald-600',
        },
        {
            name: 'Pro',
            price: 'Coming Soon',
            description: 'For power users and teams',
            features: [
                'Everything in Free',
                'Unlimited file size',
                '30-day shareable links',
                'Encryption history',
                'Analytics dashboard',
                'Custom policies',
                'Priority support',
            ],
            cta: 'Get Notified',
            ctaAction: () => navigate('/login'),
            popular: true,
            gradient: 'from-indigo-600 to-purple-600',
        },
        {
            name: 'Enterprise',
            price: 'Contact Us',
            description: 'For organizations',
            features: [
                'Everything in Pro',
                'SSO/SAML integration',
                'Audit logs',
                'Custom encryption policies',
                'Dedicated support',
                'SLA guarantee',
            ],
            cta: 'Contact Sales',
            ctaAction: () => navigate('/login'),
            popular: false,
            gradient: 'from-purple-600 to-pink-600',
        },
    ];

    return (
        <div id="pricing" className={`relative ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'} py-24 px-6 overflow-hidden`}>
            {/* Background decoration */}
            <div className={`absolute inset-0 gradient-mesh-bg ${isDark ? 'opacity-30' : 'opacity-20'}`}></div>

            <div
                ref={ref}
                className={`relative z-10 max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                        Simple, <span className="gradient-text">Transparent Pricing</span>
                    </h2>
                    <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
                        Start free, upgrade when you need more
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative ${isDark ? 'glass-card' : 'bg-white shadow-lg'} p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${plan.popular
                                    ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 transform scale-105'
                                    : isDark ? 'border-gray-800 hover:border-gray-700' : 'border-gray-200 hover:border-indigo-200'
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-full flex items-center gap-1">
                                    <SparklesIcon className="h-4 w-4" />
                                    POPULAR
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="mb-6">
                                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{plan.name}</h3>
                                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-4`}>{plan.description}</p>

                                <div className="flex items-baseline gap-2">
                                    <span className={`text-5xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                                        {plan.price}
                                    </span>
                                    {plan.price.startsWith('$') && plan.price !== '$0' && (
                                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>/month</span>
                                    )}
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className={`flex items-start gap-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <CheckIcon className={`h-5 w-5 flex-shrink-0 mt-0.5 text-transparent bg-gradient-to-r ${plan.gradient} bg-clip-text`} style={{ filter: 'brightness(2)' }} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <button
                                onClick={plan.ctaAction}
                                className={`w-full py-4 font-bold rounded-xl text-lg transition-all duration-200 transform hover:scale-105 ${plan.popular
                                        ? `bg-gradient-to-r ${plan.gradient} text-white animate-pulse-glow-blue`
                                        : isDark
                                            ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
                                    }`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Bottom Note */}
                <div className={`text-center p-6 ${isDark ? 'glass-card border-gray-800' : 'bg-white border-gray-200 shadow-md'} rounded-xl border`}>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>All plans include:</span> 30-day money-back guarantee, cancel anytime, no hidden fees
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
