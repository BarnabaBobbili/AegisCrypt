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

    // Progress tracking
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [estimatedDuration, setEstimatedDuration] = useState(0);
    const [stopRequested, setStopRequested] = useState(false);

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
     * Run a new benchmark suite with progress tracking.
     */
    const runBenchmark = async () => {
        setRunning(true);
        setError(null);
        setProgress(0);
        setStopRequested(false);

        // Benchmark steps with estimated durations (in ms)
        const steps = [
            { name: 'Initializing benchmark environment...', duration: 1000 },
            { name: 'Testing key generation performance...', duration: 2000 },
            { name: 'Running encryption benchmarks...', duration: 3000 },
            { name: 'Running decryption benchmarks...', duration: 3000 },
            { name: 'Measuring memory usage...', duration: 2000 },
            { name: 'Analyzing results...', duration: 1500 },
            { name: 'Generating reports...', duration: 1000 }
        ];

        const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
        setEstimatedDuration(Math.ceil(totalDuration / 1000)); // Convert to seconds

        try {
            // Simulate progress through steps
            for (let i = 0; i < steps.length; i++) {
                if (stopRequested) {
                    throw new Error('Benchmark stopped by user');
                }

                const step = steps[i];
                setCurrentStep(step.name);
                setProgress(Math.round(((i + 1) / steps.length) * 100));

                // Calculate remaining time
                const remainingSteps = steps.slice(i + 1);
                const remaining = remainingSteps.reduce((sum, s) => sum + s.duration, 0);
                setTimeRemaining(Math.ceil(remaining / 1000));

                await new Promise(resolve => setTimeout(resolve, step.duration));
            }

            // Actually run the benchmark API call
            const data = await benchmarkService.runBenchmark();
            setResults(data);

            // Fetch chart data
            const charts = await benchmarkService.getChartData();
            setChartData(charts);

            return data;
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.message || 'Failed to run benchmark';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setRunning(false);
            setProgress(0);
            setCurrentStep('');
            setTimeRemaining(0);
            setStopRequested(false);
        }
    };

    /**
     * Stop the running benchmark.
     */
    const stopBenchmark = () => {
        setStopRequested(true);
        setCurrentStep('Stopping benchmark...');
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
        progress,
        currentStep,
        timeRemaining,
        estimatedDuration,
        runBenchmark,
        stopBenchmark,
        fetchLatestResults,
        exportJSON,
        exportCSV,
        clearResults
    };
};
