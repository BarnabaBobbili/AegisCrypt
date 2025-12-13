import React from 'react';
import useScrollReveal from '../../hooks/useScrollReveal';
import { useTheme } from '../../hooks/useTheme';
import {
    SparklesIcon,
    LockClosedIcon,
    BoltIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    KeyIcon,
    ClockIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';

const Features = () => {
    const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });
    const { isDark } = useTheme();

    const features = [
        {
            icon: SparklesIcon,
            title: 'AI Classification',
            description: 'Automatic sensitivity detection using machine learning',
            gradient: 'from-indigo-500 to-purple-500',
            size: 'wide', // Changed from 'large' to 'wide' to remove extra vertical space
        },
        {
            icon: LockClosedIcon,
            title: 'AES-256-GCM',
            description: 'Military-grade encryption standard',
            gradient: 'from-blue-500 to-cyan-500',
            size: 'medium',
        },
        {
            icon: BoltIcon,
            title: 'Instant Sharing',
            description: 'Generate secure links in seconds',
            gradient: 'from-yellow-500 to-orange-500',
            size: 'medium',
        },
        {
            icon: ShieldCheckIcon,
            title: 'Zero-Knowledge',
            description: 'Your keys never leave your device',
            gradient: 'from-green-500 to-emerald-500',
            size: 'wide',
        },
        {
            icon: ChartBarIcon,
            title: 'Analytics Dashboard',
            description: 'Track encryption statistics and trends',
            gradient: 'from-pink-500 to-red-500',
            size: 'medium',
        },
        {
            icon: KeyIcon,
            title: 'Custom Policies',
            description: 'Create your own encryption rules',
            gradient: 'from-purple-500 to-pink-500',
            size: 'medium',
        },
    ];

    return (
        <div id="features" className={`relative ${isDark ? 'bg-[#111118]' : 'bg-gray-50'} py-24 px-6 overflow-hidden`}>
            {/* Background decoration */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent`}></div>

            <div
                ref={ref}
                className={`relative z-10 max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                        Why <span className="gradient-text">Aegis Crypt</span>?
                    </h2>
                    <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
                        Enterprise-grade security meets consumer simplicity
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        const gridClass =
                            feature.size === 'large' ? 'md:col-span-2 md:row-span-2' :
                                feature.size === 'wide' ? 'md:col-span-2' :
                                    '';

                        return (
                            <div
                                key={index}
                                className={`group ${isDark ? 'glass-card border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-indigo-200 shadow-md hover:shadow-xl'} p-8 rounded-2xl border transition-all duration-300 transform hover:scale-105 ${gridClass} animate-fade-in-up`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Icon with gradient background */}
                                <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-full h-full text-white" />
                                </div>

                                {/* Content */}
                                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3 transition-all duration-300`}>
                                    {feature.title}
                                </h3>
                                <p className={`${isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'} transition-colors duration-300 leading-relaxed mb-6`}>
                                    {feature.description}
                                </p>

                                {/* Visual Content for AI Classification Card */}
                                {feature.size === 'wide' && feature.title === 'AI Classification' && (
                                    <div className="mt-4 space-y-3">
                                        {/* Sample classifications with animations */}
                                        <div className={`p-3 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border flex items-center justify-between`}>
                                            <code className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"SSN: 123-45-6789"</code>
                                            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                                                Highly Sensitive
                                            </span>
                                        </div>
                                        <div className={`p-3 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border flex items-center justify-between`}>
                                            <code className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"Meeting at 3pm"</code>
                                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                                                Public
                                            </span>
                                        </div>
                                        <div className={`p-3 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border flex items-center justify-between`}>
                                            <code className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"Contract #2024-ABC"</code>
                                            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                                                Confidential
                                            </span>
                                        </div>
                                        {/* Accuracy indicator */}
                                        <div className="mt-4 p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Model Accuracy</span>
                                                <span className="text-sm font-bold text-indigo-400">94.8%</span>
                                            </div>
                                            <div className={`w-full ${isDark ? 'bg-gray-700/50' : 'bg-gray-200'} rounded-full h-2`}>
                                                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '94.8%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Visual Content for Wide Zero-Knowledge Card */}
                                {feature.size === 'wide' && feature.title === 'Zero-Knowledge' && (
                                    <div className="mt-4">
                                        {/* Encryption flow diagram */}
                                        <div className="flex items-center justify-between gap-4">
                                            {/* Your Device */}
                                            <div className="flex-1 p-4 bg-gray-900/50 rounded-lg border border-gray-700 text-center">
                                                <div className="w-12 h-12 bg-green-500/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <p className="text-xs text-gray-400">Your Device</p>
                                                <p className="text-xs text-green-400 mt-1">🔑 Keys Here</p>
                                            </div>

                                            {/* Arrow */}
                                            <div className="flex flex-col items-center gap-1">
                                                <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                                <span className="text-xs text-indigo-400">Encrypted</span>
                                            </div>

                                            {/* Server */}
                                            <div className="flex-1 p-4 bg-gray-900/50 rounded-lg border border-gray-700 text-center">
                                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                                    </svg>
                                                </div>
                                                <p className="text-xs text-gray-400">Our Servers</p>
                                                <p className="text-xs text-red-400 mt-1">🚫 No Keys</p>
                                            </div>

                                            {/* Arrow back */}
                                            <div className="flex flex-col items-center gap-1">
                                                <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                                </svg>
                                                <span className="text-xs text-indigo-400">Encrypted</span>
                                            </div>

                                            {/* Recipient */}
                                            <div className="flex-1 p-4 bg-gray-900/50 rounded-lg border border-gray-700 text-center">
                                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <p className="text-xs text-gray-400">Recipient</p>
                                                <p className="text-xs text-purple-400 mt-1">🔓 Decrypts</p>
                                            </div>
                                        </div>

                                        {/* Security note */}
                                        <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                                            <p className="text-xs text-green-400">
                                                <ShieldCheckIcon className="h-4 w-4 inline mr-1" />
                                                End-to-end encrypted • We never see your data
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Visual Content for AES-256-GCM */}
                                {feature.size === 'medium' && feature.title === 'AES-256-GCM' && (
                                    <div className="mt-4 space-y-2">
                                        <div className={`p-2 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded border`}>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Algorithm</span>
                                                <code className="text-cyan-400 font-mono">AES-256</code>
                                            </div>
                                        </div>
                                        <div className={`p-2 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded border`}>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Mode</span>
                                                <code className="text-cyan-400 font-mono">GCM</code>
                                            </div>
                                        </div>
                                        <div className={`p-2 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded border`}>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Key Size</span>
                                                <code className="text-cyan-400 font-mono">256-bit</code>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Visual Content for Instant Sharing */}
                                {feature.size === 'medium' && feature.title === 'Instant Sharing' && (
                                    <div className="mt-4">
                                        <div className={`p-3 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-orange-500/20 rounded flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                </div>
                                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Shareable Link</span>
                                            </div>
                                            <code className="text-xs text-orange-400 font-mono break-all">
                                                aegis.link/e/abc123...
                                            </code>
                                            <div className="mt-2 flex items-center justify-between text-xs">
                                                <span className="text-green-400">✓ Active</span>
                                                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>7 days</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Visual Content for Analytics Dashboard */}
                                {feature.size === 'medium' && feature.title === 'Analytics Dashboard' && (
                                    <div className="mt-4 space-y-3">
                                        {/* Mini chart bars */}
                                        <div className="flex items-end justify-between gap-1 h-16">
                                            {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
                                                <div key={i} className="flex-1 bg-gradient-to-t from-pink-600 to-red-500 rounded-t" style={{ height: `${height}%` }}></div>
                                            ))}
                                        </div>
                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className={`p-2 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded border`}>
                                                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>Files</div>
                                                <div className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold`}>1,247</div>
                                            </div>
                                            <div className={`p-2 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded border`}>
                                                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>This Week</div>
                                                <div className="text-green-400 font-bold">+12%</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Visual Content for Custom Policies */}
                                {feature.size === 'medium' && feature.title === 'Custom Policies' && (
                                    <div className="mt-4 space-y-2">
                                        <div className={`p-2 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border flex items-center justify-between`}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>PII Data</span>
                                            </div>
                                            <code className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>AES-256</code>
                                        </div>
                                        <div className={`p-2 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border flex items-center justify-between`}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Financial</span>
                                            </div>
                                            <code className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>RSA-4096</code>
                                        </div>
                                        <div className={`p-2 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border flex items-center justify-between`}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>General</span>
                                            </div>
                                            <code className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>AES-128</code>
                                        </div>
                                    </div>
                                )}

                                {/* Decorative element */}
                                <div className={`mt-6 h-1 w-0 bg-gradient-to-r ${feature.gradient} group-hover:w-full transition-all duration-500 rounded-full`}></div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom highlight */}
                <div className="mt-12 p-6 glass-card rounded-xl border border-gray-800 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="h-5 w-5 text-green-400" />
                            <span>AES-256 Encryption</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <LockClosedIcon className="h-5 w-5 text-blue-400" />
                            <span>Zero-Knowledge Architecture</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ClockIcon className="h-5 w-5 text-purple-400" />
                            <span>GDPR-Ready Privacy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <UserGroupIcon className="h-5 w-5 text-pink-400" />
                            <span>Open-Source Transparency</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Features;
