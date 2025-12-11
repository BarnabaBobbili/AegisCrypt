import React, { useEffect, useState } from 'react';
import { policyService } from '../services/policies';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

const Policies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const data = await policyService.getPolicies();
            setPolicies(data);
        } catch (error) {
            console.error('Failed to fetch policies:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Encryption Policies</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {policies.map((policy) => (
                        <Card key={policy.id} title={policy.sensitivity_level.replace('_', ' ').toUpperCase()} glass>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Encryption</span>
                                    <span className="text-white font-medium">{policy.encryption_algorithm}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Key Size</span>
                                    <span className="text-white font-medium">{policy.key_size} bits</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Hash Algorithm</span>
                                    <span className="text-white font-medium">{policy.hash_algorithm}</span>
                                </div>
                                {policy.asymmetric_algorithm && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Asymmetric</span>
                                        <span className="text-white font-medium">{policy.asymmetric_algorithm}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Signature Required</span>
                                    <span className={`font-medium ${policy.signature_required ? 'text-green-500' : 'text-slate-500'}`}>
                                        {policy.signature_required ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">MFA Requirement</span>
                                    <span className="text-white font-medium capitalize">{policy.mfa_required}</span>
                                </div>
                                {policy.description && (
                                    <div className="mt-4 pt-4 border-t border-slate-700">
                                        <p className="text-sm text-slate-400">{policy.description}</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Policies;
