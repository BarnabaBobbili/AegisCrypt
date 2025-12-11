"""
Policies API Endpoints

Handles encryption policy management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.encryption_policy import EncryptionPolicy
from app.schemas.policy import PolicyResponse, PolicyUpdate
from app.api.deps import get_current_user, require_admin
from app.services.policy_engine import PolicyEngineService
from app.utils.logger import logger


router = APIRouter(prefix="/policies", tags=["Policies"])


@router.get("", response_model=list[PolicyResponse])
async def list_policies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all encryption policies.
    
    - Available to all authenticated users
    """
    policy_engine = PolicyEngineService(db)
    policies = policy_engine.get_all_policies()
    return policies


@router.get("/{sensitivity_level}", response_model=PolicyResponse)
async def get_policy(
    sensitivity_level: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get policy for a specific sensitivity level.
    """
    policy_engine = PolicyEngineService(db)
    policy = policy_engine.get_policy(sensitivity_level)
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Policy not found for sensitivity level: {sensitivity_level}"
        )
    
    return policy


@router.put("/{sensitivity_level}", response_model=PolicyResponse)
async def update_policy(
    sensitivity_level: str,
    policy_update: PolicyUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update an encryption policy (admin only).
    
    - Requires admin role
    - Updates policy configuration
    """
    policy_engine = PolicyEngineService(db)
    
    # Convert Pydantic model to dict, excluding None values
    updates = policy_update.dict(exclude_none=True)
    
    updated_policy = policy_engine.update_policy(sensitivity_level, updates)
    
    if not updated_policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Policy not found for sensitivity level: {sensitivity_level}"
        )
    
    logger.info(
        f"Policy updated for {sensitivity_level} by admin {current_user.username}"
    )
    
    return updated_policy
