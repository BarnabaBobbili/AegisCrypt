import React, { useEffect, useState } from 'react';
import { policyService } from '../services/policies';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import { ShieldCheckIcon, PlusIcon } from '@heroicons/react/24/outline';

const Policies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const data = await policyService.getPolicies();
            setPolicies(data);
            setError('');
        } catch (error) {
            console.error('Failed to fetch policies:', error);
            setError('Failed to load policies. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Encryption Policies</h1>
                            <p className="text-gray-600">Manage security policies for different sensitivity levels</p>
                        </div>
                        <button className="btn-primary">
                            <PlusIcon className="h-5 w-5" />
                            Create Policy
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Policies Grid */}
                {policies.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                        <ShieldCheckIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Policies Found</h3>
                        <p className="text-gray-600 mb-6">Get started by creating your first encryption policy</p>
                        <button
                            onClick={() => alert('Create policy feature coming soon!')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Create First Policy
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {policies.map((policy) => (
                            <div key={policy.id} className="card p-6 hover:shadow-lg transition-shadow">
                                {/* Policy Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 capitalize">
                                            {policy.sensitivity_level.replace('_', ' ')}
                                        </h3>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${policy.sensitivity_level === 'public' ? 'bg-green-100 text-green-800' :
                                            policy.sensitivity_level === 'internal' ? 'bg-blue-100 text-blue-800' :
                                                policy.sensitivity_level === 'confidential' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {policy.sensitivity_level}
                                        </span>
                                    </div>
                                    <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                                </div>

                                {/* Policy Details */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Encryption</span>
                                        <span className="text-sm font-medium text-gray-900">{policy.encryption_algorithm}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Key Size</span>
                                        <span className="text-sm font-medium text-gray-900">{policy.key_size} bits</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Hash Algorithm</span>
                                        <span className="text-sm font-medium text-gray-900">{policy.hash_algorithm}</span>
                                    </div>
                                    {policy.asymmetric_algorithm && (
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-600">Asymmetric</span>
                                            <span className="text-sm font-medium text-gray-900">{policy.asymmetric_algorithm}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Signature Required</span>
                                        <span className={`text-sm font-medium ${policy.signature_required ? 'text-green-600' : 'text-gray-400'}`}>
                                            {policy.signature_required ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-gray-600">MFA Requirement</span>
                                        <span className="text-sm font-medium text-gray-900 capitalize">{policy.mfa_required}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                {policy.description && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">{policy.description}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                                    <button className="btn-secondary text-sm py-2 flex-1">Edit</button>
                                    <button className="btn-ghost text-sm py-2 px-4 text-red-600 hover:bg-red-50">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Policies;
