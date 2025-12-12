"""
benchmark_suite.py

Main benchmark orchestrator for cryptographic operations.
Coordinates benchmark execution and generates comprehensive reports.

Author: AI-Driven Adaptive Cryptographic Policy Engine
Created: 2025-12-13
"""

import os
import secrets
from typing import List, Dict
from dataclasses import dataclass, asdict
from datetime import datetime

from app.core.crypto import aes_encrypt, aes_decrypt, generate_rsa_keypair
from app.services.integrity_service import IntegrityService
from benchmarks.metrics_collector import collect_all_metrics, MetricsResult

# ============================================================================
# CONSTANTS
# ============================================================================

# File sizes for benchmarking (in bytes)
FILE_SIZES = [
    1024,           # 1 KB
    10 * 1024,      # 10 KB
    100 * 1024,     # 100 KB
    1024 * 1024,    # 1 MB
    10 * 1024 * 1024,   # 10 MB
]

# Iteration counts (more iterations for smaller files)
ITERATIONS_MAP = {
    1024: 100,              # 1 KB: 100 iterations
    10 * 1024: 100,         # 10 KB: 100 iterations
    100 * 1024: 50,         # 100 KB: 50 iterations
    1024 * 1024: 20,        # 1 MB: 20 iterations
    10 * 1024 * 1024: 5,    # 10 MB: 5 iterations
}

# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class BenchmarkResult:
    """
    Result from a single benchmark test.
    
    Attributes:
        operation (str): Type of operation (e.g., 'encryption', 'decryption')
        file_size_bytes (int): Size of test data in bytes
        iterations (int): Number of iterations performed
        avg_time_ms (float): Average execution time in milliseconds
        throughput_mbps (float): Throughput in megabytes per second
        avg_memory_mb (float): Average memory usage in megabytes
        avg_cpu_percent (float): Average CPU utilization percentage
    """
    operation: str
    file_size_bytes: int
    iterations: int
    avg_time_ms: float
    throughput_mbps: float
    avg_memory_mb: float
    avg_cpu_percent: float


@dataclass
class BenchmarkReport:
    """
    Comprehensive benchmark report.
    
    Attributes:
        timestamp (str): When the benchmark was run
        results (List[BenchmarkResult]): All benchmark results
        summary (Dict): Summary statistics
    """
    timestamp: str
    results: List[BenchmarkResult]
    summary: Dict


# ============================================================================
# BENCHMARK FUNCTIONS
# ============================================================================

def benchmark_encryption(
    file_size: int,
    iterations: int = 100
) -> BenchmarkResult:
    """
    Benchmark encryption performance.
    
    Tests encryption speed across multiple iterations and calculates
    average performance metrics.
    
    Args:
        file_size: Size of test data in bytes
        iterations: Number of times to repeat the test
        
    Returns:
        BenchmarkResult with encryption performance metrics
        
    Example:
        result = benchmark_encryption(1024 * 1024, 20)  # 1MB, 20 iterations
        print(f"Throughput: {result.throughput_mbps:.2f} MB/s")
    """
    # Generate random test data
    test_data = secrets.token_bytes(file_size)
    
    # Collect metrics across iterations
    total_time = 0.0
    total_memory = 0.0
    total_cpu = 0.0
    
    for _ in range(iterations):
        metrics = collect_all_metrics(
            aes_encrypt,
            test_data.hex()  # Convert bytes to hex string
        )
        total_time += metrics.execution_time_ms
        total_memory += metrics.memory_used_mb
        total_cpu += metrics.cpu_percent
    
    # Calculate averages
    avg_time_ms = total_time / iterations
    avg_memory_mb = total_memory / iterations
    avg_cpu_percent = total_cpu / iterations
    
    # Calculate throughput (MB/s)
    throughput_mbps = (file_size / (1024 * 1024)) / (avg_time_ms / 1000)
    
    return BenchmarkResult(
        operation="encryption",
        file_size_bytes=file_size,
        iterations=iterations,
        avg_time_ms=avg_time_ms,
        throughput_mbps=throughput_mbps,
        avg_memory_mb=avg_memory_mb,
        avg_cpu_percent=avg_cpu_percent
    )


def benchmark_decryption(
    file_size: int,
    iterations: int = 100
) -> BenchmarkResult:
    """
    Benchmark decryption performance.
    
    Args:
        file_size: Size of test data in bytes
        iterations: Number of times to repeat the test
        
    Returns:
        BenchmarkResult with decryption performance metrics
    """
    # Generate and encrypt test data
    test_data = secrets.token_bytes(file_size)
    encrypted = aes_encrypt(test_data.hex())
    
    # Collect metrics across iterations
    total_time = 0.0
    total_memory = 0.0
    total_cpu = 0.0
    
    for _ in range(iterations):
        # Decode the base64 key for decryption
        import base64
        key_bytes = base64.b64decode(encrypted['key'])
        
        metrics = collect_all_metrics(
            aes_decrypt,
            encrypted['ciphertext'],
            key_bytes,
            encrypted['nonce'],
            encrypted['tag']
        )
        total_time += metrics.execution_time_ms
        total_memory += metrics.memory_used_mb
        total_cpu += metrics.cpu_percent
    
    # Calculate averages
    avg_time_ms = total_time / iterations
    avg_memory_mb = total_memory / iterations
    avg_cpu_percent = total_cpu / iterations
    throughput_mbps = (file_size / (1024 * 1024)) / (avg_time_ms / 1000)
    
    return BenchmarkResult(
        operation="decryption",
        file_size_bytes=file_size,
        iterations=iterations,
        avg_time_ms=avg_time_ms,
        throughput_mbps=throughput_mbps,
        avg_memory_mb=avg_memory_mb,
        avg_cpu_percent=avg_cpu_percent
    )


