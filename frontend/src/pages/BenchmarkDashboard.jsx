/**
 * BenchmarkDashboard.jsx
 * 
 * Main benchmark dashboard page.
 * Displays performance metrics and interactive charts.
 * 
 * Following UI Design Guide and Code Refactoring Guidelines.
 */

import React from 'react';
import { ChartBarIcon, ArrowPathIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useBenchmarks } from '../hooks/useBenchmarks';
import ThroughputChart from '../components/features/benchmarks/ThroughputChart';
import LatencyChart from '../components/features/benchmarks/LatencyChart';
import MemoryChart from '../components/features/benchmarks/MemoryChart';

// ============================================================================
// COMPONENT
// ============================================================================

const BenchmarkDashboard = () => {
    // ============================================================================
    // STATE & HOOKS
    // ============================================================================

    const {
        results,
        chartData,
        loading,
        error,
        running,
        runBenchmark,
        exportJSON,
        exportCSV
    } = useBenchmarks();

    // ============================================================================
    // HANDLERS
    // ============================================================================

    const handleRunBenchmark = async () => {
        try {
            await runBenchmark();
        } catch (err) {
            // Error is handled in the hook
            console.error('Benchmark failed:', err);
        }
    };

    // ============================================================================
    // RENDER HELPERS
    // ============================================================================

    const renderSummary = () => {
        if (!results) return null;

        const { summary } = results;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Encryption Throughput */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ChartBarIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-700">Avg Encryption Throughput</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {summary.avg_encryption_throughput.toFixed(2)}
                        <span className="text-lg font-normal text-gray-600 ml-2">MB/s</span>
                    </p>
                </div>

                {/* Decryption Throughput */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <ChartBarIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-700">Avg Decryption Throughput</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {summary.avg_decryption_throughput.toFixed(2)}
                        <span className="text-lg font-normal text-gray-600 ml-2">MB/s</span>
                    </p>
                </div>

                {/* Key Generation */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <ChartBarIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-700">Avg Key Generation</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {summary.avg_key_gen_time_ms.toFixed(2)}
                        <span className="text-lg font-normal text-gray-600 ml-2">ms</span>
                    </p>
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER
    // ============================================================================

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Performance Benchmarks
                    </h1>
                    <p className="text-gray-600">
                        Measure and analyze cryptographic operation performance
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <button
                        onClick={handleRunBenchmark}
                        disabled={running || loading}
                        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 
                       bg-blue-600 text-white font-medium rounded-lg shadow-sm 
                       hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
                    >
                        {running ? (
                            <>
                                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                Running Benchmark...
                            </>
                        ) : (
                            <>
                                <ChartBarIcon className="h-5 w-5" />
                                Run Benchmark
                            </>
                        )}
                    </button>

                    {results && (
                        <>
                            <button
                                onClick={exportJSON}
                                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 
                           bg-white text-gray-900 font-medium rounded-lg border border-gray-300 
                           shadow-sm hover:bg-gray-50 hover:border-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-all duration-200"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                Export JSON
                            </button>

                            <button
                                onClick={exportCSV}
                                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 
                           bg-white text-gray-900 font-medium rounded-lg border border-gray-300 
                           shadow-sm hover:bg-gray-50 hover:border-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-all duration-200"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                Export CSV
                            </button>
                        </>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                        <p className="text-sm font-medium text-red-900">Error</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && !results && (
                    <div className="flex items-center justify-center py-12">
                        <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-600" />
                    </div>
                )}

                {/* Results */}
                {results && chartData && (
                    <>
                        {/* Summary Cards */}
                        {renderSummary()}

                        {/* Charts */}
                        <div className="space-y-6">
                            {/* Throughput and Latency */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ThroughputChart data={chartData.throughput} />
                                <LatencyChart data={chartData.latency} />
                            </div>

                            {/* Memory Usage */}
                            <MemoryChart data={chartData.memory} />
                        </div>

                        {/* Timestamp */}
                        <div className="mt-6 text-center text-sm text-gray-600">
                            Last run: {new Date(results.timestamp).toLocaleString()}
                        </div>
                    </>
                )}

                {/* Empty State */}
                {!loading && !results && !error && (
                    <div className="text-center py-12">
                        <ChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No benchmark results yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Click "Run Benchmark" to start measuring performance
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BenchmarkDashboard;
