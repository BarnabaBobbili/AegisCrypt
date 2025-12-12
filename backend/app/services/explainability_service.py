"""
Explainability Service

Provides human-readable explanations for ML classification decisions.
Implements pattern detection and feature importance analysis for transparency.
"""

import re
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
from app.schemas.share import SensitivityLevel


@dataclass
class DetectedPattern:
    """Represents a detected sensitive pattern in text."""
    type: str
    count: int
    confidence: float
    examples: List[str]
    contribution: float
    severity: str  # 'high', 'medium', 'low'


@dataclass
class FeatureImportance:
    """Feature importance for classification."""
    feature: str
    importance: float
    description: str


@dataclass
class SensitiveRegion:
    """Highlighted region in text."""
    start: int
    end: int
    type: str
    severity: str
    text: str


@dataclass
class ExplanationResult:
    """Complete explanation for a classification."""
    sensitivity_level: str
    confidence_score: float
    explanation: str
    detected_patterns: List[DetectedPattern]
    feature_importance: List[FeatureImportance]
    highlighted_regions: List[SensitiveRegion]


class ExplainabilityService:
    """
    Generate explanations for AI classification decisions.
    
    Uses pattern detection and keyword analysis to identify why
    text was classified at a particular sensitivity level.
    """
    
    # Regex patterns for sensitive data
    PATTERNS = {
        'ssn': {
            'regex': r'\b\d{3}-\d{2}-\d{4}\b',
            'name': 'Social Security Number',
            'severity': 'high',
            'base_contribution': 0.45
        },
        'credit_card': {
            'regex': r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
            'name': 'Credit Card Number',
            'severity': 'high',
            'base_contribution': 0.40
        },
        'email': {
            'regex': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'name': 'Email Address',
            'severity': 'medium',
            'base_contribution': 0.10
        },
        'phone': {
            'regex': r'\b(?:\+1[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b',
            'name': 'Phone Number',
            'severity': 'medium',
            'base_contribution': 0.15
        },
        'ip_address': {
            'regex': r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b',
            'name': 'IP Address',
            'severity': 'medium',
            'base_contribution': 0.12
        },
        'date_of_birth': {
            'regex': r'\b(?:0[1-9]|1[0-2])[/-](?:0[1-9]|[12]\d|3[01])[/-](?:19|20)\d{2}\b',
            'name': 'Date of Birth',
            'severity': 'high',
            'base_contribution': 0.25
        },
    }
    
    # Keyword categories
    KEYWORDS = {
        'medical': {
            'words': ['diagnosis', 'patient', 'medical', 'prescription', 'doctor', 
                     'hospital', 'treatment', 'symptom', 'disease', 'medication',
                     'health', 'clinical', 'physician', 'nurse', 'surgery'],
            'name': 'Medical Terms',
            'severity': 'high',
            'base_contribution': 0.28
        },
        'financial': {
            'words': ['account', 'balance', 'transaction', 'credit', 'debit',
                     'payment', 'invoice', 'salary', 'revenue', 'profit',
                     'banking', 'wire', 'transfer', 'deposit', 'withdrawal'],
            'name': 'Financial Terms',
            'severity': 'high',
            'base_contribution': 0.25
        },
        'pii': {
            'words': ['address', 'birth', 'ssn', 'social security', 'passport',
                     'driver license', 'identification', 'personal', 'private',
                     'confidential', 'name', 'age', 'gender'],
            'name': 'Personal Information',
            'severity': 'high',
            'base_contribution': 0.20
        },
        'confidential': {
            'words': ['confidential', 'secret', 'classified', 'proprietary',
                     'restricted', 'internal only', 'privileged', 'sensitive',
                     'do not distribute', 'private'],
            'name': 'Confidentiality Markers',
            'severity': 'high',
            'base_contribution': 0.30
        },
        'legal': {
            'words': ['contract', 'agreement', 'legal', 'lawsuit', 'attorney',
                     'litigation', 'settlement', 'clause', 'terms', 'conditions'],
            'name': 'Legal Terms',
            'severity': 'medium',
            'base_contribution': 0.18
        },
    }
    
    def explain_classification(
        self,
        text: str,
        sensitivity_level: SensitivityLevel,
        confidence_score: float
    ) -> ExplanationResult:
        """
        Generate complete explanation for classification.
        
        Args:
            text: Input text that was classified
            sensitivity_level: Resulting sensitivity level
            confidence_score: Classifier confidence
            
        Returns:
            ExplanationResult with all explanation components
        """
        # Detect patterns and keywords
        detected_patterns = self._detect_patterns(text)
        
        # Calculate feature importance
        feature_importance = self._calculate_feature_importance(detected_patterns)
        
        # Find highlighted regions
        highlighted_regions = self._find_sensitive_regions(text, detected_patterns)
        
        # Generate human-readable explanation
        explanation = self._generate_explanation(
            sensitivity_level,
            detected_patterns,
            confidence_score
        )
        
        return ExplanationResult(
            sensitivity_level=sensitivity_level.value,
            confidence_score=confidence_score,
            explanation=explanation,
            detected_patterns=detected_patterns,
            feature_importance=feature_importance,
            highlighted_regions=highlighted_regions
        )
    
    def _detect_patterns(self, text: str) -> List[DetectedPattern]:
        """Detect all sensitive patterns in text."""
        detected = []
        
        # Check regex patterns
        for pattern_type, pattern_info in self.PATTERNS.items():
            matches = re.finditer(pattern_info['regex'], text, re.IGNORECASE)
            match_list = list(matches)
            
            if match_list:
                # Mask examples for privacy
                examples = [self._mask_sensitive(m.group(), pattern_type) 
                           for m in match_list[:3]]  # Show max 3 examples
                
                detected.append(DetectedPattern(
                    type=pattern_type,
                    count=len(match_list),
                    confidence=0.95,  # Pattern matches are high confidence
                    examples=examples,
                    contribution=pattern_info['base_contribution'],
                    severity=pattern_info['severity']
                ))
        
        # Check keyword categories
        text_lower = text.lower()
        for category, category_info in self.KEYWORDS.items():
            found_words = [word for word in category_info['words'] 
                          if word.lower() in text_lower]
            
            if found_words:
                # Calculate confidence based on keyword density
                word_count = len(text.split())
                density = len(found_words) / max(word_count, 1)
                confidence = min(0.5 + density * 10, 0.95)  # 0.5 to 0.95
                
                detected.append(DetectedPattern(
                    type=f"{category}_keywords",
                    count=len(found_words),
                    confidence=confidence,
                    examples=found_words[:5],  # Show max 5 examples
                    contribution=category_info['base_contribution'] * (len(found_words) / 10),
                    severity=category_info['severity']
                ))
        
        return detected
    
    def _mask_sensitive(self, text: str, pattern_type: str) -> str:
        """Mask sensitive information in examples."""
        if pattern_type == 'ssn':
            return 'XXX-XX-XXXX'
        elif pattern_type == 'credit_card':
            return 'XXXX-XXXX-XXXX-XXXX'
        elif pattern_type == 'phone':
            return 'XXX-XXX-XXXX'
        elif pattern_type == 'email':
            parts = text.split('@')
            if len(parts) == 2:
                return f"{parts[0][0]}***@{parts[1]}"
        return '***'
    
    def _calculate_feature_importance(
        self,
        detected_patterns: List[DetectedPattern]
    ) -> List[FeatureImportance]:
        """Calculate normalized feature importance."""
        if not detected_patterns:
            return []
        
        # Get contributions
        contributions = [(p.type, p.contribution, self._get_pattern_name(p.type)) 
                        for p in detected_patterns]
        
        # Normalize to sum to 1.0
        total = sum(c[1] for c in contributions)
        if total == 0:
            return []
        
        normalized = [(c[0], c[1] / total, c[2]) for c in contributions]
        
        # Sort by importance
        normalized.sort(key=lambda x: x[1], reverse=True)
        
        return [
            FeatureImportance(
                feature=name,
                importance=round(importance, 3),
                description=self._get_feature_description(feature_type)
            )
            for feature_type, importance, name in normalized
        ]
    
    def _get_pattern_name(self, pattern_type: str) -> str:
        """Get human-readable name for pattern type."""
        # Check if it's a keyword category
        if pattern_type.endswith('_keywords'):
            category = pattern_type.replace('_keywords', '')
            if category in self.KEYWORDS:
                return self.KEYWORDS[category]['name']
        
        # Check if it's a regex pattern
        if pattern_type in self.PATTERNS:
            return self.PATTERNS[pattern_type]['name']
        
        return pattern_type.replace('_', ' ').title()
    
    def _get_feature_description(self, feature_type: str) -> str:
        """Get description for feature."""
        descriptions = {
            'ssn': 'Social Security Number patterns detected',
            'credit_card': 'Credit card number patterns found',
            'email': 'Email addresses identified',
            'phone': 'Phone numbers detected',
            'medical_keywords': 'Medical terminology found',
            'financial_keywords': 'Financial terms detected',
            'pii_keywords': 'Personal information indicators',
            'confidential_keywords': 'Confidentiality markers present',
        }
        return descriptions.get(feature_type, 'Pattern detected in text')
    
    def _find_sensitive_regions(
        self,
        text: str,
        detected_patterns: List[DetectedPattern]
    ) -> List[SensitiveRegion]:
        """Find and mark sensitive regions in text."""
        regions = []
        
        # Find regex pattern matches
        for pattern in detected_patterns:
            if not pattern.type.endswith('_keywords'):
                pattern_info = self.PATTERNS.get(pattern.type)
                if pattern_info:
                    for match in re.finditer(pattern_info['regex'], text, re.IGNORECASE):
                        regions.append(SensitiveRegion(
                            start=match.start(),
                            end=match.end(),
                            type=pattern.type,
                            severity=pattern_info['severity'],
                            text=self._mask_sensitive(match.group(), pattern.type)
                        ))
        
        # Sort by position
        regions.sort(key=lambda r: r.start)
        
        return regions
    
    def _generate_explanation(
        self,
        sensitivity_level: SensitivityLevel,
        detected_patterns: List[DetectedPattern],
        confidence_score: float
    ) -> str:
        """Generate human-readable explanation."""
        if not detected_patterns:
            return f"Classified as {sensitivity_level.value} with {confidence_score:.1%} confidence based on content analysis."
        
        # Count high-severity patterns
        high_severity = [p for p in detected_patterns if p.severity == 'high']
        
        if high_severity:
            pattern_names = [self._get_pattern_name(p.type) for p in high_severity[:2]]
            if len(pattern_names) == 1:
                return f"Document contains {pattern_names[0]}, classified as {sensitivity_level.value}."
            else:
                return f"Document contains multiple sensitive indicators including {', '.join(pattern_names)}, classified as {sensitivity_level.value}."
        
        # Medium severity
        pattern_names = [self._get_pattern_name(p.type) for p in detected_patterns[:2]]
        return f"Document contains {', '.join(pattern_names)}, classified as {sensitivity_level.value}."
