import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { classificationService } from '../services/classification';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
    DocumentTextIcon,
    ShieldCheckIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';

const Classification = () => {
    const [text, setText] = useState('');
    const [classificationResult, setClassificationResult] = useState(null);
    const [policyDetails, setPolicyDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleClassify = async (e) => {
        e.preventDefault();
        if (!text.trim()) {
            setError('Please enter some text to classify');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const result = await classificationService.classify(text, false);
            setClassificationResult(result);

            // Get policy details for the classified sensitivity level
            if (result.sensitivity_level) {
                const policy = getPolicyForLevel(result.sensitivity_level);
                setPolicyDetails(policy);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Classification failed');
        } finally {
            setLoading(false);
        }
    };

    const getPolicyForLevel = (sensitivityLevel) => {
        const policyMap = {
            'public': {
                encryption: 'AES-128-GCM',
                hash: 'SHA-256',
                signature: 'Not Required',
                mfa: 'None',
                description: 'Minimal protection for public data'
            },
            'internal': {
                encryption: 'AES-256-GCM',
                hash: 'SHA-256',
                signature: 'Optional',
                mfa: 'Conditional',
                description: 'Standard protection for internal data'
            },
            'confidential': {
                encryption: 'AES-256-GCM',
                hash: 'SHA-512',
                signature: 'Required (RSA-PSS)',
                mfa: 'Conditional',
                description: 'Strong protection for confidential data'
            },
            'highly_sensitive': {
                encryption: 'AES-256-GCM + RSA-2048',
                hash: 'SHA-512',
                signature: 'Required (RSA-PSS)',
                mfa: 'Required',
                description: 'Maximum protection for highly sensitive data'
            }
        };

        return policyMap[sensitivityLevel] || policyMap['public'];
    };

    const handleEncryptWithPolicy = () => {
        // Navigate to Encryption tab with pre-filled data
        navigate('/encryption', {
            state: {
                plaintext: text,
                sensitivity: classificationResult.sensitivity_level,
                policy: policyDetails
            }
        });
    };

    const getSensitivityColor = (level) => {
        const colors = {
            'public': 'green',
            'internal': 'blue',
            'confidential': 'orange',
            'highly_sensitive': 'red'
        };
        return colors[level] || 'gray';
    };

    const getSensitivityLabel = (level) => {
        const labels = {
            'public': 'Public',
            'internal': 'Internal',
            'confidential': 'Confidential',
            'highly_sensitive': 'Highly Sensitive'
        };
        return labels[level] || level;
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                    <h1 className="text-3xl font-bold text-white">Data Classification</h1>
                </div>

                {/* Classification Form */}
                <Card className="mb-6">
                    <form onSubmit={handleClassify} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Enter Text to Classify
                            </label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter text to analyze... (e.g., 'Customer SSN: 123-45-6789')"
                                className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 min-h-[120px] resize-y"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <p className="text-red-500 text-sm">{error}</p>
                            </div>
                        )}

                        <Button type="submit" loading={loading} icon={ShieldCheckIcon}>
                            Classify Text
                        </Button>
                    </form>
                </Card>

                {/* Classification Result */}
                {classificationResult && (
                    <div className="space-y-6">
                        <Card className="bg-slate-800/50 border-2 border-blue-500/30">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">Classification Result</h2>
                                <CheckCircleIcon className="h-6 w-6 text-green-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Sensitivity Level</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-${getSensitivityColor(classificationResult.sensitivity_level)}-500/20 text-${getSensitivityColor(classificationResult.sensitivity_level)}-400 border border-${getSensitivityColor(classificationResult.sensitivity_level)}-500/30`}>
                                        {getSensitivityLabel(classificationResult.sensitivity_level)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Confidence</p>
                                    <p className="text-white font-semibold">
                                        {(classificationResult.confidence_score * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Recommended Cryptographic Policy */}
                        {policyDetails && (
                            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <LockClosedIcon className="h-6 w-6 text-blue-500" />
                                    <h2 className="text-xl font-bold text-white">Recommended Cryptographic Policy</h2>
                                </div>

                                <p className="text-slate-300 text-sm mb-4">{policyDetails.description}</p>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-800/50 p-3 rounded-lg">
                                        <p className="text-slate-400 text-xs mb-1">Encryption Algorithm</p>
                                        <p className="text-white font-mono text-sm">{policyDetails.encryption}</p>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg">
                                        <p className="text-slate-400 text-xs mb-1">Hash Algorithm</p>
                                        <p className="text-white font-mono text-sm">{policyDetails.hash}</p>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg">
                                        <p className="text-slate-400 text-xs mb-1">Digital Signature</p>
                                        <p className="text-white font-mono text-sm">{policyDetails.signature}</p>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg">
                                        <p className="text-slate-400 text-xs mb-1">MFA Requirement</p>
                                        <p className="text-white font-mono text-sm">{policyDetails.mfa}</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleEncryptWithPolicy}
                                    variant="primary"
                                    icon={ArrowRightIcon}
                                    className="w-full"
                                >
                                    Go to Encryption Tab → Encrypt with This Policy
                                </Button>
                            </Card>
                        )}
                    </div>
                )}

                {/* Info Card */}
                {!classificationResult && (
                    <Card className="bg-blue-500/5 border-blue-500/20">
                        <h3 className="text-lg font-semibold text-white mb-2">How it works</h3>
                        <ul className="text-slate-300 text-sm space-y-2">
                            <li>• Enter text to analyze its sensitivity level</li>
                            <li>• AI classifier determines: Public, Internal, Confidential, or Highly Sensitive</li>
                            <li>• View the recommended cryptographic policy for that level</li>
                            <li>• Click the button to go to Encryption tab with pre-filled data</li>
                        </ul>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Classification;
