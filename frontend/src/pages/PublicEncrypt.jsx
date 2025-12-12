import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { encryptFile, fileToBase64, classifyText } from '../services/public';
import { copyToClipboard } from '../utils/helpers';
import {
    LockClosedIcon,
    DocumentArrowUpIcon,
    ClipboardDocumentIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ClockIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const PublicEncrypt = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'

    // Encryption options
    const [password, setPassword] = useState('');
    const [expirationHours, setExpirationHours] = useState(168); // 7 days default
    const [maxDownloads, setMaxDownloads] = useState('');

    // Classification result
    const [classification, setClassification] = useState(null);
    const [classifying, setClassifying] = useState(false);

    // Encryption result
    const [shareResult, setShareResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

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

    const handleClassifyPreview = async () => {
        if (!textContent.trim() && inputMode === 'text') return;
        if (!selectedFile && inputMode === 'file') return;

        setClassifying(true);
        setError('');

        try {
            let previewText = textContent;

            if (inputMode === 'file' && selectedFile) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    previewText = e.target.result.substring(0, 10000);
                    const result = await classifyText(previewText);
                    setClassification(result);
                    setClassifying(false);
                };
                reader.readAsText(selectedFile.slice(0, 10000));
                return;
            }

            const result = await classifyText(previewText);
            setClassification(result);
        } catch (err) {
            setError('Classification failed: ' + (err.response?.data?.detail || err.message));
        } finally {
            setClassifying(false);
        }
    };

    const handleEncrypt = async () => {
        if (inputMode === 'file' && !selectedFile) {
            setError('Please select a file');
            return;
        }
        if (inputMode === 'text' && !textContent.trim()) {
            setError('Please enter text content');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let content;
            let filename;
            let contentType;

            if (inputMode === 'file') {
                content = await fileToBase64(selectedFile);
                filename = selectedFile.name;
                contentType = selectedFile.type || 'application/octet-stream';
            } else {
                content = btoa(unescape(encodeURIComponent(textContent)));
                filename = 'encrypted-text.txt';
                contentType = 'text/plain';
            }

            const encryptRequest = {
                content,
                filename,
                content_type: contentType,
                password: password || undefined,
                expiration_hours: expirationHours || undefined,
                max_downloads: maxDownloads ? parseInt(maxDownloads) : undefined,
            };

            const result = await encryptFile(encryptRequest);
            setShareResult(result);

            setSelectedFile(null);
            setTextContent('');
            setPassword('');
            setClassification(null);
        } catch (err) {
            setError('Encryption failed: ' + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (shareResult) {
            copyToClipboard(shareResult.share_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getSensitivityColor = (level) => {
        const colors = {
            public: 'bg-green-100 text-green-700 border-green-200',
            internal: 'bg-blue-100 text-blue-700 border-blue-200',
            confidential: 'bg-orange-100 text-orange-700 border-orange-200',
            highly_sensitive: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[level] || colors.public;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="text-center mb-10 animate-fade-in">
                    <div className="flex items-center justify-center mb-4">
                        <ShieldCheckIcon className="h-12 w-12 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Secure File Encryption
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Encrypt and share files securely with AI-powered protection. No account needed.
                    </p>
                </div>

                {!shareResult ? (
                    <div className="space-y-6 animate-slide-up">
                        {/* Input Mode Selection */}
                        <div className="flex gap-3 p-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <button
                                onClick={() => setInputMode('file')}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${inputMode === 'file'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <DocumentArrowUpIcon className="h-5 w-5" />
                                Upload File
                            </button>
                            <button
                                onClick={() => setInputMode('text')}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${inputMode === 'text'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <LockClosedIcon className="h-5 w-5" />
                                Enter Text
                            </button>
                        </div>

                        {/* File/Text Input Card */}
                        <div className="card p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                {inputMode === 'file' ? 'Choose File to Encrypt' : 'Enter Content to Encrypt'}
                            </h3>

                            {inputMode === 'file' ? (
                                <label className="block cursor-pointer">
                                    <div className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${selectedFile
                                        ? 'border-blue-300 bg-blue-50'
                                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                                        }`}>
                                        {selectedFile ? (
                                            <div className="space-y-3">
                                                <CheckCircleIcon className="h-16 w-16 mx-auto text-blue-600" />
                                                <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                                                <p className="text-gray-500">
                                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedFile(null);
                                                    }}
                                                    className="text-sm text-blue-600 hover:text-primary-700 font-medium"
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
                            ) : (
                                <textarea
                                    value={textContent}
                                    onChange={(e) => setTextContent(e.target.value)}
                                    placeholder="Enter your sensitive text here..."
                                    className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 h-64 resize-none"
                                />
                            )}

                            {/* AI Classification Button */}
                            {(selectedFile || textContent.trim()) && (
                                <button
                                    onClick={handleClassifyPreview}
                                    disabled={classifying}
                                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {classifying ? (
                                        <>
                                            <SparklesIcon className="h-5 w-5 animate-pulse" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="h-5 w-5" />
                                            Preview AI Classification
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* AI Classification Result */}
                        {classification && (
                            <div className="card p-6 animate-fade-in">
                                <div className="flex items-center gap-2 mb-4">
                                    <SparklesIcon className="h-6 w-6 text-blue-600" />
                                    <h3 className="text-xl font-semibold text-gray-900">AI Classification</h3>
                                </div>

                                <div className={`p-4 rounded-lg border ${getSensitivityColor(classification.sensitivity_level)}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-lg capitalize">
                                                {classification.sensitivity_level.replace('_', ' ')}
                                            </p>
                                            <p className="text-sm opacity-80">
                                                Confidence: {(classification.confidence_score * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                        <ShieldCheckIcon className="h-10 w-10 opacity-60" />
                                    </div>
                                    {classification.explanation && (
                                        <p className="text-sm mt-3 pt-3 border-t border-current/20">
                                            {classification.explanation}
                                        </p>
                                    )}
                                </div>

                                {/* Detected Patterns */}
                                {classification.detected_patterns && classification.detected_patterns.length > 0 && (
                                    <div className="mt-5">
                                        <h4 className="font-semibold text-gray-900 mb-3">
                                            Detected Patterns ({classification.detected_patterns.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {classification.detected_patterns.map((pattern, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-3 rounded-lg border ${pattern.severity === 'high'
                                                        ? 'bg-red-50 border-red-200'
                                                        : 'bg-yellow-50 border-yellow-200'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900 capitalize text-sm">
                                                                {pattern.type.replace('_', ' ')}
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                Found {pattern.count} occurrence{pattern.count > 1 ? 's' : ''}
                                                                {pattern.examples?.length > 0 && (
                                                                    <span className="ml-2">
                                                                        (e.g., {pattern.examples.slice(0, 2).join(', ')})
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${pattern.severity === 'high' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-orange-100 text-orange-800 border border-orange-200'}`}>
                                                            {pattern.severity}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Encryption Options */}
                        <div className="card p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Options</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <LockClosedIcon className="h-4 w-4 inline mr-1" />
                                        Password Protection (Optional)
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password..."
                                        className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <ClockIcon className="h-4 w-4 inline mr-1" />
                                            Expiration (hours)
                                        </label>
                                        <input
                                            type="number"
                                            value={expirationHours}
                                            onChange={(e) => setExpirationHours(e.target.value)}
                                            min="1"
                                            max="8760"
                                            className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Default: 7 days (168 hours)</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <ArrowDownTrayIcon className="h-4 w-4 inline mr-1" />
                                            Max Downloads
                                        </label>
                                        <input
                                            type="number"
                                            value={maxDownloads}
                                            onChange={(e) => setMaxDownloads(e.target.value)}
                                            min="1"
                                            max="1000"
                                            placeholder="Unlimited"
                                            className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Encrypt Button */}
                        <button
                            onClick={handleEncrypt}
                            disabled={loading || (inputMode === 'file' && !selectedFile) || (inputMode === 'text' && !textContent.trim())}
                            className="btn-primary w-full py-4 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Encrypting...
                                </>
                            ) : (
                                <>
                                    <LockClosedIcon className="h-5 w-5" />
                                    Encrypt and Create Share Link
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    /* Success Result */
                    <div className="card p-8 animate-slide-up">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                <CheckCircleIcon className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Encryption Successful!</h2>
                            <p className="text-gray-600">Your file has been encrypted and is ready to share</p>
                        </div>

                        <div className="space-y-6">
                            {/* Share Link */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={shareResult.share_url}
                                        readOnly
                                        className="input font-mono text-sm"
                                    />
                                    <button onClick={handleCopyLink} className="btn-primary px-6">
                                        {copied ? (
                                            <>
                                                <CheckCircleIcon className="h-5 w-5" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <ClipboardDocumentIcon className="h-5 w-5" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Classification</p>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {shareResult.sensitivity_level.replace('_', ' ')}
                                    </p>
                                </div>
                                {shareResult.expires_at && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Expires</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(shareResult.expires_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {shareResult.confidence_score && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Confidence</p>
                                        <p className="font-medium text-gray-900">
                                            {(shareResult.confidence_score * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                )}
                                {shareResult.max_downloads && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Max Downloads</p>
                                        <p className="font-medium text-gray-900">{shareResult.max_downloads}</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShareResult(null)}
                                    className="btn-secondary flex-1 py-3"
                                >
                                    Encrypt Another File
                                </button>
                                <button
                                    onClick={() => navigate(`/share/${shareResult.share_token}`)}
                                    className="btn-primary flex-1 py-3"
                                >
                                    Test Decryption
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicEncrypt;
