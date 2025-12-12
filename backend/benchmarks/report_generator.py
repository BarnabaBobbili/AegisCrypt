"""
report_generator.py

Generates benchmark reports in various formats (JSON, CSV).
Provides data export and formatting utilities.

Author: AI-Driven Adaptive Cryptographic Policy Engine
Created: 2025-12-13
"""

import json
import csv
from typing import List, Dict
from io import StringIO
from dataclasses import asdict

from benchmarks.benchmark_suite import BenchmarkReport, BenchmarkResult

# ============================================================================
# JSON EXPORT
# ============================================================================

def generate_json_report(report: BenchmarkReport) -> str:
    """
    Generate JSON formatted benchmark report.
    
    Args:
        report: BenchmarkReport to convert to JSON
        
    Returns:
        JSON string representation of the report
        
    Example:
        json_data = generate_json_report(report)
        with open('benchmark_results.json', 'w') as f:
            f.write(json_data)
    """
    # Convert dataclass to dictionary
    report_dict = {
        'timestamp': report.timestamp,
        'summary': report.summary,
        'results': [asdict(result) for result in report.results]
    }
    
    # Pretty print JSON with indentation
    return json.dumps(report_dict, indent=2)


# ============================================================================
# CSV EXPORT
# ============================================================================

def generate_csv_report(report: BenchmarkReport) -> str:
    """
    Generate CSV formatted benchmark report.
    
    Creates a CSV with columns for all benchmark metrics.
    Suitable for import into Excel or data analysis tools.
    
    Args:
        report: BenchmarkReport to convert to CSV
        
    Returns:
        CSV string representation of the results
        
    Example:
        csv_data = generate_csv_report(report)
        with open('benchmark_results.csv', 'w') as f:
            f.write(csv_data)
    """
    output = StringIO()
    
    # Define CSV columns
    fieldnames = [
        'operation',
        'file_size_bytes',
        'file_size_kb',
        'iterations',
        'avg_time_ms',
        'throughput_mbps',
        'avg_memory_mb',
        'avg_cpu_percent'
    ]
    
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    
    # Write each result
    for result in report.results:
        row = asdict(result)
        # Add human-readable file size
        row['file_size_kb'] = result.file_size_bytes / 1024
        writer.writerow(row)
    
    return output.getvalue()


# ============================================================================
# SUMMARY REPORT
# ============================================================================

def generate_summary_report(report: BenchmarkReport) -> str:
    """
    Generate human-readable summary report.
    
    Creates a formatted text summary of benchmark results
    suitable for console output or documentation.
    
    Args:
        report: BenchmarkReport to summarize
        
    Returns:
        Formatted text summary
        
    Example:
        summary = generate_summary_report(report)
        print(summary)
    """
    lines = []
    lines.append("=" * 70)
    lines.append("BENCHMARK REPORT")
    lines.append("=" * 70)
    lines.append(f"Timestamp: {report.timestamp}")
    lines.append(f"Total Tests: {report.summary['total_tests']}")
    lines.append("")
    
    # Summary statistics
    lines.append("SUMMARY STATISTICS")
    lines.append("-" * 70)
    lines.append(f"Average Encryption Throughput: {report.summary['avg_encryption_throughput']:.2f} MB/s")
    lines.append(f"Average Decryption Throughput: {report.summary['avg_decryption_throughput']:.2f} MB/s")
    lines.append(f"Average Key Generation Time: {report.summary['avg_key_gen_time_ms']:.2f} ms")
    lines.append("")
    
    # Detailed results by operation
    operations = {}
    for result in report.results:
        if result.operation not in operations:
            operations[result.operation] = []
        operations[result.operation].append(result)
    
    for operation, results in operations.items():
        lines.append(f"{operation.upper()} RESULTS")
        lines.append("-" * 70)
        
        for result in results:
            file_size_kb = result.file_size_bytes / 1024
            lines.append(f"  File Size: {file_size_kb:.0f} KB")
            lines.append(f"  Iterations: {result.iterations}")
            lines.append(f"  Avg Time: {result.avg_time_ms:.2f} ms")
            if result.throughput_mbps > 0:
                lines.append(f"  Throughput: {result.throughput_mbps:.2f} MB/s")
            lines.append(f"  Memory: {result.avg_memory_mb:.2f} MB")
            lines.append(f"  CPU: {result.avg_cpu_percent:.1f}%")
            lines.append("")
    
    lines.append("=" * 70)
    
    return "\n".join(lines)


# ============================================================================
# CHART DATA FORMATTING
# ============================================================================

def format_for_charts(report: BenchmarkReport) -> Dict:
    """
    Format benchmark data for frontend charts.
    
    Organizes data into structures optimized for charting libraries
    like Recharts.
    
    Args:
        report: BenchmarkReport to format
        
    Returns:
        Dictionary with chart-ready data structures
        
    Example:
        chart_data = format_for_charts(report)
        # Use chart_data['throughput'] for throughput chart
        # Use chart_data['latency'] for latency chart
    """
    # Throughput data (file size vs throughput)
    throughput_data = []
    latency_data = []
    memory_data = []
    
    # Group by file size
    file_sizes = sorted(set(r.file_size_bytes for r in report.results if r.operation in ['encryption', 'decryption']))
    
    for file_size in file_sizes:
        file_size_kb = file_size / 1024
        
        # Get encryption and decryption results for this file size
        enc_result = next((r for r in report.results if r.file_size_bytes == file_size and r.operation == 'encryption'), None)
        dec_result = next((r for r in report.results if r.file_size_bytes == file_size and r.operation == 'decryption'), None)
        
        if enc_result and dec_result:
            # Throughput chart data
            throughput_data.append({
                'fileSize': f"{file_size_kb:.0f}KB",
                'encryption': round(enc_result.throughput_mbps, 2),
                'decryption': round(dec_result.throughput_mbps, 2)
            })
            
            # Latency chart data
            latency_data.append({
                'fileSize': f"{file_size_kb:.0f}KB",
                'encryption': round(enc_result.avg_time_ms, 2),
                'decryption': round(dec_result.avg_time_ms, 2)
            })
            
            # Memory chart data
            memory_data.append({
                'fileSize': f"{file_size_kb:.0f}KB",
                'encryption': round(enc_result.avg_memory_mb, 2),
                'decryption': round(dec_result.avg_memory_mb, 2)
            })
    
    return {
        'throughput': throughput_data,
        'latency': latency_data,
        'memory': memory_data
    }
