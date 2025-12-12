import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    HomeIcon,
    LockClosedIcon,
    DocumentMagnifyingGlassIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    ArrowRightOnRectangleIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';

const Header = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', path: '/', icon: HomeIcon },
        { name: 'Classification', path: '/classification', icon: DocumentMagnifyingGlassIcon },
        { name: 'Encryption', path: '/encryption', icon: LockClosedIcon },
        { name: 'Policies', path: '/policies', icon: ShieldCheckIcon },
        { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
        { name: 'Benchmarks', path: '/benchmarks', icon: ChartBarIcon },
    ];

    // Add admin link for admin users
    if (user?.role === 'admin') {
        navigation.push({ name: 'Admin', path: '/admin/users', icon: UserGroupIcon });
    }

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <ShieldCheckIcon className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 hidden md:block">
                                Adaptive Crypto
                            </span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex space-x-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="hidden lg:block text-sm font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                            <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
