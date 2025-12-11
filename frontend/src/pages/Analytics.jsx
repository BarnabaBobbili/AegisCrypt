import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analytics';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import { formatDate } from '../utils/helpers';

const Analytics = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [logs, alertsData] = await Promise.all([
                analyticsService.getAuditLogs({ limit: 20 }),
                analyticsService.getAlerts(10).catch(() => []), // May fail for non-admin users
            ]);
            setAuditLogs(logs);
            setAlerts(alertsData);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Analytics & Audit Logs</h1>

                {/* Security Alerts (Admin only) */}
                {alerts.length > 0 && (
                    <Card title="Security Alerts" className="mb-6">
                        <div className="space-y-3">
                            {alerts.map((alert, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border ${alert.severity === 'critical'
                                            ? 'bg-red-500/10 border-red-500'
                                            : 'bg-orange-500/10 border-orange-500'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-white font-medium">{alert.message}</p>
                                            <p className="text-sm text-slate-400 mt-1">
                                                {formatDate(alert.timestamp)}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${alert.severity === 'critical'
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-orange-500 text-white'
                                                }`}
                                        >
                                            {alert.severity.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Audit Logs */}
                <Card title="Audit Logs">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Timestamp</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Risk Score</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-slate-400">
                                            No audit logs available
                                        </td>
                                    </tr>
                                ) : (
                                    auditLogs.map((log) => (
                                        <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                                            <td className="py-3 px-4 text-slate-300 text-sm">
                                                {formatDate(log.timestamp)}
                                            </td>
                                            <td className="py-3 px-4 text-white text-sm">{log.action}</td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${log.success
                                                            ? 'bg-green-500/20 text-green-500'
                                                            : 'bg-red-500/20 text-red-500'
                                                        }`}
                                                >
                                                    {log.success ? 'Success' : 'Failed'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {log.risk_score !== null ? (
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${log.risk_score >= 61
                                                                ? 'bg-red-500/20 text-red-500'
                                                                : log.risk_score >= 31
                                                                    ? 'bg-orange-500/20 text-orange-500'
                                                                    : 'bg-green-500/20 text-green-500'
                                                            }`}
                                                    >
                                                        {log.risk_score}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 text-sm">
                                                {log.ip_address || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
