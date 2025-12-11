"""
Classification API Endpoints

Handles data classification using ML/rule-based approaches.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.classification import ClassificationRequest, ClassificationResponse
from app.api.deps import get_current_user
from app.services.ml_classifier import MLClassifierService
from app.services.policy_engine import PolicyEngineService
from app.services.audit_service import AuditService
from app.utils.logger import logger


router = APIRouter(prefix="/classification", tags=["Classification"])


@router.post("", response_model=ClassificationResponse)
async def classify_data(
    request: ClassificationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Classify data sensitivity level.
    
    - Uses ML or rule-based classification
    - Returns sensitivity level, confidence score, and applicable policy
    """
    # Initialize services
    classifier = MLClassifierService(use_ml=request.use_ml)
    policy_engine = PolicyEngineService(db)
    audit_service = AuditService(db)
    
    # Classify text
    sensitivity_level, confidence = classifier.classify(request.text)
    
    # Get policy for this sensitivity level
    policy = policy_engine.get_policy(sensitivity_level.value)
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"No policy configured for sensitivity level: {sensitivity_level.value}"
        )
    
    # Log classification
    audit_service.log_action(
        user_id=current_user.id,
        action="classify",
        success=True,
        status_code=status.HTTP_200_OK,
    )
    
    logger.info(
        f"Classified data as {sensitivity_level.value} "
        f"(confidence: {confidence:.2f}, user: {current_user.username})"
    )
    
    return ClassificationResponse(
        sensitivity_level=sensitivity_level,
        confidence_score=confidence,
        classification_method="ml" if request.use_ml else "rule-based",
        policy=policy.to_dict(),
    )
