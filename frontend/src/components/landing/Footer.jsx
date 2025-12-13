import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
                            <span className="text-xl font-bold text-white">Adaptive Crypto</span>
                        </div>
                        <p className="text-gray-400 mb-4 max-w-md">
                            AI-powered encryption with adaptive security policies.
                            Automatically classify and protect your sensitive data.
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                                <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                                AES-256
                            </span>
                            <span className="flex items-center gap-1">
                                <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                                Zero-Knowledge
                            </span>
                            <span className="flex items-center gap-1">
                                <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                                Open Source
                            </span>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="hover:text-white transition-colors"
                                >
                                    Features
                                </button>
                            </li>
                            <li>
                                <Link to="/login" className="hover:text-white transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors">
                                    API Reference
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="hover:text-white transition-colors">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                    GitHub
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-400">
                            © {currentYear} Adaptive Crypto Policy Engine. All rights reserved.
                        </div>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="hover:text-white transition-colors">
                                Privacy Policy
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
                                Terms of Service
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
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
