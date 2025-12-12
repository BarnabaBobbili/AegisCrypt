/**
 * LatencyChart.jsx
 * 
 * Displays encryption/decryption latency vs file size.
 * Uses Recharts BarChart with light theme styling following UI Design Guide.
 */

import React from 'react';
import {
    BarChart,
    Bar,
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
 * LatencyChart - Visualize operation latency
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data with fileSize, encryption, decryption
 * @returns {JSX.Element} Rendered chart
 */
const LatencyChart = ({ data }) => {
    // ============================================================================
    // RENDER
    // ============================================================================

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Operation Latency
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
                Operation Latency
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                Average execution time in milliseconds
            </p>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        dataKey="fileSize"
                        stroke="#6B7280"
                        style={{ fontSize: '14px', fill: '#6B7280' }}
                    />
                    <YAxis
                        stroke="#6B7280"
                        style={{ fontSize: '14px', fill: '#6B7280' }}
                        label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
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
                    <Bar
                        dataKey="encryption"
                        fill="#2563EB"
                        name="Encryption (ms)"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="decryption"
                        fill="#22C55E"
                        name="Decryption (ms)"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LatencyChart;
