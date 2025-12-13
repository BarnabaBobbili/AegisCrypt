import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-[#111118] border-t border-gray-800 py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4 group">
                            <ShieldCheckIcon className="h-8 w-8 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
                            <span className="text-2xl font-bold text-white">Aegis Crypt</span>
                        </Link>
                        <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                            AI-powered encryption with adaptive security policies.
                            Automatically classify and protect your sensitive data with enterprise-grade encryption.
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="h-4 w-4 text-green-400" />
                                <span className="text-gray-400">AES-256</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="h-4 w-4 text-green-400" />
                                <span className="text-gray-400">Zero-Knowledge</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="h-4 w-4 text-green-400" />
                                <span className="text-gray-400">Open Source</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-lg">Product</h3>
                        <ul className="space-y-3">
                            <li>
                                <button
                                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    Features
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    Pricing
                                </button>
                            </li>
                            <li>
                                <Link to="/docs" className="text-gray-400 hover:text-white transition-colors duration-200">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                    API Reference
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-lg">Company</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
                                    GitHub
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-sm text-gray-400">
                            © {currentYear} Aegis Crypt. All rights reserved.
                        </div>

                        {/* Status & Compliance */}
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-400">All Systems Operational</span>
                            </div>
                            <div className="text-gray-400">|</div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <ShieldCheckIcon className="h-4 w-4 text-indigo-400" />
                                <span>SOC 2 Compliant</span>
                            </div>
                        </div>

                        {/* Legal Links */}
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                Terms of Service
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                Security
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
