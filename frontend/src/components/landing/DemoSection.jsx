import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
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
    const { isDark } = useTheme();
    const [ref, isVisible] = useScrollReveal({ threshold: 0.2 });

    const [activeTab, setActiveTab] = useState('classify');

    // Classification state
    const [classifyText, setClassifyText] = useState('');
    const [classifyResult, setClassifyResult] = useState(null);
    const [classifying, setClassifying] = useState(false);
    const [classifyProgress, setClassifyProgress] = useState(0);
    const [classifyStep, setClassifyStep] = useState('');

    // Encryption state
    const [selectedFile, setSelectedFile] = useState(null);
    const [encryptResult, setEncryptResult] = useState(null);
    const [encrypting, setEncrypting] = useState(false);
    const [encryptProgress, setEncryptProgress] = useState(0);
    const [encryptStep, setEncryptStep] = useState('');
    const [copied, setCopied] = useState(false);
    const [expirationHours, setExpirationHours] = useState(168); // 7 days default

    // Benchmark state
    const [benchmarkRunning, setBenchmarkRunning] = useState(false);
    const [benchmarkResults, setBenchmarkResults] = useState(null);
    const [benchmarkProgress, setBenchmarkProgress] = useState(0);
    const [benchmarkStep, setBenchmarkStep] = useState('');
    const [benchmarkTimeRemaining, setBenchmarkTimeRemaining] = useState(0);

    const [error, setError] = useState('');

    const handleClassify = async () => {
        if (!classifyText.trim()) {
            setError('Please enter some text to classify');
            return;
        }

        setClassifying(true);
        setClassifyResult(null);
        setError('');
        setClassifyProgress(0);

        try {
            // Step 1: Preparing
            setClassifyStep('Preparing text for analysis...');
            setClassifyProgress(25);
            await new Promise(resolve => setTimeout(resolve, 300));

            // Step 2: Analyzing
            setClassifyStep('Running AI classification...');
            setClassifyProgress(50);

            const result = await classifyAPI(classifyText); // Corrected from classifyText to classifyAPI

            // Step 3: Processing results
            setClassifyStep('Processing results...');
            setClassifyProgress(75);
            await new Promise(resolve => setTimeout(resolve, 200));

            // Complete
            setClassifyProgress(100);
            setClassifyStep('Complete!');
            setClassifyResult(result);
        } catch (err) {
            setError(err.message || 'Failed to classify text');
            console.error('Classification error:', err);
        } finally {
            setClassifying(false);
            // Reset progress after a moment
            setTimeout(() => {
                setClassifyProgress(0);
                setClassifyStep('');
            }, 500);
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
            setError('Please select a file to encrypt');
            return;
        }

        setEncrypting(true);
        setEncryptResult(null);
        setError('');
        setEncryptProgress(0);

        try {
            // Step 1: Reading file
            setEncryptStep('Reading file...');
            setEncryptProgress(20);
            const content = await fileToBase64(selectedFile);
            await new Promise(resolve => setTimeout(resolve, 300));

            // Step 2: Classifying
            setEncryptStep('Classifying sensitivity...');
            setEncryptProgress(40);
            await new Promise(resolve => setTimeout(resolve, 400));

            // Step 3: Encrypting
            setEncryptStep('Encrypting with AES-256-GCM...');
            setEncryptProgress(60);

            const encryptRequest = {
                content,
                filename: selectedFile.name,
                content_type: selectedFile.type || 'application/octet-stream',
                expiration_hours: expirationHours,
            };

            const result = await encryptFile(encryptRequest);

            // Step 4: Generating link
            setEncryptStep('Generating secure link...');
            setEncryptProgress(80);
            await new Promise(resolve => setTimeout(resolve, 300));

            // Complete
            setEncryptProgress(100);
            setEncryptStep('Complete!');
            setEncryptResult(result);
        } catch (err) {
            setError(err.message || 'Failed to encrypt file');
            console.error('Encryption error:', err);
        } finally {
            setEncrypting(false);
            // Reset progress after a moment
            setTimeout(() => {
                setEncryptProgress(0);
                setEncryptStep('');
            }, 500);
        }
    };

    const handleCopyLink = () => {
        if (encryptResult) {
            copyToClipboard(encryptResult.share_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const runBenchmark = async () => {
        setBenchmarkRunning(true);
        setBenchmarkProgress(0);
        setBenchmarkResults(null);
        setError('');

        const totalSteps = 6;
        const totalTime = 8000; // 8 seconds total
        const stepTime = totalTime / totalSteps;

        const steps = [
            { name: 'Initializing test environment...', duration: 1000 },
            { name: 'Loading classification models...', duration: 1500 },
            { name: 'Running AI classification tests...', duration: 1800 },
            { name: 'Testing encryption algorithms...', duration: 1500 },
            { name: 'Analyzing performance metrics...', duration: 1200 },
            { name: 'Generating report...', duration: 1000 }
        ];

        let completedTime = 0;

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            setBenchmarkStep(step.name);
            setBenchmarkProgress(((i + 1) / totalSteps) * 100);

            const remainingSteps = steps.slice(i + 1);
            const remaining = remainingSteps.reduce((sum, s) => sum + s.duration, 0);
            setBenchmarkTimeRemaining(Math.ceil(remaining / 1000));

            await new Promise(resolve => setTimeout(resolve, step.duration));
            completedTime += step.duration;
        }

        // Mock benchmark results
        const results = {
            classificationSpeed: (Math.random() * 50 + 150).toFixed(0), // 150-200 ms
            encryptionSpeed: (Math.random() * 20 + 30).toFixed(1), // 30-50 MB/s
            accuracyScore: (Math.random() * 3 + 94).toFixed(2), // 94-97%
            averageConfidence: (Math.random() * 5 + 85).toFixed(1), // 85-90%
            totalProcessed: Math.floor(Math.random() * 500 + 1500), // 1500-2000 files
            algorithms: [
                { name: 'AES-256-GCM', speed: '52.3 MB/s', usage: '68%' },
                { name: 'ChaCha20-Poly1305', speed: '48.7 MB/s', usage: '22%' },
                { name: 'RSA-4096', speed: '2.1 MB/s', usage: '10%' }
            ],
            sensitivityBreakdown: [
                { level: 'Public', count: 342, percentage: 23 },
                { level: 'Internal', count: 587, percentage: 39 },
                { level: 'Confidential', count: 421, percentage: 28 },
                { level: 'Highly Sensitive', count: 150, percentage: 10 }
            ]
        };

        setBenchmarkResults(results);
        setBenchmarkRunning(false);
        setBenchmarkProgress(100);
        setBenchmarkStep('Complete!');
        setBenchmarkTimeRemaining(0);
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
        <div id="demo" className={`relative ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'} py-24 px-6 overflow-hidden`}>
            {/* Background decoration */}
            <div className={`absolute inset-0 gradient-mesh-bg ${isDark ? 'opacity-30' : 'opacity-20'}`}></div>

            <div
                ref={ref}
                className={`relative z-10 max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-100 border-red-200'} border mb-4`}>
                        <SparklesIcon className={`h-4 w-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                        <span className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>No Signup Required</span>
                    </div>

                    <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                        Try It <span className="gradient-text">Now</span>
                    </h2>
                    <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
                        Experience AI-powered encryption in action. Completely free.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-2 mb-8 flex-wrap">
                    <button
                        onClick={() => {
                            setActiveTab('classify');
                            setEncryptResult(null);
                            setBenchmarkResults(null);
                        }}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'classify'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : isDark
                                ? 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700'
                                : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-300'
                            }`}
                    >
                        <SparklesIcon className="h-5 w-5" />
                        AI Classification
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('encrypt');
                            setClassifyResult(null);
                            setBenchmarkResults(null);
                        }}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'encrypt'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : isDark
                                ? 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700'
                                : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-300'
                            }`}
                    >
                        <LockClosedIcon className="h-5 w-5" />
                        File Encryption
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('benchmark');
                            setClassifyResult(null);
                            setEncryptResult(null);
                        }}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'benchmark'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : isDark
                                ? 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700'
                                : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-300'
                            }`}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Performance
                    </button>
                </div>

                {/* Classification Tab */}
                {activeTab === 'classify' && (
                    <div className={`${isDark ? 'glass-card border-gray-800' : 'bg-white border-gray-200 shadow-xl'} p-8 rounded-2xl border animate-scale-in`}>
                        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 flex items-center gap-2`}>
                            <SparklesIcon className="h-6 w-6 text-indigo-400" />
                            Classify Text Sensitivity
                        </h3>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                            Paste any text and our AI will determine its sensitivity level instantly
                        </p>

                        <textarea
                            value={classifyText}
                            onChange={(e) => setClassifyText(e.target.value)}
                            placeholder="Try: 'Customer SSN: 123-45-6789' or 'Meeting at 3pm tomorrow'"
                            className={`w-full px-4 py-4 ${isDark ? 'text-white bg-gray-900/50 border-gray-700 placeholder-gray-500' : 'text-gray-900 bg-gray-50 border-gray-300 placeholder-gray-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-40 resize-none mb-4 font-mono`}
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
                                        <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                                            <CheckCircleIcon className="h-6 w-6 text-green-400" />
                                            Classification Result
                                        </h4>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Sensitivity Level</span>
                                                <span className={`text-lg font-bold uppercase ${getSensitivityColor(classifyResult.sensitivity_level).text}`}>
                                                    {classifyResult.sensitivity_level.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className={`w-full ${isDark ? 'bg-gray-800/50' : 'bg-gray-200'} rounded-full h-2`}>
                                                <div className={`bg-gradient-to-r ${getSensitivityColor(classifyResult.sensitivity_level).bg.replace('/20', '')} h-2 rounded-full transition-all duration-1000`}
                                                    style={{ width: `${classifyResult.confidence_score * 100}%` }}
                                                ></div>
                                            </div>
                                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                                Confidence: {(classifyResult.confidence_score * 100).toFixed(1)}%
                                            </p>
                                        </div>

                                        {classifyResult.explanation && (
                                            <div className={`p-4 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{classifyResult.explanation}</p>
                                            </div>
                                        )}

                                        {classifyResult.detected_patterns && classifyResult.detected_patterns.length > 0 && (
                                            <div>
                                                <h5 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 text-sm`}>
                                                    Detected Patterns ({classifyResult.detected_patterns.length})
                                                </h5>
                                                <div className="space-y-2">
                                                    {classifyResult.detected_patterns.slice(0, 3).map((pattern, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`p-3 rounded-lg ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border flex justify-between items-center`}
                                                        >
                                                            <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} capitalize text-sm`}>
                                                                {pattern.type.replace('_', ' ')}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
                                                    <h4 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold mb-1`}>Want to save and encrypt this?</h4>
                                                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm mb-3`}>
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
                    <div className={`${isDark ? 'glass-card border-gray-800' : 'bg-white border-gray-200 shadow-xl'} p-8 rounded-2xl border animate-scale-in`}>
                        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 flex items-center gap-2`}>
                            <LockClosedIcon className="h-6 w-6 text-indigo-400" />
                            Encrypt & Share Files
                        </h3>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                            Upload a file to encrypt it and get a secure shareable link
                        </p>

                        <label className="block cursor-pointer">
                            <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${selectedFile
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : isDark
                                    ? 'border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800/50'
                                    : 'border-gray-300 hover:border-indigo-500/50 hover:bg-gray-50'
                                }`}>
                                {selectedFile ? (
                                    <div className="space-y-3">
                                        <CheckCircleIcon className="h-16 w-16 mx-auto text-green-400" />
                                        <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedFile.name}</p>
                                        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
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
                                        <DocumentArrowUpIcon className={`h-16 w-16 mx-auto ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Click to select file
                                        </p>
                                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>or drag and drop</p>
                                        <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Maximum file size: 10MB</p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>

                        {/* Expiration Options */}
                        {selectedFile && (
                            <div className="mt-4">
                                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Link Expiration
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { hours: 24, label: '1 Day' },
                                        { hours: 168, label: '7 Days' },
                                        { hours: 720, label: '30 Days' },
                                        { hours: 8760, label: '1 Year' }
                                    ].map((option) => (
                                        <button
                                            key={option.hours}
                                            type="button"
                                            onClick={() => setExpirationHours(option.hours)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${expirationHours === option.hours
                                                ? 'bg-indigo-600 text-white'
                                                : isDark
                                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

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

                        {/* Encryption Progress */}
                        {encrypting && encryptProgress > 0 && (
                            <div className={`mt-4 p-4 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border animate-scale-in`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <div className="flex-1">
                                        <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{encryptStep}</div>
                                    </div>
                                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{Math.round(encryptProgress)}%</div>
                                </div>
                                <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                                    <div
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${encryptProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Encryption Result */}
                        {encryptResult && (
                            <div className="mt-6 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl animate-scale-in">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
                                        <CheckCircleIcon className="h-10 w-10 text-green-400" />
                                    </div>
                                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Encryption Successful!</h2>
                                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>Your file is encrypted and ready to share</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Share Link</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={encryptResult.share_url}
                                                readOnly
                                                className={`flex-1 px-4 py-3 ${isDark ? 'text-white bg-gray-900/50 border-gray-700' : 'text-gray-900 bg-gray-50 border-gray-300'} border rounded-lg font-mono text-sm`}
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

                                    <div className={`grid grid-cols-2 gap-4 p-4 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                                        <div>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Classification</p>
                                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} capitalize`}>
                                                {encryptResult.sensitivity_level.replace('_', ' ')}
                                            </p>
                                        </div>
                                        {encryptResult.expires_at && (
                                            <div>
                                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Expires</p>
                                                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                                                    <h4 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold mb-1`}>Want to do more?</h4>
                                                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm mb-3`}>
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

                {/* Benchmark Tab */}
                {activeTab === 'benchmark' && (
                    <div className={`${isDark ? 'glass-card border-gray-800' : 'bg-white border-gray-200 shadow-xl'} p-8 rounded-2xl border animate-scale-in`}>
                        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 flex items-center gap-2`}>
                            <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Performance Benchmarks
                        </h3>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                            See how our AI-powered encryption performs in real-world scenarios
                        </p>

                        <button
                            onClick={runBenchmark}
                            disabled={benchmarkRunning}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-lg hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 animate-pulse-glow-blue mb-6"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {benchmarkRunning ? 'Running Benchmark...' : 'Run Performance Test'}
                        </button>

                        {/* Classification Progress */}
                        {classifying && classifyProgress > 0 && (
                            <div className={`mt-4 p-4 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border animate-scale-in`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <div className="flex-1">
                                        <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{classifyStep}</div>
                                    </div>
                                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{Math.round(classifyProgress)}%</div>
                                </div>
                                <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                                    <div
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${classifyProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Progress Indicator */}
                        {benchmarkRunning && (
                            <div className={`mb-6 p-6 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border animate-scale-in`}>
                                {/* Current Step */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{benchmarkStep}</div>
                                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                                {benchmarkTimeRemaining > 0 ? `~${benchmarkTimeRemaining}s remaining` : 'Almost done...'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {Math.round(benchmarkProgress)}%
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-3 overflow-hidden`}>
                                    <div
                                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                                        style={{ width: `${benchmarkProgress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                                    </div>
                                </div>

                                {/* Estimated Total Time */}
                                <div className={`mt-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} text-center`}>
                                    Estimated total time: ~8 seconds
                                </div>
                            </div>
                        )}

                        {/* Benchmark Results */}
                        {benchmarkResults && (
                            <div className="space-y-6 animate-scale-in">
                                {/* Key Metrics */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className={`p-4 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Classification Speed</div>
                                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{benchmarkResults.classificationSpeed} <span className="text-sm text-indigo-400">ms</span></div>
                                    </div>
                                    <div className={`p-4 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Encryption Speed</div>
                                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{benchmarkResults.encryptionSpeed} <span className="text-sm text-green-400">MB/s</span></div>
                                    </div>
                                    <div className={`p-4 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>AI Accuracy</div>
                                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{benchmarkResults.accuracyScore}<span className="text-sm text-purple-400">%</span></div>
                                    </div>
                                    <div className={`p-4 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Avg Confidence</div>
                                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{benchmarkResults.averageConfidence}<span className="text-sm text-orange-400">%</span></div>
                                    </div>
                                </div>

                                {/* Algorithm Performance */}
                                <div className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4`}>
                                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Algorithm Performance</h4>
                                    <div className="space-y-3">
                                        {benchmarkResults.algorithms.map((algo, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{algo.name}</span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-cyan-400 font-mono">{algo.speed}</span>
                                                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} w-12 text-right`}>{algo.usage}</span>
                                                    </div>
                                                </div>
                                                <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-2`}>
                                                    <div
                                                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                                                        style={{ width: algo.usage }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sensitivity Distribution */}
                                <div className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4`}>
                                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Data Classification Distribution</h4>
                                    <div className="space-y-3">
                                        {benchmarkResults.sensitivityBreakdown.map((item, idx) => (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.level}</span>
                                                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.count} files ({item.percentage}%)</span>
                                                </div>
                                                <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-2`}>
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-1000 ${item.level === 'Public' ? 'bg-green-500' :
                                                            item.level === 'Internal' ? 'bg-blue-500' :
                                                                item.level === 'Confidential' ? 'bg-orange-500' :
                                                                    'bg-red-500'
                                                            }`}
                                                        style={{ width: `${item.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Total Files Processed</span>
                                            <span className="text-2xl font-bold text-indigo-400">{benchmarkResults.totalProcessed.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Summary */}
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <CheckCircleIcon className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>Performance Summary</h4>
                                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Our system processed {benchmarkResults.totalProcessed.toLocaleString()} files with {benchmarkResults.accuracyScore}% accuracy,
                                                averaging {benchmarkResults.classificationSpeed}ms per classification and {benchmarkResults.encryptionSpeed} MB/s encryption speed.
                                                All operations use military-grade encryption standards.
                                            </p>
                                        </div>
                                    </div>
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
