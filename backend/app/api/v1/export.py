"""
Export API Endpoints

Endpoints for exporting audit logs, generating reports, and downloading data.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import io

from app.database import get_db
from app.models.user import User, UserRole
from app.api.deps import get_current_user, require_role
from app.services.export_service import ExportService
from app.utils.logger import logger


router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/audit-logs/csv")
async def export_audit_logs_csv(
    start_date: Optional[datetime] = Query(None, description="Start date filter"),
    end_date: Optional[datetime] = Query(None, description="End date filter"),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Export audit logs to CSV format (Admin only).
    
    Downloads a CSV file containing filtered audit logs.
    """
    export_service = ExportService(db)
    
    # Generate CSV
    csv_content = export_service.export_audit_logs_csv(
        start_date=start_date,
        end_date=end_date
    )
    
    # Create streaming response
    output = io.BytesIO(csv_content.encode('utf-8'))
    
    filename = f"audit_logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    logger.info(f"Admin {current_user.username} exported audit logs to CSV")
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/compliance-report")
async def get_compliance_report(
    days: int = Query(30, description="Number of days to include in report"),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Generate a compliance report (Admin only).
    
    Returns comprehensive compliance metrics for the specified period.
    """
    export_service = ExportService(db)
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    report = export_service.generate_compliance_report(
        start_date=start_date,
        end_date=end_date
    )
    
    logger.info(f"Admin {current_user.username} generated {days}-day compliance report")
    
    return report


@router.get("/data/{data_id}")
async def export_data_item(
    data_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export a specific encrypted data item with metadata.
    
    Returns detailed information about an encrypted data item.
    User must have access to the data item.
    """
    export_service = ExportService(db)
    
    data_export = export_service.export_data_item(data_id)
    
    if not data_export:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data item not found"
        )
    
    # Check if user owns the data or is admin
    if data_export['created_by'] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this data item"
        )
    
    logger.info(f"User {current_user.username} exported data item {data_id}")
    
    return data_export
