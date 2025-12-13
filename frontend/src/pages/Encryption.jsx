import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { encryptionService } from '../services/encryption';
import { encryptFile, fileToBase64, classifyText } from '../services/public';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDate, copyToClipboard } from '../utils/helpers';
import {
    LockClosedIcon,
    LockOpenIcon,
    DocumentArrowUpIcon,
    ClipboardDocumentIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ClockIcon,
    ArrowDownTrayIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';

const Encryption = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    // Tab management
    const [activeTab, setActiveTab] = useState('encrypt');

    // Input mode
    const [inputMode, setInputMode] = useState('text'); // 'file' or 'text'
    const [selectedFile, setSelectedFile] = useState(null);
    const [textContent, setTextContent] = useState('');

    // Encryption options
    const [password, setPassword] = useState('');
    const [expirationHours, setExpirationHours] = useState(168); // 7 days default
    const [maxDownloads, setMaxDownloads] = useState('');

    // Classification
    const [classification, setClassification] = useState(null);
    const [classifying, setClassifying] = useState(false);

    // Results
    const [encryptResult, setEncryptResult] = useState(null);
    const [shareResult, setShareResult] = useState(null);
    const [decryptResult, setDecryptResult] = useState(null);

    // Data items (for authenticated users)
    const [dataItems, setDataItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [fromClassification, setFromClassification] = useState(null);

    // Check if navigated from Classification page
    useEffect(() => {
        if (location.state?.plaintext) {
            setTextContent(location.state.plaintext);
            setInputMode('text');
            setFromClassification({
                sensitivity: location.state.sensitivity,
                policy: location.state.policy
            });
            setActiveTab('encrypt');
        }
    }, [location]);

    // Fetch data items for authenticated users
    useEffect(() => {
        if (isAuthenticated && activeTab === 'decrypt') {
            fetchDataItems();
        }
    }, [isAuthenticated, activeTab]);

    const fetchDataItems = async () => {
        try {
            const items = await encryptionService.getDataItems();
            setDataItems(items);
        } catch (error) {
            console.error('Failed to fetch data items:', error);
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
            if (isAuthenticated && inputMode === 'text' && !password && !expirationHours && !maxDownloads) {
                // Authenticated text encryption - use existing service
                const result = await encryptionService.encrypt(textContent);
                setEncryptResult(result);
                setTextContent('');
                setClassification(null);
                setFromClassification(null);
            } else {
                // Public encryption or file encryption - use public API
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
                setFromClassification(null);
            }
        } catch (err) {
            setError('Encryption failed: ' + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDecrypt = async (itemId) => {
        setLoading(true);
        setSelectedItem(itemId);
        try {
            const result = await encryptionService.decrypt(itemId);
            setDecryptResult(result);
        } catch (error) {
            console.error('Decryption failed:', error);
            setError('Decryption failed. Please try again.');
        } finally {
            setLoading(false);
            setSelectedItem(null);
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
            public: 'green',
            internal: 'blue',
            confidential: 'orange',
            highly_sensitive: 'red',
        };
        return colors[level] || 'gray';
    };

    const resetEncryptForm = () => {
        setEncryptResult(null);
        setShareResult(null);
        setSelectedFile(null);
        setTextContent('');
        setPassword('');
        setClassification(null);
        setError('');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <LockClosedIcon className="h-8 w-8 text-blue-500" />
                    <h1 className="text-3xl font-bold text-gray-900">
                        Encryption & Decryption
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 mb-6">
                    <button
                        onClick={() => {
                            setActiveTab('encrypt');
                            resetEncryptForm();
                        }}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'encrypt'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                            }`}
                    >
                        <LockClosedIcon className="h-5 w-5 inline mr-2" />
                        Encrypt
                    </button>
                    {isAuthenticated && (
                        <button
                            onClick={() => {
                                setActiveTab('decrypt');
                                setDecryptResult(null);
                            }}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'decrypt'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                                }`}
                        >
                            <LockOpenIcon className="h-5 w-5 inline mr-2" />
                            Decrypt
                        </button>
                    )}
                </div>

                {/* Encrypt Tab */}
                {activeTab === 'encrypt' && (
                    <div className="space-y-6">
                        {/* Classification Info Banner */}
                        {fromClassification && (
                            <Card className="bg-blue-50 border-2 border-blue-500">
                                <div className="flex items-center gap-2 mb-3">
                                    <LockClosedIcon className="h-6 w-6 text-blue-600" />
                                    <h3 className="text-blue-900 font-bold text-lg">Ready to Encrypt with Recommended Policy</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3 rounded-lg">
                                        <span className="text-gray-700 text-sm">Sensitivity:</span>
                                        <span className="text-gray-900 ml-2 font-semibold capitalize">{fromClassification.sensitivity.replace('_', ' ')}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg">
                                        <span className="text-gray-700 text-sm">Algorithm:</span>
                                        <span className="text-blue-600 ml-2 font-mono font-semibold">{fromClassification.policy.encryption}</span>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Input Mode Selection */}
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setInputMode('text')}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${inputMode === 'text'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                                    }`}
                            >
                                <LockClosedIcon className="h-5 w-5" />
                                Enter Text
                            </button>
                            <button
                                onClick={() => setInputMode('file')}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${inputMode === 'file'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                                    }`}
                            >
                                <DocumentArrowUpIcon className="h-5 w-5" />
                                Upload File
                            </button>
                        </div>

                        {/* File/Text Input Card */}
                        <Card>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                {inputMode === 'file' ? 'Choose File to Encrypt' : 'Enter Content to Encrypt'}
                            </h3>

                            {inputMode === 'file' ? (
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
                                <Button
                                    onClick={handleClassifyPreview}
                                    loading={classifying}
                                    icon={SparklesIcon}
                                    variant="secondary"
                                    className="mt-4 w-full"
                                >
                                    {classifying ? 'Analyzing...' : 'Preview AI Classification'}
                                </Button>
                            )}
                        </Card>

                        {/* AI Classification Result */}
                        {classification && (
                            <Card className="border-2 border-purple-500">
                                <div className="flex items-center gap-3 mb-4">
                                    <SparklesIcon className="h-6 w-6 text-purple-600" />
                                    <h3 className="text-xl font-bold text-gray-900">AI Classification Result</h3>
                                </div>

                                <div className={`p-4 rounded-lg border-2 bg-${getSensitivityColor(classification.sensitivity_level)}-50 border-${getSensitivityColor(classification.sensitivity_level)}-200`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className={`font-bold text-xl capitalize text-${getSensitivityColor(classification.sensitivity_level)}-900`}>
                                                {classification.sensitivity_level.replace('_', ' ')}
                                            </p>
                                            <p className={`text-sm text-${getSensitivityColor(classification.sensitivity_level)}-700 mt-1`}>
                                                Confidence: {(classification.confidence_score * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                        <ShieldCheckIcon className={`h-10 w-10 text-${getSensitivityColor(classification.sensitivity_level)}-600`} />
                                    </div>
                                    {classification.explanation && (
                                        <p className={`text-sm mt-3 pt-3 border-t border-${getSensitivityColor(classification.sensitivity_level)}-300 text-${getSensitivityColor(classification.sensitivity_level)}-800`}>
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
                                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${pattern.severity === 'high'
                                                                ? 'bg-red-100 text-red-800 border border-red-200'
                                                                : 'bg-orange-100 text-orange-800 border border-orange-200'
                                                            }`}>
                                                            {pattern.severity}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Security Options */}
                        <Card>
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
                        </Card>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Encrypt Button */}
                        <Button
                            onClick={handleEncrypt}
                            loading={loading}
                            disabled={(inputMode === 'file' && !selectedFile) || (inputMode === 'text' && !textContent.trim())}
                            icon={LockClosedIcon}
                            className="w-full py-4 text-lg"
                        >
                            {isAuthenticated && inputMode === 'text' && !password && !expirationHours && !maxDownloads
                                ? 'Encrypt Data'
                                : 'Encrypt and Create Share Link'}
                        </Button>

                        {/* Authenticated Text Encryption Result */}
                        {encryptResult && (
                            <Card className="border-2 border-green-500">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Encryption Result</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-gray-700 font-medium">Encrypted Data</p>
                                            <button
                                                onClick={() => copyToClipboard(encryptResult.encrypted_data)}
                                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 font-medium"
                                            >
                                                <ClipboardDocumentIcon className="h-4 w-4" />
                                                Copy
                                            </button>
                                        </div>
                                        <div className="p-3 bg-gray-100 rounded-lg text-gray-900 font-mono text-sm break-all">
                                            {encryptResult.encrypted_data.substring(0, 100)}...
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Algorithm</p>
                                            <p className="text-gray-900 font-semibold">{encryptResult.encryption_algorithm}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Hash Algorithm</p>
                                            <p className="text-gray-900 font-semibold">{encryptResult.hash_algorithm}</p>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                                        <CheckCircleIcon className="h-5 w-5" />
                                        Data encrypted and saved successfully (ID: {encryptResult.data_id})
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Share Link Result */}
                        {shareResult && (
                            <Card className="border-2 border-green-500">
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
                                                value={shareResult.share_url}
                                                readOnly
                                                className="flex-1 px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
                                            />
                                            <Button onClick={handleCopyLink} icon={copied ? CheckCircleIcon : ClipboardDocumentIcon}>
                                                {copied ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Classification</p>
                                            <p className="font-semibold text-gray-900 capitalize">
                                                {shareResult.sensitivity_level.replace('_', ' ')}
                                            </p>
                                        </div>
                                        {shareResult.expires_at && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Expires</p>
                                                <p className="font-semibold text-gray-900">
                                                    {new Date(shareResult.expires_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                        {shareResult.confidence_score && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Confidence</p>
                                                <p className="font-semibold text-gray-900">
                                                    {(shareResult.confidence_score * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                        )}
                                        {shareResult.max_downloads && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Max Downloads</p>
                                                <p className="font-semibold text-gray-900">{shareResult.max_downloads}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={resetEncryptForm}
                                            variant="secondary"
                                            className="flex-1"
                                        >
                                            Encrypt Another File
                                        </Button>
                                        <Button
                                            onClick={() => navigate(`/share/${shareResult.share_token}`)}
                                            className="flex-1"
                                        >
                                            Test Decryption
                                        </Button>
                                    </div>

                                    {/* Sign Up Prompt for Public Users */}
                                    {!isAuthenticated && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <UserPlusIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                                <div className="flex-1">
                                                    <h4 className="text-gray-900 font-semibold mb-1">Want to do more?</h4>
                                                    <p className="text-gray-700 text-sm mb-3">
                                                        Create an account to decrypt files, view encryption history, and access advanced features.
                                                    </p>
                                                    <button
                                                        onClick={() => navigate('/login')}
                                                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                                    >
                                                        Sign Up / Login
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* Decrypt Tab (Authenticated Only) */}
                {activeTab === 'decrypt' && isAuthenticated && (
                    <div className="space-y-6">
                        <Card>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Data to Decrypt</h3>
                            {dataItems.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <LockOpenIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p>No encrypted data available</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {dataItems.map((item) => (
                                        <div key={item.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-900 font-semibold">Data Item #{item.id}</p>
                                                    <p className="text-sm text-gray-500 mt-1">{formatDate(item.created_at)}</p>
                                                </div>
                                                <Button
                                                    onClick={() => handleDecrypt(item.id)}
                                                    loading={loading && selectedItem === item.id}
                                                    size="sm"
                                                    icon={LockOpenIcon}
                                                >
                                                    Decrypt
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {decryptResult && (
                            <Card className="border-2 border-green-500">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Decryption Result</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-gray-700 font-medium mb-2">Decrypted Text</p>
                                        <div className="p-4 bg-gray-50 rounded-lg text-gray-900 border border-gray-200">
                                            {decryptResult.decrypted_text}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <span className="text-gray-700 font-medium">Hash Verified:</span>
                                            <span className={decryptResult.hash_verified ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                                {decryptResult.hash_verified ? '✓ Yes' : '✗ No'}
                                            </span>
                                        </div>
                                        {decryptResult.signature_verified !== null && (
                                            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <span className="text-gray-700 font-medium">Signature Verified:</span>
                                                <span className={decryptResult.signature_verified ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                                    {decryptResult.signature_verified ? '✓ Yes' : '✗ No'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Encryption;
