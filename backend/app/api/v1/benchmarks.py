"""
benchmarks.py

API endpoints for benchmark operations.
Provides REST API for running benchmarks and retrieving results.

Author: AI-Driven Adaptive Cryptographic Policy Engine
Created: 2025-12-13
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from typing import List

from app.schemas.benchmark import (
    BenchmarkRunRequest,
    BenchmarkReportSchema,
    ChartDataSchema,
    BenchmarkStatusSchema,
    ExportRequest
)
from benchmarks.benchmark_suite import run_comprehensive_suite
from benchmarks.report_generator import (
    generate_json_report,
    generate_csv_report,
    format_for_charts
)

# ============================================================================
# ROUTER SETUP
# ============================================================================

router = APIRouter(prefix="/benchmarks", tags=["benchmarks"])

# In-memory storage for benchmark results (replace with database in production)
_benchmark_results = []

# ============================================================================
# API ENDPOINTS
# ============================================================================

@router.post("/run", response_model=BenchmarkReportSchema)
async def run_benchmark(request: BenchmarkRunRequest = None):
    """
    Run a new benchmark suite.
    
    Executes comprehensive benchmarks for encryption, decryption,
    key generation, and Merkle tree operations.
    
    Args:
        request: Optional configuration for benchmark run
        
    Returns:
        BenchmarkReportSchema with all results
        
    Raises:
        HTTPException: If benchmark execution fails
        
    Example:
        POST /api/v1/benchmarks/run
        Response: { "timestamp": "...", "results": [...], "summary": {...} }
    """
    try:
        # Run comprehensive benchmark suite
        report = run_comprehensive_suite()
        
        # Store result (in production, save to database)
        _benchmark_results.append(report)
        
        # Keep only last 10 results
        if len(_benchmark_results) > 10:
            _benchmark_results.pop(0)
        
        return report
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Benchmark execution failed: {str(e)}"
        )


@router.get("/results", response_model=List[BenchmarkReportSchema])
async def get_all_results():
    """
    Get all stored benchmark results.
    
    Returns:
        List of all benchmark reports
        
    Example:
        GET /api/v1/benchmarks/results
        Response: [{ "timestamp": "...", "results": [...] }, ...]
    """
    return _benchmark_results


@router.get("/results/latest", response_model=BenchmarkReportSchema)
async def get_latest_result():
    """
    Get the most recent benchmark result.
    
    Returns:
        Latest BenchmarkReportSchema
        
    Raises:
        HTTPException: If no results available
        
    Example:
        GET /api/v1/benchmarks/results/latest
        Response: { "timestamp": "...", "results": [...], "summary": {...} }
    """
    if not _benchmark_results:
        raise HTTPException(
            status_code=404,
            detail="No benchmark results available. Run a benchmark first."
        )
    
    return _benchmark_results[-1]


@router.get("/results/charts", response_model=ChartDataSchema)
async def get_chart_data():
    """
    Get formatted data for frontend charts.
    
    Returns chart-ready data structures for throughput, latency,
    and memory usage visualizations.
    
    Returns:
        ChartDataSchema with formatted data
        
    Raises:
        HTTPException: If no results available
        
    Example:
        GET /api/v1/benchmarks/results/charts
        Response: {
            "throughput": [{ "fileSize": "1KB", "encryption": 300, ... }],
            "latency": [...],
            "memory": [...]
        }
    """
    if not _benchmark_results:
        raise HTTPException(
            status_code=404,
            detail="No benchmark results available. Run a benchmark first."
        )
    
    latest_report = _benchmark_results[-1]
    chart_data = format_for_charts(latest_report)
    
    return chart_data


@router.get("/export/json")
async def export_json():
    """
    Export latest benchmark results as JSON.
    
    Returns:
        JSON file download
        
    Raises:
        HTTPException: If no results available
        
    Example:
        GET /api/v1/benchmarks/export/json
        Response: JSON file download
    """
    if not _benchmark_results:
        raise HTTPException(
            status_code=404,
            detail="No benchmark results available"
        )
    
    latest_report = _benchmark_results[-1]
    json_data = generate_json_report(latest_report)
    
    return Response(
        content=json_data,
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=benchmark_results.json"
        }
    )


@router.get("/export/csv")
async def export_csv():
    """
    Export latest benchmark results as CSV.
    
    Returns:
        CSV file download
        
    Raises:
        HTTPException: If no results available
        
    Example:
        GET /api/v1/benchmarks/export/csv
        Response: CSV file download
    """
    if not _benchmark_results:
        raise HTTPException(
            status_code=404,
            detail="No benchmark results available"
        )
    
    latest_report = _benchmark_results[-1]
    csv_data = generate_csv_report(latest_report)
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=benchmark_results.csv"
        }
    )


@router.delete("/results/clear")
async def clear_results():
    """
    Clear all stored benchmark results.
    
    Returns:
        Success message
        
    Example:
        DELETE /api/v1/benchmarks/results/clear
        Response: { "message": "All results cleared" }
    """
    _benchmark_results.clear()
    return {"message": "All benchmark results cleared successfully"}
