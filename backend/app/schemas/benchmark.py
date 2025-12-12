"""
benchmark.py

Pydantic schemas for benchmark API requests and responses.

Author: AI-Driven Adaptive Cryptographic Policy Engine
Created: 2025-12-13
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field

# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class BenchmarkRunRequest(BaseModel):
    """
    Request to run a new benchmark.
    
    Attributes:
        file_sizes: Optional list of file sizes to test (in bytes)
        iterations_override: Optional override for iteration counts
    """
    file_sizes: Optional[List[int]] = Field(
        default=None,
        description="List of file sizes to benchmark (bytes). Uses defaults if not provided."
    )
    iterations_override: Optional[Dict[int, int]] = Field(
        default=None,
        description="Override iteration counts for specific file sizes"
    )


class ExportRequest(BaseModel):
    """
    Request to export benchmark results.
    
    Attributes:
        format: Export format ('json' or 'csv')
        result_id: Optional specific result ID to export
    """
    format: str = Field(
        ...,
        description="Export format: 'json' or 'csv'",
        pattern="^(json|csv)$"
    )
    result_id: Optional[str] = Field(
        default=None,
        description="Specific result ID to export. If not provided, exports latest."
    )


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class BenchmarkResultSchema(BaseModel):
    """
    Individual benchmark result.
    
    Matches the BenchmarkResult dataclass from benchmark_suite.
    """
    operation: str = Field(..., description="Operation type (encryption, decryption, etc.)")
    file_size_bytes: int = Field(..., description="Test data size in bytes")
    iterations: int = Field(..., description="Number of iterations performed")
    avg_time_ms: float = Field(..., description="Average execution time in milliseconds")
    throughput_mbps: float = Field(..., description="Throughput in MB/s")
    avg_memory_mb: float = Field(..., description="Average memory usage in MB")
    avg_cpu_percent: float = Field(..., description="Average CPU utilization percentage")
    
    class Config:
        json_schema_extra = {
            "example": {
                "operation": "encryption",
                "file_size_bytes": 1048576,
                "iterations": 20,
                "avg_time_ms": 45.23,
                "throughput_mbps": 220.5,
                "avg_memory_mb": 12.3,
                "avg_cpu_percent": 45.2
            }
        }


class BenchmarkReportSchema(BaseModel):
    """
    Complete benchmark report.
    
    Matches the BenchmarkReport dataclass from benchmark_suite.
    """
    timestamp: str = Field(..., description="ISO format timestamp of benchmark run")
    results: List[BenchmarkResultSchema] = Field(..., description="All benchmark results")
    summary: Dict = Field(..., description="Summary statistics")
    
    class Config:
        json_schema_extra = {
            "example": {
                "timestamp": "2025-12-13T01:00:00",
                "results": [],
                "summary": {
                    "total_tests": 13,
                    "avg_encryption_throughput": 225.5,
                    "avg_decryption_throughput": 230.1,
                    "avg_key_gen_time_ms": 0.45
                }
            }
        }


class ChartDataSchema(BaseModel):
    """
    Formatted data for frontend charts.
    """
    throughput: List[Dict] = Field(..., description="Throughput chart data")
    latency: List[Dict] = Field(..., description="Latency chart data")
    memory: List[Dict] = Field(..., description="Memory usage chart data")


class BenchmarkStatusSchema(BaseModel):
    """
    Status of a running benchmark.
    """
    status: str = Field(..., description="Status: 'running', 'completed', 'failed'")
    progress: Optional[int] = Field(default=None, description="Progress percentage (0-100)")
    message: Optional[str] = Field(default=None, description="Status message")
