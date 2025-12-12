/**
 * useBenchmarks.js
 * 
 * Custom React hook for benchmark management.
 * Handles state, API calls, and error handling for benchmarks.
 */

import { useState, useEffect } from 'react';
import * as benchmarkService from '../services/benchmarks';

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * useBenchmarks - Manage benchmark state and operations
 * 
 * @returns {Object} Benchmark state and functions
 */
export const useBenchmarks = () => {
    // ============================================================================
    // STATE
    // ============================================================================
    const [results, setResults] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [running, setRunning] = useState(false);

    // ============================================================================
    // EFFECTS
    // ============================================================================

    // Load latest results on mount
    useEffect(() => {
        fetchLatestResults();
    }, []);

    // ============================================================================
    // API FUNCTIONS
    // ============================================================================

    /**
     * Fetch the latest benchmark results.
     */
    const fetchLatestResults = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await benchmarkService.getLatestResult();
            setResults(data);

            // Also fetch chart data
            const charts = await benchmarkService.getChartData();
            setChartData(charts);
        } catch (err) {
            // If no results exist yet, that's okay
            if (err.response?.status === 404) {
                setError(null);
                setResults(null);
                setChartData(null);
            } else {
                setError(err.response?.data?.detail || 'Failed to load results');
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Run a new benchmark suite.
     */
    const runBenchmark = async () => {
        setRunning(true);
        setError(null);

        try {
            const data = await benchmarkService.runBenchmark();
            setResults(data);

            // Fetch chart data
            const charts = await benchmarkService.getChartData();
            setChartData(charts);

            return data;
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Failed to run benchmark';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setRunning(false);
        }
    };

    /**
     * Export results as JSON.
     */
    const exportJSON = async () => {
        try {
            await benchmarkService.exportJSON();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to export JSON');
        }
    };

    /**
     * Export results as CSV.
     */
    const exportCSV = async () => {
        try {
            await benchmarkService.exportCSV();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to export CSV');
        }
    };

    /**
     * Clear all results.
     */
    const clearResults = async () => {
        try {
            await benchmarkService.clearResults();
            setResults(null);
            setChartData(null);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to clear results');
        }
    };

    // ============================================================================
    // RETURN
    // ============================================================================

    return {
        results,
        chartData,
        loading,
        error,
        running,
        runBenchmark,
        fetchLatestResults,
        exportJSON,
        exportCSV,
        clearResults
    };
};
