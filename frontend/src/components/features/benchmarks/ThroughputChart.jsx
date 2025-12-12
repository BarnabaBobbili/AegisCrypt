/**
 * ThroughputChart.jsx
 * 
 * Displays encryption/decryption throughput vs file size.
 * Uses Recharts LineChart with light theme styling following UI Design Guide.
 */

import React from 'react';
import {
    LineChart,
    Line,
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
 * ThroughputChart - Visualize throughput performance
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data with fileSize, encryption, decryption
 * @returns {JSX.Element} Rendered chart
 */
const ThroughputChart = ({ data }) => {
    // ============================================================================
    // RENDER
    // ============================================================================

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Throughput vs File Size
                </h3>
                <div className="flex items-center justify-center h-64 text-gray-500">
                    No data available. Run a benchmark to see results.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Throughput vs File Size
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                Encryption and decryption speed in megabytes per second
            </p>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        dataKey="fileSize"
                        stroke="#6B7280"
                        style={{ fontSize: '14px', fill: '#6B7280' }}
                        label={{ value: 'File Size', position: 'insideBottom', offset: -5, fill: '#6B7280' }}
                    />
                    <YAxis
                        stroke="#6B7280"
                        style={{ fontSize: '14px', fill: '#6B7280' }}
                        label={{ value: 'Throughput (MB/s)', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ color: '#111827', fontWeight: 600 }}
                        itemStyle={{ color: '#6B7280' }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                    />
                    <Line
                        type="monotone"
                        dataKey="encryption"
                        stroke="#2563EB"
                        strokeWidth={2}
                        name="Encryption (MB/s)"
                        dot={{ fill: '#2563EB', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="decryption"
                        stroke="#22C55E"
                        strokeWidth={2}
                        name="Decryption (MB/s)"
                        dot={{ fill: '#22C55E', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ThroughputChart;
