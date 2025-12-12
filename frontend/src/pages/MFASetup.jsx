import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mfaService from '../services/mfa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { ShieldCheckIcon, KeyIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

const MFASetup = () => {
    const [loading, setLoading] = useState(false);
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleEnroll = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await mfaService.enrollMFA();
            setEnrollmentData(data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to enroll in MFA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await mfaService.verifyEnrollment(verificationCode);
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    if (loading && !enrollmentData) {
        return <Loading />;
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full text-center">
                    <ShieldCheckIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">MFA Enabled!</h1>
                    <p className="text-slate-300">Your account is now protected with two-factor authentication.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Enable Multi-Factor Authentication</h1>

                {!enrollmentData ? (
                    <Card>
                        <ShieldCheckIcon className="h-12 w-12 text-blue-500 mb-4" />
                        <h2 className="text-xl font-bold text-white mb-4">Secure Your Account</h2>
                        <p className="text-slate-300 mb-6">
                            Add an extra layer of security to your account with Time-based One-Time Passwords (TOTP).
                        </p>
                        <ul className="text-slate-300 text-sm mb-6 space-y-2 text-left">
                            <li>✓ Compatible with Google Authenticator, Authy, etc.</li>
                            <li>✓ Protects against unauthorized access</li>
                            <li>✓ Backup codes for recovery</li>
                        </ul>
                        <Button onClick={handleEnroll} loading={loading}>
                            Enable MFA
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* QR Code */}
                        <Card>
                            <h2 className="text-xl font-bold text-white mb-4">Step 1: Scan QR Code</h2>
                            <p className="text-slate-300 mb-4">
                                Open your authenticator app and scan this QR code:
                            </p>
                            <div className="bg-white p-4 rounded-lg inline-block">
                                <img src={enrollmentData.qr_code} alt="MFA QR Code" className="w-64 h-64" />
                            </div>
                            <p className="text-slate-400 text-sm mt-4">
                                Can't scan? Enter this secret manually:
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <code className="bg-slate-800 text-green-400 px-4 py-2 rounded font-mono text-sm">
                                    {enrollmentData.secret}
                                </code>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => copyToClipboard(enrollmentData.secret)}
                                    icon={ClipboardDocumentIcon}
                                >
                                    Copy
                                </Button>
                            </div>
                        </Card>

                        {/* Backup Codes */}
                        <Card>
                            <h2 className="text-xl font-bold text-white mb-4">Step 2: Save Backup Codes</h2>
                            <p className="text-slate-300 mb-4">
                                Store these codes safely. You can use them if you lose access to your authenticator app.
                            </p>
                            <div className="bg-slate-800 p-4 rounded-lg grid grid-cols-2 gap-2 text-sm font-mono">
                                {enrollmentData.backup_codes.map((code, idx) => (
                                    <div key={idx} className="text-green-400">{code}</div>
                                ))}
                            </div>
                            <Button
                                variant="secondary"
                                className="mt-4"
                                onClick={() => copyToClipboard(enrollmentData.backup_codes.join('\n'))}
                                icon={ClipboardDocumentIcon}
                            >
                                Copy All Codes
                            </Button>
                        </Card>

                        {/* Verification */}
                        <Card>
                            <h2 className="text-xl font-bold text-white mb-4">Step 3: Verify Setup</h2>
                            <p className="text-slate-300 mb-4">
                                Enter the 6-digit code from your authenticator app:
                            </p>
                            <form onSubmit={handleVerify} className="space-y-4">
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full px-4 py-3 bg-slate-800 text-white text-center text-2xl font-mono rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
                                    maxLength="6"
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-red-500 text-sm">{error}</p>
                                )}
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex-1"
                                        loading={loading}
                                        disabled={verificationCode.length !== 6}
                                    >
                                        Verify & Enable MFA
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MFASetup;
