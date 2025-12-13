import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { classifyText as classifyAPI, encryptFile, fileToBase64 } from '../../services/public';
import useScrollReveal from '../../hooks/useScrollReveal';
import {
    SparklesIcon,
    LockClosedIcon,
    DocumentArrowUpIcon,
    CheckCircleIcon,
    ClipboardDocumentIcon,
    UserPlusIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { copyToClipboard } from '../../utils/helpers';

const DemoSection = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [ref, isVisible] = useScrollReveal({ threshold: 0.2 });

    const [activeTab, setActiveTab] = useState('classify');

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
            const result = await classifyAPI(classifyText);
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
                expiration_hours: 168,
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
            public: { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', text: 'text-green-400' },
            internal: { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
            confidential: { bg: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
            highly_sensitive: { bg: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/30', text: 'text-red-400' },
        };
        return colors[level] || colors.internal;
    };

    return (
        <div id="demo" className="relative bg-[#0a0a0f] py-24 px-6 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 gradient-mesh-bg opacity-30"></div>

            <div
                ref={ref}
                className={`relative z-10 max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                        <SparklesIcon className="h-4 w-4 text-red-400" />
                        <span className="text-sm font-medium text-red-300">No Signup Required</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Try It <span className="gradient-text">Now</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Experience AI-powered encryption in action. Completely free.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-2 mb-8 flex-wrap">
                    <button
                        onClick={() => {
                            setActiveTab('classify');
                            setEncryptResult(null);
                        }}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'classify'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700'
                            }`}
                    >
                        <SparklesIcon className="h-5 w-5" />
                        AI Classification
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('encrypt');
                            setClassifyResult(null);
                        }}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'encrypt'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700'
                            }`}
                    >
                        <LockClosedIcon className="h-5 w-5" />
                        File Encryption
                    </button>
                </div>

                {/* Classification Tab */}
                {activeTab === 'classify' && (
                    <div className="glass-card p-8 rounded-2xl border border-gray-800 animate-scale-in">
                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            <SparklesIcon className="h-6 w-6 text-indigo-400" />
                            Classify Text Sensitivity
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Paste any text and our AI will determine its sensitivity level instantly
                        </p>

                        <textarea
                            value={classifyText}
                            onChange={(e) => setClassifyText(e.target.value)}
                            placeholder="Try: 'Customer SSN: 123-45-6789' or 'Meeting at 3pm tomorrow'"
                            className="w-full px-4 py-4 text-white bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 h-40 resize-none mb-4 font-mono"
                        />

                        {error && activeTab === 'classify' && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4 flex items-start gap-2">
                                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            onClick={handleClassify}
                            disabled={!classifyText.trim() || classifying}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-lg hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 animate-pulse-glow-blue"
                        >
                            <SparklesIcon className="h-6 w-6" />
                            {classifying ? 'Analyzing...' : 'Classify Text'}
                        </button>

                        {/* Classification Result */}
                        {classifyResult && (
                            <div className="mt-6 animate-scale-in">
                                <div className={`p-6 bg-gradient-to-r ${getSensitivityColor(classifyResult.sensitivity_level).bg} rounded-xl border ${getSensitivityColor(classifyResult.sensitivity_level).border}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                            <CheckCircleIcon className="h-6 w-6 text-green-400" />
                                            Classification Result
                                        </h4>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-300">Sensitivity Level</span>
                                                <span className={`text-lg font-bold uppercase ${getSensitivityColor(classifyResult.sensitivity_level).text}`}>
                                                    {classifyResult.sensitivity_level.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-800/50 rounded-full h-2">
                                                <div className={`bg-gradient-to-r ${getSensitivityColor(classifyResult.sensitivity_level).bg.replace('/20', '')} h-2 rounded-full transition-all duration-1000`}
                                                    style={{ width: `${classifyResult.confidence_score * 100}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Confidence: {(classifyResult.confidence_score * 100).toFixed(1)}%
                                            </p>
                                        </div>

                                        {classifyResult.explanation && (
                                            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                                <p className="text-sm text-gray-300">{classifyResult.explanation}</p>
                                            </div>
                                        )}

                                        {classifyResult.detected_patterns && classifyResult.detected_patterns.length > 0 && (
                                            <div>
                                                <h5 className="font-semibold text-white mb-2 text-sm">
                                                    Detected Patterns ({classifyResult.detected_patterns.length})
                                                </h5>
                                                <div className="space-y-2">
                                                    {classifyResult.detected_patterns.slice(0, 3).map((pattern, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="p-3 rounded-lg bg-gray-900/50 border border-gray-700 flex justify-between items-center"
                                                        >
                                                            <span className="font-medium text-gray-200 capitalize text-sm">
                                                                {pattern.type.replace('_', ' ')}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-400">
                                                                    {pattern.count} found
                                                                </span>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${pattern.severity === 'high'
                                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                                                    }`}>
                                                                    {pattern.severity}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {!isAuthenticated && (
                                        <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <UserPlusIcon className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-1" />
                                                <div>
                                                    <h4 className="text-white font-semibold mb-1">Want to save and encrypt this?</h4>
                                                    <p className="text-gray-300 text-sm mb-3">
                                                        Sign up to save classifications, encrypt files, and access history.
                                                    </p>
                                                    <button
                                                        onClick={() => navigate('/login')}
                                                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg text-sm hover:bg-red-500 transition-colors"
                                                    >
                                                        Sign Up Free →
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

                {/* Encryption Tab */}
                {activeTab === 'encrypt' && (
                    <div className="glass-card p-8 rounded-2xl border border-gray-800 animate-scale-in">
                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            <LockClosedIcon className="h-6 w-6 text-indigo-400" />
                            Encrypt & Share Files
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Upload a file to encrypt it and get a secure shareable link
                        </p>

                        <label className="block cursor-pointer">
                            <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${selectedFile
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : 'border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800/50'
                                }`}>
                                {selectedFile ? (
                                    <div className="space-y-3">
                                        <CheckCircleIcon className="h-16 w-16 mx-auto text-green-400" />
                                        <p className="text-lg font-medium text-white">{selectedFile.name}</p>
                                        <p className="text-gray-400">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSelectedFile(null);
                                            }}
                                            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                                        >
                                            Change file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <DocumentArrowUpIcon className="h-16 w-16 mx-auto text-gray-500" />
                                        <p className="text-lg font-medium text-gray-300">
                                            Click to select file
                                        </p>
                                        <p className="text-sm text-gray-500">or drag and drop</p>
                                        <p className="text-xs text-gray-600">Maximum file size: 10MB</p>
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
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mt-4 flex items-start gap-2">
                                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            onClick={handleEncrypt}
                            disabled={!selectedFile || encrypting}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-lg mt-6 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 animate-pulse-glow-blue"
                        >
                            <LockClosedIcon className="h-6 w-6" />
                            {encrypting ? 'Encrypting...' : 'Encrypt File'}
                        </button>

                        {/* Encryption Result */}
                        {encryptResult && (
                            <div className="mt-6 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl animate-scale-in">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
                                        <CheckCircleIcon className="h-10 w-10 text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Encryption Successful!</h2>
                                    <p className="text-gray-300">Your file is encrypted and ready to share</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Share Link</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={encryptResult.share_url}
                                                readOnly
                                                className="flex-1 px-4 py-3 text-white bg-gray-900/50 border border-gray-700 rounded-lg font-mono text-sm"
                                            />
                                            <button
                                                onClick={handleCopyLink}
                                                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-2"
                                            >
                                                {copied ? <CheckCircleIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">Classification</p>
                                            <p className="font-semibold text-white capitalize">
                                                {encryptResult.sensitivity_level.replace('_', ' ')}
                                            </p>
                                        </div>
                                        {encryptResult.expires_at && (
                                            <div>
                                                <p className="text-sm text-gray-400 mb-1">Expires</p>
                                                <p className="font-semibold text-white">
                                                    {new Date(encryptResult.expires_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {!isAuthenticated && (
                                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <UserPlusIcon className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-1" />
                                                <div>
                                                    <h4 className="text-white font-semibold mb-1">Want to do more?</h4>
                                                    <p className="text-gray-300 text-sm mb-3">
                                                        Create an account to save encrypted files, view history, and access advanced features.
                                                    </p>
                                                    <button
                                                        onClick={() => navigate('/login')}
                                                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg text-sm hover:bg-red-500 transition-colors"
                                                    >
                                                        Sign Up Free →
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
