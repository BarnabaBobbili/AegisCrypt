import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import {
    ShieldCheckIcon,
    LockClosedIcon,
    SparklesIcon,
    CheckCircleIcon,
    StarIcon,
} from '@heroicons/react/24/solid';

const Hero = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { isDark } = useTheme();

    const scrollToDemo = () => {
        document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={`relative min-h-screen flex items-center justify-center overflow-hidden ${isDark ? 'bg-[#0a0a0f]' : 'bg-gradient-to-b from-gray-50 to-white'} pt-20`}>
            {/* Animated Gradient Background */}
            <div className={`absolute inset-0 gradient-mesh-bg ${isDark ? 'opacity-50' : 'opacity-30'}`}></div>

            {/* Animated gradient orbs */}
            <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${isDark ? 'bg-indigo-600/30' : 'bg-indigo-400/20'} rounded-full blur-3xl animate-float`}></div>
            <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${isDark ? 'bg-purple-600/20' : 'bg-purple-400/15'} rounded-full blur-3xl animate-float`} style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Content */}
                    <div className="text-center lg:text-left">
                        {/* Badge */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-100 border-indigo-200'} border mb-6 animate-fade-in-up`}>
                            <SparklesIcon className={`h-4 w-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            <span className={`text-sm font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                                AI-Powered Security
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up stagger-1">
                            <span className={isDark ? 'text-white' : 'text-gray-900'}>Protect Your Data with </span>
                            <span className="gradient-text block mt-2">
                                AI-Powered Encryption
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8 max-w-2xl animate-fade-in-up stagger-2`}>
                            Automatically classify sensitivity and apply the right encryption in seconds.
                            No PhD required. Just upload, encrypt, and share securely.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10 animate-fade-in-up stagger-3">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg text-lg hover:from-indigo-500 hover:to-purple-500 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-indigo-500/50"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <ShieldCheckIcon className="h-6 w-6" />
                                        Go to Dashboard →
                                    </span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={scrollToDemo}
                                        className="px-8 py-4 bg-red-600 text-white font-bold rounded-lg text-lg hover:bg-red-500 transform hover:scale-105 transition-all duration-200 animate-pulse-glow group"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <LockClosedIcon className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                            Start Encrypting Free
                                        </span>
                                    </button>
                                    <button
                                        onClick={scrollToDemo}
                                        className="px-8 py-4 border-2 border-gray-700 text-white font-semibold rounded-lg text-lg hover:bg-gray-800 hover:border-gray-600 transition-all duration-200"
                                    >
                                        Watch Demo →
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Trust Bar */}
                        <div className={`flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} animate-fade-in-up stagger-4`}>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                </div>
                                <span>10,000+ files encrypted</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <StarIcon className="h-4 w-4 text-yellow-500" />
                                <StarIcon className="h-4 w-4 text-yellow-500" />
                                <StarIcon className="h-4 w-4 text-yellow-500" />
                                <StarIcon className="h-4 w-4 text-yellow-500" />
                                <StarIcon className="h-4 w-4 text-yellow-500" />
                                <span className="ml-1">4.9/5 rating</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="h-4 w-4 text-indigo-500" />
                                <span>AES-256-GCM</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Interactive Preview */}
                    <div className="relative animate-fade-in-up stagger-5">
                        <div className={`relative ${isDark ? 'glass-card' : 'bg-white border-2 border-gray-200 shadow-xl'} p-8 rounded-2xl glow-border group`}>
                            {/* Mock UI Preview */}
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center animate-pulse-glow-blue">
                                            <LockClosedIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Encryption Engine</div>
                                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Real-time classification</div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                                        Active
                                    </div>
                                </div>

                                {/* Classification Result */}
                                <div className={`bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 ${isDark ? 'border-indigo-500/20' : 'border-indigo-300'} border animate-fade-in`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Sensitivity Level</span>
                                        <span className="text-sm font-bold text-indigo-400">Confidential</span>
                                    </div>
                                    <div className={`w-full ${isDark ? 'bg-gray-700/50' : 'bg-gray-200'} rounded-full h-2 mb-2`}>
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: '85%' }}
                                        ></div>
                                    </div>
                                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Confidence: 85%</div>
                                </div>

                                {/* Encryption Details */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-3 border hover:border-indigo-500/30 transition-colors`}>
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Algorithm</div>
                                        <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} font-mono`}>AES-256-GCM</div>
                                    </div>
                                    <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-3 border hover:border-indigo-500/30 transition-colors`}>
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Hash</div>
                                        <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} font-mono`}>SHA-512</div>
                                    </div>
                                </div>

                                {/* Mock Progress */}
                                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} animate-pulse`}>
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    <span>Processing encryption...</span>
                                </div>

                                {/* Action Button */}
                                <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg mt-4 hover:from-indigo-500 hover:to-purple-500 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="h-5 w-5" />
                                    Encrypt File
                                </button>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-2xl text-sm font-bold animate-bounce-slow">
                            Free Forever
                        </div>

                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl blur-3xl -z-10 animate-pulse-glow-blue"></div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className={`w-6 h-10 border-2 ${isDark ? 'border-gray-600' : 'border-gray-400'} rounded-full flex items-start justify-center p-2`}>
                    <div className="w-1 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
