"""
Public API Endpoints

Unauthenticated endpoints for public file encryption and sharing.
Anyone can encrypt files and share them via cryptographic links.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import base64

from app.database import get_db
from app.schemas.share import (
    ClassifyRequest,
    ClassifyResponse,
    PublicEncryptRequest,
    PublicEncryptResponse,
    ShareInfoResponse,
    DecryptRequest,
    DecryptResponse,
    FeatureImportance,
    SensitivityLevel,
)
from app.services.share_service import ShareService
from app.services.ml_classifier import MLClassifierService
from app.services.explainability_service import ExplainabilityService
from app.utils.logger import logger


router = APIRouter(prefix="/public", tags=["Public"])


@router.post("/classify", response_model=ClassifyResponse)
async def classify_text(
    request: ClassifyRequest,
    db: Session = Depends(get_db)
):
    """
    Classify text for sensitivity level (public endpoint).
    
    - No authentication required
    - Uses ML classifier to determine sensitivity
    - Returns explainability information with detected patterns
    - Shows feature importance and highlighted regions
    """
    try:
        # Classify using ML
        classifier = MLClassifierService()
        sensitivity_level, confidence_score = classifier.classify(request.text)
        
        # Generate explanation
        explainer = ExplainabilityService()
        explanation = explainer.explain_classification(
            text=request.text,
            sensitivity_level=sensitivity_level,
            confidence_score=confidence_score
        )
        
        logger.info(
            f"Classified text: {sensitivity_level.value} "
            f"(confidence: {confidence_score:.2f}, "
            f"patterns: {len(explanation.detected_patterns)})"
        )
        
        # Convert dataclasses to dicts for response
        return ClassifyResponse(
            sensitivity_level=sensitivity_level,
            confidence_score=confidence_score,
            explanation=explanation.explanation,
            detected_patterns=[
                {
                    "type": p.type,
                    "count": p.count,
                    "confidence": p.confidence,
                    "examples": p.examples,
                    "contribution": p.contribution,
                    "severity": p.severity
                }
                for p in explanation.detected_patterns
            ],
            feature_importance=[
                {
                    "feature": f.feature,
                    "importance": f.importance,
                    "description": f.description
                }
                for f in explanation.feature_importance
            ],
            highlighted_regions=[
                {
                    "start": r.start,
                    "end": r.end,
                    "type": r.type,
                    "severity": r.severity,
                    "text": r.text
                }
                for r in explanation.highlighted_regions
            ]
        )
    except Exception as e:
        logger.error(f"Classification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification failed: {str(e)}"
        )


@router.post("/encrypt", response_model=PublicEncryptResponse)
async def encrypt_file(
    request: PublicEncryptRequest,
    db: Session = Depends(get_db)
):
    """
    Encrypt a file and create a share link (public endpoint).
    
    - No authentication required
    - Auto-classifies sensitivity if not provided
    - Returns share token and URL
    - Supports password protection, expiration, download limits
    """
    try:
        # Decode base64 content
        try:
            content = base64.b64decode(request.content)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid base64 content: {str(e)}"
            )
        
        # Determine sensitivity level
        if request.sensitivity_level:
            sensitivity_level = request.sensitivity_level
            confidence_score = None
        else:
            # Auto-classify using content preview (first 10KB)
            preview_text = content[:10000].decode('utf-8', errors='ignore')
            classifier = MLClassifierService()
            sensitivity_level, confidence_score = classifier.classify(preview_text)
        
        # Create share link
        share_service = ShareService(db)
        share_link = share_service.create_share_link(
            content=content,
            filename=request.filename,
            content_type=request.content_type or "application/octet-stream",
            sensitivity_level=sensitivity_level,
            confidence_score=confidence_score,
            password=request.password,
            expiration_hours=request.expiration_hours,
            max_downloads=request.max_downloads,
        )
        
        # Build share URL
        # TODO: Get base URL from config
        share_url = f"http://localhost:3000/share/{share_link.share_token}"
        
        logger.info(
            f"Created public share: {share_link.share_token} "
            f"(sensitivity: {sensitivity_level.value})"
        )
        
        return PublicEncryptResponse(
            share_token=share_link.share_token,
            share_url=share_url,
            sensitivity_level=sensitivity_level,
            confidence_score=confidence_score,
            expires_at=share_link.expiration_time,
            max_downloads=share_link.max_downloads,
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Encryption failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Encryption failed: {str(e)}"
        )


@router.get("/share/{token}/info", response_model=ShareInfoResponse)
async def get_share_info(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Get metadata about a share link without decrypting.
    
    - No authentication required
    - Shows filename, size, expiration, download count
    - Does NOT reveal file content
    """
    share_service = ShareService(db)
    share_link = share_service.get_share_by_token(token)
    
    if not share_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link not found"
        )
    
    
    file_metadata = share_link.file_metadata or {}
    
    return ShareInfoResponse(
        filename=file_metadata.get("filename", "download"),
        file_size=file_metadata.get("file_size"),
        content_type=file_metadata.get("content_type"),
        created_at=share_link.created_at,
        expires_at=share_link.expiration_time,
        max_downloads=share_link.max_downloads,
        download_count=share_link.download_count,
        requires_password=bool(share_link.password_hash),
        is_expired=share_link.is_expired(),
        is_available=share_link.can_access(),
    )


@router.post("/decrypt/{token}", response_model=DecryptResponse)
async def decrypt_share(
    token: str,
    request: DecryptRequest,
    db: Session = Depends(get_db)
):
    """
    Decrypt a shared file.
    
    - No authentication required
    - Requires password if share is password-protected
    - Verifies expiration and download limits
    - Returns decrypted file content (base64)
    """
    share_service = ShareService(db)
    share_link = share_service.get_share_by_token(token)
    
    if not share_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link not found"
        )
    
    try:
        result = share_service.decrypt_share(
            share_link=share_link,
            password=request.password,
        )
        
        logger.info(f"Successfully decrypted share: {token}")
        
        return DecryptResponse(
            content=base64.b64encode(result["content"]).decode('utf-8'),
            filename=result["filename"],
            content_type=result["content_type"],
            hash_verified=result["hash_verified"],
            merkle_verified=result.get("merkle_verified", False),
            sensitivity_level=SensitivityLevel(result["sensitivity_level"]),
            remaining_downloads=result["remaining_downloads"],
        )
    
    except ValueError as e:
        # Access denied, wrong password, etc.
        logger.warning(f"Decryption denied for {token}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Decryption failed for {token}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Decryption failed: {str(e)}"
        )
