import React, { useState } from 'react';
import { classificationService } from '../services/classification';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { getSensitivityDisplay } from '../utils/helpers';

const Classification = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleClassify = async () => {
        if (!text.trim()) return;

        setLoading(true);
        try {
            const data = await classificationService.classify(text, false);
            setResult(data);
        } catch (error) {
            console.error('Classification failed:', error);
            alert('Classification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Data Classification</h1>

                <Card title="Enter Data to Classify" className="mb-6">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text to classify (e.g., 'This document contains credit card numbers')"
                        className="w-full h-40 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleClassify} loading={loading} disabled={!text.trim()}>
                            Classify Data
                        </Button>
                    </div>
                </Card>

                {result && (
                    <Card title="Classification Result" glass>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-slate-400 text-sm mb-2">Sensitivity Level</p>
                                <div className={`inline-flex px-4 py-2 rounded-lg font-semibold ${result.sensitivity_level === 'highly_sensitive' ? 'bg-red-500/20 text-red-500' :
                                        result.sensitivity_level === 'confidential' ? 'bg-orange-500/20 text-orange-500' :
                                            result.sensitivity_level === 'internal' ? 'bg-blue-500/20 text-blue-500' :
                                                'bg-green-500/20 text-green-500'
                                    }`}>
                                    {getSensitivityDisplay(result.sensitivity_level)}
                                </div>
                            </div>

                            <div>
                                <p className="text-slate-400 text-sm mb-2">Confidence Score</p>
                                <div className="flex items-center space-x-3">
                                    <div className="flex-1 bg-slate-700 rounded-full h-3">
                                        <div
                                            className="bg-blue-500 h-3 rounded-full transition-all"
                                            style={{ width: `${(result.confidence_score * 100).toFixed(0)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-white font-semibold">
                                        {(result.confidence_score * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                            <p className="text-slate-400 text-sm mb-2">Applied Policy</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Encryption:</span>
                                    <span className="text-white font-medium">{result.policy.encryption_algorithm}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Hash:</span>
                                    <span className="text-white font-medium">{result.policy.hash_algorithm}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Signature Required:</span>
                                    <span className="text-white font-medium">{result.policy.signature_required ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">MFA:</span>
                                    <span className="text-white font-medium capitalize">{result.policy.mfa_required}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Classification;
