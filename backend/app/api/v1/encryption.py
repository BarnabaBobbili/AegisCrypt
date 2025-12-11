"""
Encryption API Endpoints

Handles encryption and decryption operations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.data_classification import DataItem
from app.schemas.classification import (
    EncryptionRequest,
    EncryptionResponse,
    DecryptionRequest,
    DecryptionResponse,
    DataItemResponse,
)
from app.api.deps import get_current_user
from app.services.encryption_service import EncryptionService
from app.services.ml_classifier import MLClassifierService
from app.services.audit_service import AuditService
from app.utils.logger import logger


router = APIRouter(prefix="/encryption", tags=["Encryption"])


@router.post("/encrypt", response_model=EncryptionResponse)
async def encrypt_data(
    request: EncryptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Encrypt data with automatic or manual sensitivity classification.
    
    - Classifies data if sensitivity not provided
    - Applies appropriate cryptographic policy
    - Optionally saves to database
    """
    # Initialize services
    encryption_service = EncryptionService(db)
    audit_service = AuditService(db)
    
    # Determine sensitivity level
    if request.sensitivity_level:
        sensitivity_level = request.sensitivity_level
        confidence_score = None
    else:
        # Auto-classify
        classifier = MLClassifierService()
        sensitivity_level, confidence_score = classifier.classify(request.text)
    
    # Check if user can access this sensitivity level
    if not current_user.can_access_sensitivity(sensitivity_level.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions to encrypt {sensitivity_level.value} data"
        )
    
    # Encrypt and store
    data_item = encryption_service.encrypt_and_store(
        content=request.text,
        sensitivity_level=sensitivity_level,
        user=current_user,
        confidence_score=confidence_score
    )
    
    # Log encryption
    audit_service.log_action(
        user_id=current_user.id,
        action="encrypt",
        success=True,
        data_id=data_item.id if request.save_to_db else None,
        status_code=status.HTTP_200_OK,
    )
    
    logger.info(
        f"Encrypted data (ID: {data_item.id}, "
        f"sensitivity: {sensitivity_level.value}, user: {current_user.username})"
    )
    
    return EncryptionResponse(
        data_id=data_item.id if request.save_to_db else None,
        sensitivity_level=sensitivity_level,
        encrypted_data=data_item.encrypted_content,
        encryption_algorithm=data_item.encryption_algorithm,
        hash_value=data_item.hash_value,
        hash_algorithm=data_item.hash_algorithm,
        signature=data_item.signature,
        nonce=data_item.nonce,
        tag=data_item.tag,
    )


@router.post("/decrypt", response_model=DecryptionResponse)
async def decrypt_data(
    request: DecryptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Decrypt encrypted data.
    
    - Verifies user has access to the data
    - Decrypts and verifies integrity
    - Logs decryption attempt
    """
    # Get data item
    data_item = db.query(DataItem).filter(DataItem.id == request.data_id).first()
    
    if not data_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data item not found"
        )
    
    # Check ownership or admin access
    if data_item.user_id != current_user.id and not current_user.has_permission(current_user.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to decrypt this data"
        )
    
    # Check sensitivity access
    if not current_user.can_access_sensitivity(data_item.sensitivity_level.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions to access {data_item.sensitivity_level.value} data"
        )
    
    # Decrypt
    encryption_service = EncryptionService(db)
    audit_service = AuditService(db)
    
    try:
        result = encryption_service.decrypt_data(data_item)
        
        # Log successful decryption
        audit_service.log_action(
            user_id=current_user.id,
            action="decrypt",
            success=True,
            data_id=data_item.id,
            status_code=status.HTTP_200_OK,
        )
        
        logger.info(
            f"Decrypted data (ID: {data_item.id}, user: {current_user.username})"
        )
        
        return DecryptionResponse(
            data_id=data_item.id,
            decrypted_text=result["decrypted_text"],
            sensitivity_level=data_item.sensitivity_level,
            hash_verified=result["hash_verified"],
            signature_verified=result["signature_verified"],
        )
    
    except Exception as e:
        # Log failed decryption
        audit_service.log_action(
            user_id=current_user.id,
            action="decrypt",
            success=False,
            data_id=data_item.id,
            failure_reason=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
        
        logger.error(f"Decryption failed for data {data_item.id}: {e}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Decryption failed: {str(e)}"
        )


@router.get("/data", response_model=list[DataItemResponse])
async def list_user_data(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all encrypted data items for the current user.
    
    - Returns user's own data
    - Supports pagination
    """
    data_items = (
        db.query(DataItem)
        .filter(DataItem.user_id == current_user.id)
        .order_by(DataItem.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return data_items


@router.get("/data/{data_id}", response_model=DataItemResponse)
async def get_data_item(
    data_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get details of a specific data item.
    
    - Returns metadata only (not decrypted content)
    """
    data_item = db.query(DataItem).filter(DataItem.id == data_id).first()
    
    if not data_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data item not found"
        )
    
    # Check ownership
    if data_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return data_item


@router.delete("/data/{data_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_data_item(
    data_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a data item.
    
    - User can only delete their own data
    """
    data_item = db.query(DataItem).filter(DataItem.id == data_id).first()
    
    if not data_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data item not found"
        )
    
    # Check ownership
    if data_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    db.delete(data_item)
    db.commit()
    
    logger.info(f"Deleted data item {data_id} (user: {current_user.username})")
