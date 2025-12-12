/**
 * benchmarks.js
 * 
 * API service for benchmark operations.
 * Handles all HTTP requests to the benchmark endpoints.
 */

import api from './api';

// ============================================================================
// BENCHMARK OPERATIONS
// ============================================================================

/**
 * Run a new benchmark suite.
 * 
 * @returns {Promise<Object>} Benchmark report with results and summary
 */
export const runBenchmark = async () => {
    const response = await api.post('/api/v1/benchmarks/run');
    return response.data;
};

/**
 * Get all benchmark results.
 * 
 * @returns {Promise<Array>} List of all benchmark reports
 */
export const getAllResults = async () => {
    const response = await api.get('/api/v1/benchmarks/results');
    return response.data;
};

/**
 * Get the latest benchmark result.
 * 
 * @returns {Promise<Object>} Latest benchmark report
 */
export const getLatestResult = async () => {
    const response = await api.get('/api/v1/benchmarks/results/latest');
    return response.data;
};

/**
 * Get formatted data for charts.
 * 
 * @returns {Promise<Object>} Chart-ready data (throughput, latency, memory)
 */
export const getChartData = async () => {
    const response = await api.get('/api/v1/benchmarks/results/charts');
    return response.data;
};

/**
 * Export results as JSON.
 * 
 * Downloads JSON file to user's computer.
 */
export const exportJSON = async () => {
    const response = await api.get('/api/v1/benchmarks/export/json', {
        responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'benchmark_results.json');
    document.body.appendChild(link);
    link.click();
    link.remove();
};

/**
 * Export results as CSV.
 * 
 * Downloads CSV file to user's computer.
 */
export const exportCSV = async () => {
    const response = await api.get('/api/v1/benchmarks/export/csv', {
        responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'benchmark_results.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
};

/**
 * Clear all benchmark results.
 * 
 * @returns {Promise<Object>} Success message
 */
export const clearResults = async () => {
    const response = await api.delete('/api/v1/benchmarks/results/clear');
    return response.data;
};
