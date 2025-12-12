import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analytics';
import { encryptionService } from '../services/encryption';
import mfaService from '../services/mfa';
import Loading from '../components/common/Loading';
import { formatNumber, formatDate } from '../utils/helpers';
import {
    DocumentTextIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    UserGroupIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentData, setRecentData] = useState([]);
    const [mfaStatus, setMfaStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
        fetchMFAStatus();
    }, []);

    const fetchMFAStatus = async () => {
        try {
            const status = await mfaService.getMFAStatus();
            setMfaStatus(status);
        } catch (error) {
            console.error('Failed to fetch MFA status:', error);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const [statsData, dataItems] = await Promise.all([
                analyticsService.getStats(7),
                encryptionService.getDataItems(),
            ]);
            setStats(statsData);
            setRecentData(dataItems.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    const sensitivityPieData = [
        { name: 'Public', value: Math.floor(Math.random() * 30) + 10, color: '#10B981' },
        { name: 'Internal', value: Math.floor(Math.random() * 40) + 20, color: '#3B82F6' },
        { name: 'Confidential', value: Math.floor(Math.random() * 20) + 10, color: '#F59E0B' },
        { name: 'Highly Sensitive', value: Math.floor(Math.random() * 15) + 5, color: '#EF4444' },
    ];

    const statCards = [
        {
            title: 'Total Actions',
            value: formatNumber(stats?.total_actions || 0),
            icon: ChartBarIcon,
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            title: 'Encryptions',
            value: formatNumber(stats?.encryptions || 0),
            icon: LockClosedIcon,
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
        },
        {
            title: 'Classifications',
            value: formatNumber(stats?.classifications || 0),
            icon: DocumentTextIcon,
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
        },
        {
            title: 'Active Users',
            value: formatNumber(stats?.unique_users || 0),
            icon: UserGroupIcon,
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

                {/* MFA Status Banner */}
                {mfaStatus && !mfaStatus.mfa_enabled && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                                <div>
                                    <h3 className="text-gray-900 font-semibold">Secure Your Account</h3>
                                    <p className="text-gray-600 text-sm">Enable two-factor authentication for enhanced security</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/mfa/setup')}
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                Enable MFA
                            </button>
                        </div>
                    </div>
                )}

                {mfaStatus && mfaStatus.mfa_enabled && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                            <div>
                                <h3 className="text-gray-900 font-semibold">MFA Enabled ✓</h3>
                                <p className="text-gray-600 text-sm">
                                    Your account is protected with two-factor authentication
                                    {mfaStatus.backup_codes_remaining > 0 &&
                                        ` • ${mfaStatus.backup_codes_remaining} backup codes remaining`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                                        <Icon className={`h-8 w-8 ${stat.iconColor}`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Distribution by Sensitivity</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={sensitivityPieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {sensitivityPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Statistics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Login Success Rate</span>
                                <span className="text-green-600 font-semibold">
                                    {stats?.login_attempts > 0
                                        ? Math.round((stats.login_successes / stats.login_attempts) * 100)
                                        : 0}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">High Risk Actions</span>
                                <span className="text-red-600 font-semibold">{stats?.high_risk_actions || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">MFA Enforcements</span>
                                <span className="text-orange-600 font-semibold">{stats?.mfa_enforced || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Unique IP Addresses</span>
                                <span className="text-blue-600 font-semibold">{stats?.unique_ips || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Encrypted Data</h3>
                    {recentData.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No data items yet. Start by encrypting some data!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentData.map((item) => (
                                <div key={item.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <LockClosedIcon className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-gray-900 font-medium">Data Item #{item.id}</p>
                                                <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.sensitivity_level === 'highly_sensitive' ? 'bg-red-100 text-red-800' :
                                                    item.sensitivity_level === 'confidential' ? 'bg-orange-100 text-orange-800' :
                                                        item.sensitivity_level === 'internal' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'
                                                }`}>
                                                {item.sensitivity_level.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
