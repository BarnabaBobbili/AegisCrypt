/**
 * MemoryChart.jsx
 * 
 * Displays memory usage vs file size.
 * Uses Recharts AreaChart with light theme styling following UI Design Guide.
 */

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * MemoryChart - Visualize memory usage
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data with fileSize, encryption, decryption
 * @returns {JSX.Element} Rendered chart
 */
const MemoryChart = ({ data }) => {
    // ============================================================================
    // RENDER
    // ============================================================================

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Memory Usage
                </h3>
                <div className="flex items-center justify-center h-64 text-gray-500">
                    No data available
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Memory Usage
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                Average memory consumption in megabytes
            </p>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorEncryption" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDecryption" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        dataKey="fileSize"
                        stroke="#6B7280"
                        style={{ fontSize: '14px', fill: '#6B7280' }}
                    />
                    <YAxis
                        stroke="#6B7280"
                        style={{ fontSize: '14px', fill: '#6B7280' }}
                        label={{ value: 'Memory (MB)', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ color: '#111827', fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Area
                        type="monotone"
                        dataKey="encryption"
                        stroke="#2563EB"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorEncryption)"
                        name="Encryption (MB)"
                    />
                    <Area
                        type="monotone"
                        dataKey="decryption"
                        stroke="#22C55E"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorDecryption)"
                        name="Decryption (MB)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MemoryChart;
