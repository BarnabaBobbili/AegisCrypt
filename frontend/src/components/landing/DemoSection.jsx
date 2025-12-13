import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { classifyText, encryptFile, fileToBase64 } from '../../services/public';
import Button from '../common/Button';
import {
    SparklesIcon,
    LockClosedIcon,
    DocumentArrowUpIcon,
    CheckCircleIcon,
    ClipboardDocumentIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';
import { copyToClipboard } from '../../utils/helpers';

const DemoSection = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [activeTab, setActiveTab] = useState('classify'); // 'classify' or 'encrypt'

    // Classification state
    const [classifyText, setClassifyText] = useState('');
    const [classifyResult, setClassifyResult] = useState(null);
    const [classifying, setClassifying] = useState(false);

    // Encryption state
    const [selectedFile, setSelectedFile] = useState(null);
    const [encryptResult, setEncryptResult] = useState(null);
    const [encrypting, setEncrypting] = useState(false);
    const [copied, setCopied] = useState(false);

    const [error, setError] = useState('');

    const handleClassify = async () => {
        if (!classifyText.trim()) {
            setError('Please enter some text to classify');
            return;
        }

        setClassifying(true);
        setError('');

        try {
            const result = await classifyText(classifyText);
            setClassifyResult(result);
        } catch (err) {
            setError('Classification failed: ' + (err.response?.data?.detail || err.message));
        } finally {
            setClassifying(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            setError('');
        }
    };

    const handleEncrypt = async () => {
        if (!selectedFile) {
            setError('Please select a file');
            return;
        }

        setEncrypting(true);
        setError('');

        try {
            const content = await fileToBase64(selectedFile);
            const encryptRequest = {
                content,
                filename: selectedFile.name,
                content_type: selectedFile.type || 'application/octet-stream',
                expiration_hours: 168, // 7 days
            };

            const result = await encryptFile(encryptRequest);
            setEncryptResult(result);
        } catch (err) {
            setError('Encryption failed: ' + (err.response?.data?.detail || err.message));
        } finally {
            setEncrypting(false);
        }
    };

    const handleCopyLink = () => {
        if (encryptResult) {
            copyToClipboard(encryptResult.share_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getSensitivityColor = (level) => {
        const colors = {
            public: 'green',
            internal: 'blue',
            confidential: 'orange',
            highly_sensitive: 'red',
        };
        return colors[level] || 'gray';
    };

    const resetClassify = () => {
        setClassifyText('');
        setClassifyResult(null);
        setError('');
    };

    const resetEncrypt = () => {
        setSelectedFile(null);
        setEncryptResult(null);
        setError('');
    };

    return (
        <div id="demo-section" className="bg-white py-20 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Try It Now - No Signup Required
                    </h2>
                    <p className="text-xl text-gray-600">
                        Experience AI-powered encryption in action. Completely free.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center space-x-2 mb-8">
                    <button
                        onClick={() => {
                            setActiveTab('classify');
                            resetEncrypt();
                        }}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'classify'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                            }`}
                    >
                        <SparklesIcon className="h-5 w-5 inline mr-2" />
                        AI Classification
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('encrypt');
                            resetClassify();
                        }}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'encrypt'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                            }`}
                    >
                        <LockClosedIcon className="h-5 w-5 inline mr-2" />
                        File Encryption
                    </button>
                </div>

                {/* Classification Tab */}
                {activeTab === 'classify' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Classify Text Sensitivity
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Paste any text and our AI will determine its sensitivity level
                        </p>

                        <textarea
                            value={classifyText}
                            onChange={(e) => setClassifyText(e.target.value)}
                            placeholder="Try: 'Customer SSN: 123-45-6789' or 'Meeting at 3pm tomorrow'"
                            className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 h-40 resize-none mb-4"
                        />

                        {error && activeTab === 'classify' && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleClassify}
                            loading={classifying}
                            disabled={!classifyText.trim()}
                            icon={SparklesIcon}
                            className="w-full py-4 text-lg"
                        >
                            {classifying ? 'Analyzing...' : 'Classify Text'}
                        </Button>

                        {/* Classification Result */}
                        {classifyResult && (
                            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-bold text-gray-900">Classification Result</h4>
                                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                </div>

                                <div className={`p-4 rounded-lg border-2 bg-${getSensitivityColor(classifyResult.sensitivity_level)}-50 border-${getSensitivityColor(classifyResult.sensitivity_level)}-200 mb-4`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`font-bold text-xl capitalize text-${getSensitivityColor(classifyResult.sensitivity_level)}-900`}>
                                                {classifyResult.sensitivity_level.replace('_', ' ')}
                                            </p>
                                            <p className={`text-sm text-${getSensitivityColor(classifyResult.sensitivity_level)}-700 mt-1`}>
                                                Confidence: {(classifyResult.confidence_score * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                        <SparklesIcon className={`h-10 w-10 text-${getSensitivityColor(classifyResult.sensitivity_level)}-600`} />
                                    </div>
                                </div>

                                {classifyResult.explanation && (
                                    <p className="text-sm text-gray-700 mb-4 p-3 bg-white rounded-lg border border-gray-200">
                                        {classifyResult.explanation}
                                    </p>
                                )}

                                {classifyResult.detected_patterns && classifyResult.detected_patterns.length > 0 && (
                                    <div>
                                        <h5 className="font-semibold text-gray-900 mb-2 text-sm">
                                            Detected Patterns ({classifyResult.detected_patterns.length})
                                        </h5>
                                        <div className="space-y-2">
                                            {classifyResult.detected_patterns.slice(0, 3).map((pattern, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-2 rounded-lg text-sm ${pattern.severity === 'high'
                                                            ? 'bg-red-50 border border-red-200'
                                                            : 'bg-yellow-50 border border-yellow-200'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-900 capitalize">
                                                            {pattern.type.replace('_', ' ')}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${pattern.severity === 'high'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-orange-100 text-orange-800'
                                                            }`}>
                                                            {pattern.severity}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Found {pattern.count} occurrence{pattern.count > 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!isAuthenticated && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <UserPlusIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                            <div className="flex-1">
                                                <h4 className="text-gray-900 font-semibold mb-1">Want to save and encrypt this?</h4>
                                                <p className="text-gray-700 text-sm mb-3">
                                                    Sign up to save classifications, encrypt files, and access advanced features.
                                                </p>
                                                <button
                                                    onClick={() => navigate('/login')}
                                                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                                >
                                                    Sign Up Free
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Encryption Tab */}
                {activeTab === 'encrypt' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Encrypt & Share Files
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Upload a file to encrypt it and get a secure shareable link
                        </p>

                        <label className="block cursor-pointer">
                            <div className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${selectedFile
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                                }`}>
                                {selectedFile ? (
                                    <div className="space-y-3">
                                        <CheckCircleIcon className="h-16 w-16 mx-auto text-blue-600" />
                                        <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                                        <p className="text-gray-600">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSelectedFile(null);
                                            }}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Change file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <DocumentArrowUpIcon className="h-16 w-16 mx-auto text-gray-400" />
                                        <p className="text-lg font-medium text-gray-700">
                                            Click to select file
                                        </p>
                                        <p className="text-sm text-gray-500">or drag and drop</p>
                                        <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>

                        {error && activeTab === 'encrypt' && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mt-4">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleEncrypt}
                            loading={encrypting}
                            disabled={!selectedFile}
                            icon={LockClosedIcon}
                            className="w-full py-4 text-lg mt-6"
                        >
                            {encrypting ? 'Encrypting...' : 'Encrypt File'}
                        </Button>

                        {/* Encryption Result */}
                        {encryptResult && (
                            <div className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                        <CheckCircleIcon className="h-10 w-10 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Encryption Successful!</h2>
                                    <p className="text-gray-600">Your file has been encrypted and is ready to share</p>
                                </div>

                                <div className="space-y-4">
                                    {/* Share Link */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={encryptResult.share_url}
                                                readOnly
                                                className="flex-1 px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg font-mono text-sm"
                                            />
                                            <Button onClick={handleCopyLink} icon={copied ? CheckCircleIcon : ClipboardDocumentIcon}>
                                                {copied ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Classification</p>
                                            <p className="font-semibold text-gray-900 capitalize">
                                                {encryptResult.sensitivity_level.replace('_', ' ')}
                                            </p>
                                        </div>
                                        {encryptResult.expires_at && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Expires</p>
                                                <p className="font-semibold text-gray-900">
                                                    {new Date(encryptResult.expires_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {!isAuthenticated && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <UserPlusIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                                <div className="flex-1">
                                                    <h4 className="text-gray-900 font-semibold mb-1">Want to do more?</h4>
                                                    <p className="text-gray-700 text-sm mb-3">
                                                        Create an account to save encrypted files, view history, and access advanced features.
                                                    </p>
                                                    <button
                                                        onClick={() => navigate('/login')}
                                                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                                    >
                                                        Sign Up Free
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DemoSection;
