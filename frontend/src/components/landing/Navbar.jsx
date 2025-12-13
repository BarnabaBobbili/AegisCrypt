import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheckIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
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
                        ? 'glass-nav shadow-lg py-3'
                        : 'bg-transparent py-4'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="relative">
                                <ShieldCheckIcon className="h-8 w-8 text-indigo-500 transition-all duration-300 group-hover:text-indigo-400 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <span className="text-xl font-bold text-white">
                                Aegis Crypt
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => scrollToSection(link.href)}
                                    className="relative text-gray-300 hover:text-white transition-colors duration-200 font-medium group"
                                >
                                    {link.name}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                </button>
                            ))}
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
                                        className="px-5 py-2.5 text-gray-300 hover:text-white font-medium transition-colors duration-200"
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
                            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors duration-200"
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
