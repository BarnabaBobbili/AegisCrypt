import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getShareInfo, decryptShare } from '../services/public';
import { downloadBase64File } from '../services/public';
import {
    LockClosedIcon,
    ArrowDownTrayIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    DocumentIcon,
} from '@heroicons/react/24/outline';

const PublicDecrypt = () => {
    const { token } = useParams();
    const [shareInfo, setShareInfo] = useState(null);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [decrypting, setDecrypting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadShareInfo();
    }, [token]);

    const loadShareInfo = async () => {
        try {
            const info = await getShareInfo(token);
            setShareInfo(info);
            setError('');
        } catch (err) {
            setError('Share link not found or has expired');
        } finally {
            setLoading(false);
        }
    };

    const handleDecrypt = async () => {
        setDecrypting(true);
        setError('');

        try {
            const result = await decryptShare(token, password || null);

            // Download file
            downloadBase64File(
                result.content,
                result.filename,
                result.content_type
            );

            setSuccess(true);
            setTimeout(() => {
                loadShareInfo(); // Refresh to show updated download count
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Decryption failed. Please check your password and try again.');
        } finally {
            setDecrypting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-gray-600">Loading share information...</p>
                </div>
            </div>
        );
    }

    if (error && !shareInfo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="card p-8 max-w-md w-full text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                        <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Not Found</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <a href="/encrypt" className="btn-primary inline-flex">
                        Encrypt a New File
                    </a>
                </div>
            </div>
        );
    }

    const isExpiringSoon = shareInfo?.expires_at &&
        new Date(shareInfo.expires_at) - new Date() < 24 * 60 * 60 * 1000;

    const isNearingLimit = shareInfo?.max_downloads &&
        shareInfo.download_count >= shareInfo.max_downloads - 2;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="container mx-auto max-w-2xl">
                {/* Header */}
                <div className="text-center mb-10 animate-fade-in">
                    <div className="flex items-center justify-center mb-4">
                        <ShieldCheckIcon className="h-12 w-12 text-primary-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Secure File Access
                    </h1>
                    <p className="text-lg text-gray-600">
                        Download your encrypted file securely
                    </p>
                </div>

                {success && (
                    <div className="card p-6 mb-6 bg-green-50 border-green-200 animate-fade-in">
                        <div className="flex items-start gap-3">
                            <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-green-900 mb-1">Download Started!</h3>
                                <p className="text-sm text-green-700">
                                    Your file has been decrypted and should download automatically.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Warnings */}
                {(isExpiringSoon || isNearingLimit) && (
                    <div className="space-y-3 mb-6">
                        {isExpiringSoon && (
                            <div className="card p-4 bg-orange-50 border-orange-200">
                                <div className="flex items-start gap-3">
                                    <ClockIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-orange-900">Expiring Soon</p>
                                        <p className="text-xs text-orange-700 mt-1">
                                            This link expires on {new Date(shareInfo.expires_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {isNearingLimit && (
                            <div className="card p-4 bg-orange-50 border-orange-200">
                                <div className="flex items-start gap-3">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-orange-900">Download Limit Warning</p>
                                        <p className="text-xs text-orange-700 mt-1">
                                            Only {shareInfo.max_downloads - shareInfo.download_count} downloads remaining
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Card */}
                <div className="card p-8 animate-slide-up">
                    {/* File Info */}
                    <div className="mb-8">
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-shrink-0">
                                <DocumentIcon className="h-12 w-12 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                                    {shareInfo?.filename}
                                </h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                    {shareInfo?.file_size && (
                                        <span>{(shareInfo.file_size / 1024).toFixed(2)} KB</span>
                                    )}
                                    {shareInfo?.content_type && (
                                        <span>{shareInfo.content_type}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Created</p>
                            <p className="font-medium text-gray-900 text-sm">
                                {new Date(shareInfo?.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        {shareInfo?.expires_at && (
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Expires</p>
                                <p className="font-medium text-gray-900 text-sm">
                                    {new Date(shareInfo.expires_at).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Downloads</p>
                            <p className="font-medium text-gray-900 text-sm">
                                {shareInfo?.download_count}
                                {shareInfo?.max_downloads && ` / ${shareInfo.max_downloads}`}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <span className={`badge ${shareInfo?.is_available ? 'badge-success' : 'badge-error'
                                }`}>
                                {shareInfo?.is_available ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                    </div>

                    {/* Password Input (if required) */}
                    {shareInfo?.requires_password && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <LockClosedIcon className="h-4 w-4 inline mr-1" />
                                Password Required
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password to decrypt"
                                className="input"
                                onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
                            />
                        </div>
                    )}

                    {/* Error Message */}
                    {error && shareInfo && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Download Button */}
                    <button
                        onClick={handleDecrypt}
                        disabled={decrypting || !shareInfo?.is_available}
                        className="btn-primary w-full py-4 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {decrypting ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Decrypting...
                            </>
                        ) : (
                            <>
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                Download File
                            </>
                        )}
                    </button>

                    {/* Help Text */}
                    <p className="text-xs text-gray-500 text-center mt-4">
                        {shareInfo?.requires_password
                            ? 'Contact the sender if you need the password'
                            : 'File will download automatically after decryption'}
                    </p>
                </div>

                {/* Create Your Own */}
                <div className="text-center mt-8">
                    <a
                        href="/encrypt"
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                        Want to share your own files? Encrypt here →
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PublicDecrypt;
