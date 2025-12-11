"""
ML Classifier Service

Handles data classification using rule-based classification.
(ML model will be fine-tuned later with DistilBERT)
"""

from typing import Tuple, Optional
import re

from app.models.data_classification import SensitivityLevel
from app.utils.logger import logger


class MLClassifierService:
    """
    Service for classifying data sensitivity.
    
    Currently uses rule-based classification with keyword matching.
    Can be enhanced with fine-tuned DistilBERT model later.
    """
    
    # Keywords for each sensitivity level
    KEYWORDS = {
        SensitivityLevel.HIGHLY_SENSITIVE: [
            # Credentials & Auth
            r'\bpassword\b', r'\bpasswd\b', r'\bsecret(_key)?\b', r'\bapi[_-]?key\b',
            r'\bprivate[_-]?key\b', r'\btoken\b', r'\bcredentials?\b',
            # Financial
            r'\bcredit[_-]?card\b', r'\bcard[_-]?number\b', r'\bcvv\b', r'\bpin\b',
            r'\bbank[_-]?account\b', r'\brouting[_-]?number\b',
            # Personal Identifiable Information (PII)
            r'\bssn\b', r'\bsocial[_-]?security\b', r'\bpassport\b',
            r'\bdriver[\'s]?[_-]?license\b', r'\bnational[_-]?id\b',
            # Medical
            r'\bmedical[_-]?record\b', r'\bhealth[_-]?record\b', r'\bpatient[_-]?data\b',
            r'\bdiagnosis\b', r'\bprescription\b',
        ],
        SensitivityLevel.CONFIDENTIAL: [
            # Business
            r'\bconfidential\b', r'\bproprietary\b', r'\btrade[_-]?secret\b',
            r'\bfinancial[_-]?report\b', r'\bbudget\b', r'\bprofit\b', r'\brevenue\b',
            r'\bstrateg(y|ic)\b', r'\bmerger\b', r'\bacquisition\b',
            # HR & Personal
            r'\bsalary\b', r'\bcompensation\b', r'\bemployee[_-]?record\b',
            r'\bperformance[_-]?review\b', r'\btermination\b',
            # Legal
            r'\blegal[_-]?document\b', r'\bcontract\b', r'\bnda\b',
            r'\bnon[_-]?disclosure\b', r'\blitigation\b',
        ],
        SensitivityLevel.INTERNAL: [
            # Internal comms
            r'\binternal\b', r'\bmemo\b', r'\bdraft\b', r'\bwork[_-]?in[_-]?progress\b',
            # Business operations
            r'\bproject[_-]?plan\b', r'\bmeeting[_-]?notes\b', r'\bteam\b',
            r'\bdepartment\b', r'\boperations\b',
            # Non-sensitive employee info
            r'\bemployee[_-]?directory\b', r'\boffice[_-]?location\b',
        ],
    }
    
    def __init__(self, use_ml: bool = False):
        """
        Initialize ML classifier service.
        
        Args:
            use_ml: Whether to use ML model (not implemented yet)
        """
        self.use_ml = use_ml
        
        if use_ml:
            logger.warning(
                "ML model not yet loaded. Falling back to rule-based classification."
            )
    
    def classify(self, text: str) -> Tuple[SensitivityLevel, float]:
        """
        Classify text into a sensitivity level.
        
        Args:
            text: Text to classify
            
        Returns:
            tuple: (sensitivity_level, confidence_score)
        """
        if self.use_ml:
            # TODO: Implement ML-based classification with DistilBERT
            # For now, fall back to rule-based
            return self._rule_based_classify(text)
        else:
            return self._rule_based_classify(text)
    
    def _rule_based_classify(self, text: str) -> Tuple[SensitivityLevel, float]:
        """
        Rule-based classification using keyword matching.
        
        Args:
            text: Text to classify
            
        Returns:
            tuple: (sensitivity_level, confidence_score)
        """
        text_lower = text.lower()
        
        # Count matches for each sensitivity level
        matches = {}
        for level, keywords in self.KEYWORDS.items():
            count = 0
            for pattern in keywords:
                if re.search(pattern, text_lower, re.IGNORECASE):
                    count += 1
            matches[level] = count
        
        # Determine sensitivity level (highest match count wins)
        max_matches = max(matches.values())
        
        if max_matches == 0:
            # No keywords matched - assume public
            return SensitivityLevel.PUBLIC, 0.7
        
        # Find the highest sensitivity level with matches
        for level in [ SensitivityLevel.HIGHLY_SENSITIVE,
                       SensitivityLevel.CONFIDENTIAL,
                       SensitivityLevel.INTERNAL]:
            if matches[level] == max_matches and max_matches > 0:
                # Calculate confidence based on number of matches
                # More matches = higher confidence
                confidence = min(0.7 + (max_matches * 0.05), 0.95)
                
                logger.info(
                    f"Classified text as {level.value} "
                    f"(matches: {max_matches}, confidence: {confidence:.2f})"
                )
                
                return level, confidence
        
        # Default to internal if we have some matches but no clear winner
        return SensitivityLevel.INTERNAL, 0.6
    
    def explain_classification(
        self,
        text: str,
        sensitivity: SensitivityLevel
    ) -> dict:
        """
        Explain why text was classified at a certain level.
        
        Args:
            text: Classified text
            sensitivity: Determined sensitivity level
            
        Returns:
            dict: Explanation with matched keywords
        """
        text_lower = text.lower()
        matched_keywords = []
        
        if sensitivity in self.KEYWORDS:
            for pattern in self.KEYWORDS[sensitivity]:
                if re.search(pattern, text_lower, re.IGNORECASE):
                    matched_keywords.append(pattern)
        
        return {
            "sensitivity_level": sensitivity.value,
            "matched_keywords": matched_keywords,
            "keyword_count": len(matched_keywords),
            "method": "rule-based",
        }