def benchmark_key_generation(iterations: int = 1000) -> BenchmarkResult:
    """
    Benchmark key generation performance.
    
    Args:
        iterations: Number of keys to generate
        
    Returns:
        BenchmarkResult with key generation metrics
    """
    # Collect metrics
    total_time = 0.0
    total_memory = 0.0
    total_cpu = 0.0
    
    for _ in range(iterations):
        metrics = collect_all_metrics(
            generate_rsa_keypair,
            2048  # 2048-bit RSA key
        )
        total_time += metrics.execution_time_ms
        total_memory += metrics.memory_used_mb
        total_cpu += metrics.cpu_percent
    
    # Calculate averages
    avg_time_ms = total_time / iterations
    avg_memory_mb = total_memory / iterations
    avg_cpu_percent = total_cpu / iterations
    
    return BenchmarkResult(
        operation="key_generation",
        file_size_bytes=32,  # 256 bits = 32 bytes
        iterations=iterations,
        avg_time_ms=avg_time_ms,
        throughput_mbps=0.0,  # Not applicable for key generation
        avg_memory_mb=avg_memory_mb,
        avg_cpu_percent=avg_cpu_percent
    )


def benchmark_merkle_tree(
    file_size: int,
    chunk_size: int = 4096
) -> BenchmarkResult:
    """
    Benchmark Merkle tree construction.
    
    Args:
        file_size: Size of test data in bytes
        chunk_size: Size of each chunk in bytes
        
    Returns:
        BenchmarkResult with Merkle tree construction metrics
    """
    # Generate test data
    test_data = secrets.token_bytes(file_size)
    integrity_service = IntegrityService()
    
    # Measure Merkle tree construction
    metrics = collect_all_metrics(
        integrity_service.create_merkle_tree,
        test_data
    )
    
    return BenchmarkResult(
        operation="merkle_tree",
        file_size_bytes=file_size,
        iterations=1,
        avg_time_ms=metrics.execution_time_ms,
        throughput_mbps=(file_size / (1024 * 1024)) / (metrics.execution_time_ms / 1000),
        avg_memory_mb=metrics.memory_used_mb,
        avg_cpu_percent=metrics.cpu_percent
    )


# ============================================================================
# COMPREHENSIVE SUITE
# ============================================================================

def run_comprehensive_suite() -> BenchmarkReport:
    """
    Run all benchmarks and generate comprehensive report.
    
    Executes encryption, decryption, key generation, and Merkle tree
    benchmarks across various file sizes.
    
    Returns:
        BenchmarkReport with all results and summary statistics
        
    Example:
        report = run_comprehensive_suite()
        print(f"Total tests: {len(report.results)}")
        print(f"Average encryption throughput: {report.summary['avg_encryption_throughput']:.2f} MB/s")
    """
    results = []
    
    print("Starting comprehensive benchmark suite...")
    
    # Benchmark encryption and decryption for each file size
    for file_size in FILE_SIZES:
        iterations = ITERATIONS_MAP[file_size]
        
        print(f"\nTesting {file_size / 1024:.0f}KB ({iterations} iterations)...")
        
        # Encryption
        print("  - Encryption...")
        enc_result = benchmark_encryption(file_size, iterations)
        results.append(enc_result)
        
        # Decryption
        print("  - Decryption...")
        dec_result = benchmark_decryption(file_size, iterations)
        results.append(dec_result)
        
        # Merkle tree (only for larger files)
        if file_size >= 100 * 1024:
            print("  - Merkle tree...")
            merkle_result = benchmark_merkle_tree(file_size)
            results.append(merkle_result)
    
    # Key generation
    print("\nTesting key generation (1000 iterations)...")
    key_result = benchmark_key_generation(1000)
    results.append(key_result)
    
    # Calculate summary statistics
    enc_results = [r for r in results if r.operation == "encryption"]
    dec_results = [r for r in results if r.operation == "decryption"]
    
    summary = {
        "total_tests": len(results),
        "avg_encryption_throughput": sum(r.throughput_mbps for r in enc_results) / len(enc_results),
        "avg_decryption_throughput": sum(r.throughput_mbps for r in dec_results) / len(dec_results),
        "avg_key_gen_time_ms": key_result.avg_time_ms,
    }
    
    print("\n✅ Benchmark suite complete!")
    
    return BenchmarkReport(
        timestamp=datetime.now().isoformat(),
        results=results,
        summary=summary
    )
