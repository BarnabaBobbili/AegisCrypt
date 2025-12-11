"""
Export Service

Handles exporting data to various formats including CSV and PDF.
Supports audit log exports and compliance reports.
"""

from typing import List, Optional
from datetime import datetime
import csv
import io
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.data_classification import DataItem
from app.utils.logger import logger


class ExportService:
    """Service for exporting data to various formats."""
    
    def __init__(self, db: Session):
        """Initialize export service with database session."""
        self.db = db
    
    def export_audit_logs_csv(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        user_id: Optional[int] = None
    ) -> str:
        """
        Export audit logs to CSV format.
        
        Args:
            start_date: Optional start date filter
            end_date: Optional end date filter
            user_id: Optional user ID filter
            
        Returns:
            CSV string content
        """
        # Build query
        query = self.db.query(AuditLog)
        
        if start_date:
            query = query.filter(AuditLog.timestamp >= start_date)
        if end_date:
            query = query.filter(AuditLog.timestamp <= end_date)
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        
        # Order by timestamp descending
        logs = query.order_by(AuditLog.timestamp.desc()).all()
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'ID',
            'Timestamp',
            'User ID',
            'Action',
            'Data ID',
            'Risk Score',
            'MFA Required',
            'MFA Completed',
            'IP Address',
            'Request Path',
            'Request Method',
            'Status Code',
            'Success',
            'Failure Reason'
        ])
        
        # Write data rows
        for log in logs:
            writer.writerow([
                log.id,
                log.timestamp.isoformat() if log.timestamp else '',
                log.user_id or '',
                log.action or '',
                log.data_id or '',
                log.risk_score or '',
                log.mfa_required,
                log.mfa_completed,
                log.ip_address or '',
                log.request_path or '',
                log.request_method or '',
                log.status_code or '',
                log.success,
                log.failure_reason or ''
            ])
        
        csv_content = output.getvalue()
        output.close()
        
        logger.info(f"Exported {len(logs)} audit logs to CSV")
        return csv_content
    
    def generate_compliance_report(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> dict:
        """
        Generate a compliance report for a given date range.
        
        Args:
            start_date: Report start date
            end_date: Report end date
            
        Returns:
            Dictionary containing compliance metrics
        """
        # Query audit logs for the period
        logs = self.db.query(AuditLog).filter(
            AuditLog.timestamp >= start_date,
            AuditLog.timestamp <= end_date
        ).all()
        
        # Count encrypted data items
        encrypted_items = self.db.query(DataItem).filter(
            DataItem.created_at >= start_date,
            DataItem.created_at <= end_date
        ).count()
        
        # Calculate metrics
        total_actions = len(logs)
        successful_actions = sum(1 for log in logs if log.success)
        failed_actions = total_actions - successful_actions
        
        # Count by action type
        action_counts = {}
        for log in logs:
            action_counts[log.action] = action_counts.get(log.action, 0) + 1
        
        # Count high-risk actions
        high_risk_actions = sum(1 for log in logs if log.risk_score and log.risk_score >= 61)
        
        # Count MFA enforcements
        mfa_required_count = sum(1 for log in logs if log.mfa_required)
        mfa_completed_count = sum(1 for log in logs if log.mfa_completed)
        
        # Count failed logins
        failed_logins = action_counts.get('login_failed', 0)
        
        report = {
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'summary': {
                'total_actions': total_actions,
                'successful_actions': successful_actions,
                'failed_actions': failed_actions,
                'success_rate': f"{(successful_actions/total_actions*100):.2f}%" if total_actions > 0 else "0%"
            },
            'encryption': {
                'total_encrypted_items': encrypted_items
            },
            'security': {
                'high_risk_actions': high_risk_actions,
                'mfa_required': mfa_required_count,
                'mfa_completed': mfa_completed_count,
                'mfa_compliance_rate': f"{(mfa_completed_count/mfa_required_count*100):.2f}%" if mfa_required_count > 0 else "N/A",
                'failed_logins': failed_logins
            },
            'actions': action_counts
        }
        
        logger.info(f"Generated compliance report for {start_date.date()} to {end_date.date()}")
        return report
    
    def export_data_item(self, data_id: int) -> Optional[dict]:
        """
        Export a single encrypted data item with its metadata.
        
        Args:
            data_id: ID of the data item to export
            
        Returns:
            Dictionary containing data item information
        """
        data_item = self.db.query(DataItem).filter(DataItem.id == data_id).first()
        
        if not data_item:
            return None
        
        export_data = {
            'id': data_item.id,
            'sensitivity_level': data_item.sensitivity_level,
            'classification_confidence': data_item.classification_confidence,
            'encrypted_data': data_item.encrypted_data,
            'encryption_algorithm': data_item.encryption_algorithm,
            'key_size': data_item.key_size,
            'hash_algorithm': data_item.hash_algorithm,
            'hash_value': data_item.hash_value,
            'has_signature': data_item.signature is not None,
            'created_at': data_item.created_at.isoformat() if data_item.created_at else None,
            'created_by': data_item.created_by
        }
        
        logger.info(f"Exported data item {data_id}")
        return export_data
