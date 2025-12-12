"""
metrics_collector.py

Collects performance metrics for cryptographic operations.
Measures execution time, memory usage, and CPU utilization.

Author: AI-Driven Adaptive Cryptographic Policy Engine
Created: 2025-12-13
"""

import time
import psutil
import tracemalloc
from typing import Callable, Tuple, Any, Dict
from dataclasses import dataclass

# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class MetricsResult:
    """
    Container for performance metrics.
    
    Attributes:
        execution_time_ms (float): Execution time in milliseconds
        memory_used_mb (float): Memory consumed in megabytes
        cpu_percent (float): CPU utilization percentage
        result (Any): The actual result from the measured function
    """
    execution_time_ms: float
    memory_used_mb: float
    cpu_percent: float
    result: Any


# ============================================================================
# TIME MEASUREMENT
# ============================================================================

def measure_time(func: Callable, *args, **kwargs) -> Tuple[Any, float]:
    """
    Measure execution time of a function.
    
    Args:
        func: Function to measure
        *args: Positional arguments for the function
        **kwargs: Keyword arguments for the function
        
    Returns:
        Tuple of (function result, execution time in milliseconds)
        
    Example:
        result, time_ms = measure_time(encrypt_data, "sensitive text")
        print(f"Encryption took {time_ms:.2f}ms")
    """
    start_time = time.perf_counter()
    result = func(*args, **kwargs)
    end_time = time.perf_counter()
    
    execution_time_ms = (end_time - start_time) * 1000  # Convert to milliseconds
    return result, execution_time_ms


# ============================================================================
# MEMORY MEASUREMENT
# ============================================================================

def measure_memory(func: Callable, *args, **kwargs) -> Tuple[Any, float]:
    """
    Measure memory usage of a function.
    
    Uses tracemalloc to track memory allocation during function execution.
    
    Args:
        func: Function to measure
        *args: Positional arguments for the function
        **kwargs: Keyword arguments for the function
        
    Returns:
        Tuple of (function result, memory used in megabytes)
        
    Example:
        result, memory_mb = measure_memory(process_large_file, file_data)
        print(f"Used {memory_mb:.2f}MB of memory")
    """
    # Start tracking memory allocations
    tracemalloc.start()
    
    # Execute function
    result = func(*args, **kwargs)
    
    # Get peak memory usage
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    
    # Convert bytes to megabytes
    memory_used_mb = peak / (1024 * 1024)
    return result, memory_used_mb


# ============================================================================
# CPU MEASUREMENT
# ============================================================================

def measure_cpu(func: Callable, *args, **kwargs) -> Tuple[Any, float]:
    """
    Measure CPU utilization during function execution.
    
    Samples CPU usage before and after function execution.
    Note: For very fast functions, this may not be accurate.
    
    Args:
        func: Function to measure
        *args: Positional arguments for the function
        **kwargs: Keyword arguments for the function
        
    Returns:
        Tuple of (function result, average CPU percentage)
        
    Example:
        result, cpu_pct = measure_cpu(compute_hash, large_data)
        print(f"CPU usage: {cpu_pct:.1f}%")
    """
    # Get initial CPU percentage
    process = psutil.Process()
    cpu_before = process.cpu_percent(interval=0.1)
    
    # Execute function
    result = func(*args, **kwargs)
    
    # Get final CPU percentage
    cpu_after = process.cpu_percent(interval=0.1)
    
    # Average CPU usage
    avg_cpu_percent = (cpu_before + cpu_after) / 2
    return result, avg_cpu_percent


# ============================================================================
# COMPREHENSIVE METRICS
# ============================================================================

def collect_all_metrics(func: Callable, *args, **kwargs) -> MetricsResult:
    """
    Collect all performance metrics for a function.
    
    Measures execution time, memory usage, and CPU utilization in a single call.
    This is more efficient than calling each measurement function separately.
    
    Args:
        func: Function to measure
        *args: Positional arguments for the function
        **kwargs: Keyword arguments for the function
        
    Returns:
        MetricsResult containing all performance metrics
        
    Example:
        metrics = collect_all_metrics(encrypt_file, file_data, policy)
        print(f"Time: {metrics.execution_time_ms:.2f}ms")
        print(f"Memory: {metrics.memory_used_mb:.2f}MB")
        print(f"CPU: {metrics.cpu_percent:.1f}%")
    """
    # Start memory tracking
    tracemalloc.start()
    
    # Get initial CPU
    process = psutil.Process()
    cpu_before = process.cpu_percent(interval=0.1)
    
    # Start timer
    start_time = time.perf_counter()
    
    # Execute function
    result = func(*args, **kwargs)
    
    # Stop timer
    end_time = time.perf_counter()
    execution_time_ms = (end_time - start_time) * 1000
    
    # Get final CPU
    cpu_after = process.cpu_percent(interval=0.1)
    avg_cpu_percent = (cpu_before + cpu_after) / 2
    
    # Get memory usage
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    memory_used_mb = peak / (1024 * 1024)
    
    return MetricsResult(
        execution_time_ms=execution_time_ms,
        memory_used_mb=memory_used_mb,
        cpu_percent=avg_cpu_percent,
        result=result
    )


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def format_metrics(metrics: MetricsResult) -> Dict[str, str]:
    """
    Format metrics for human-readable display.
    
    Args:
        metrics: MetricsResult object to format
        
    Returns:
        Dictionary with formatted metric strings
        
    Example:
        formatted = format_metrics(metrics)
        print(formatted['time'])  # "123.45ms"
    """
    return {
        'time': f"{metrics.execution_time_ms:.2f}ms",
        'memory': f"{metrics.memory_used_mb:.2f}MB",
        'cpu': f"{metrics.cpu_percent:.1f}%"
    }
