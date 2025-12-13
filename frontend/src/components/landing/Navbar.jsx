import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ShieldCheckIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Docs', href: '/docs' },
    ];

    const scrollToSection = (href) => {
        if (href.startsWith('#')) {
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setIsMobileMenuOpen(false);
            }
        } else {
            navigate(href);
        }
    };

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? isDark
                        ? 'glass-nav shadow-lg py-3'
                        : 'bg-white/95 backdrop-blur-md shadow-lg py-3 border-b border-gray-200'
                    : isDark
                        ? 'bg-transparent py-4'
                        : 'bg-white/80 backdrop-blur-sm py-4'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="relative">
                                <ShieldCheckIcon className={`h-8 w-8 ${isDark ? 'text-indigo-500' : 'text-indigo-600'} transition-all duration-300 group-hover:text-indigo-400 group-hover:scale-110`} />
                                <div className={`absolute inset-0 ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-600/20'} blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                            </div>
                            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Aegis Crypt
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => scrollToSection(link.href)}
                                    className={`relative ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200 font-medium group`}
                                >
                                    {link.name}
                                    <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300`}></span>
                                </button>
                            ))}

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDark ? (
                                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                                >
                                    Dashboard →
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className={`px-5 py-2.5 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} font-medium transition-colors duration-200`}
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => scrollToSection('#demo')}
                                        className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-all duration-200 transform hover:scale-105 animate-pulse-glow"
                                    >
                                        Try Free →
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`md:hidden p-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isMobileMenuOpen
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>

                {/* Menu */}
                <div
                    className={`absolute top-0 right-0 h-full w-64 glass-card transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    <div className="p-6 pt-20 flex flex-col gap-6">
                        {navLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={() => scrollToSection(link.href)}
                                className="text-left text-gray-300 hover:text-white transition-colors duration-200 font-medium text-lg"
                            >
                                {link.name}
                            </button>
                        ))}

                        <div className="border-t border-gray-700 pt-6 mt-6 flex flex-col gap-3">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => {
                                        navigate('/dashboard');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg text-center"
                                >
                                    Dashboard →
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            navigate('/login');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="px-6 py-3 border border-gray-600 text-white font-medium rounded-lg text-center hover:bg-gray-800 transition-colors"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => {
                                            scrollToSection('#demo');
                                        }}
                                        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg text-center"
                                    >
                                        Try Free →
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
