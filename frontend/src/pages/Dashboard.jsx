import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analytics';
import { encryptionService } from '../services/encryption';
import mfaService from '../services/mfa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { formatNumber, formatDate } from '../utils/helpers';
import {
    DocumentTextIcon,
    ShieldCheckIcon,
    KeyIcon,
    UserGroupIcon,
    LockClosedIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
            color: 'blue',
        },
        {
            title: 'Encryptions',
            value: formatNumber(stats?.encryptions || 0),
            icon: LockClosedIcon,
            color: 'green',
        },
        {
            title: 'Classifications',
            value: formatNumber(stats?.classifications || 0),
            icon: DocumentTextIcon,
            color: 'purple',
        },
        {
            title: 'Active Users',
            value: formatNumber(stats?.unique_users || 0),
            icon: UserGroupIcon,
            color: 'orange',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

                {/* MFA Status Banner */}
                {mfaStatus && !mfaStatus.mfa_enabled && (
                    <div className="mb-6">
                        <Card className="bg-blue-500/10 border-blue-500/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShieldCheckIcon className="h-6 w-6 text-blue-500" />
                                    <div>
                                        <h3 className="text-white font-semibold">Secure Your Account</h3>
                                        <p className="text-slate-300 text-sm">Enable two-factor authentication for enhanced security</p>
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => navigate('/mfa/setup')}
                                >
                                    Enable MFA
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {mfaStatus && mfaStatus.mfa_enabled && (
                    <div className="mb-6">
                        <Card className="bg-green-500/10 border-green-500/30">
                            <div className="flex items-center gap-3">
                                <ShieldCheckIcon className="h-6 w-6 text-green-500" />
                                <div>
                                    <h3 className="text-white font-semibold">MFA Enabled ✓</h3>
                                    <p className="text-slate-300 text-sm">
                                        Your account is protected with two-factor authentication
                                        {mfaStatus.backup_codes_remaining > 0 &&
                                            ` • ${mfaStatus.backup_codes_remaining} backup codes remaining`
                                        }
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index} glass className="animate-slide-in">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 bg-${stat.color}-500/20 rounded-lg`}>
                                        <Icon className={`h-8 w-8 text-${stat.color}-500`} />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card title="Data Distribution by Sensitivity">
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
                    </Card>

                    <Card title="Security Statistics">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                                <span className="text-slate-300">Login Success Rate</span>
                                <span className="text-green-500 font-semibold">
                                    {stats?.login_attempts > 0
                                        ? Math.round((stats.login_successes / stats.login_attempts) * 100)
                                        : 0}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                                <span className="text-slate-300">High Risk Actions</span>
                                <span className="text-red-500 font-semibold">{stats?.high_risk_actions || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                                <span className="text-slate-300">MFA Enforcements</span>
                                <span className="text-orange-500 font-semibold">{stats?.mfa_enforced || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                                <span className="text-slate-300">Unique IP Addresses</span>
                                <span className="text-blue-500 font-semibold">{stats?.unique_ips || 0}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card title="Recent Encrypted Data">
                    {recentData.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            No data items yet. Start by encrypting some data!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentData.map((item) => (
                                <div key={item.id} className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-color">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <LockClosedIcon className="h-5 w-5 text-blue-500" />
                                            <div>
                                                <p className="text-white font-medium">Data Item #{item.id}</p>
                                                <p className="text-sm text-slate-400">{formatDate(item.created_at)}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.sensitivity_level === 'highly_sensitive' ? 'bg-red-500/20 text-red-500' :
                                                item.sensitivity_level === 'confidential' ? 'bg-orange-500/20 text-orange-500' :
                                                    item.sensitivity_level === 'internal' ? 'bg-blue-500/20 text-blue-500' :
                                                        'bg-green-500/20 text-green-500'
                                                }`}>
                                                {item.sensitivity_level.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
