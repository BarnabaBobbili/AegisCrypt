import React, { useState, useEffect } from 'react';
import { encryptionService } from '../services/encryption';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDate, copyToClipboard } from '../utils/helpers';
import { LockClosedIcon, LockOpenIcon, ClipboardIcon } from '@heroicons/react/24/outline';

const Encryption = () => {
    const [activeTab, setActiveTab] = useState('encrypt');
    const [encryptText, setEncryptText] = useState('');
    const [encryptResult, setEncryptResult] = useState(null);
    const [dataItems, setDataItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [decryptResult, setDecryptResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'decrypt') {
            fetchDataItems();
        }
    }, [activeTab]);

    const fetchDataItems = async () => {
        try {
            const items = await encryptionService.getDataItems();
            setDataItems(items);
        } catch (error) {
            console.error('Failed to fetch data items:', error);
        }
    };

    const handleEncrypt = async () => {
        if (!encryptText.trim()) return;

        setLoading(true);
        try {
            const result = await encryptionService.encrypt(encryptText);
            setEncryptResult(result);
            setEncryptText('');
        } catch (error) {
            console.error('Encryption failed:', error);
            alert('Encryption failed. Please try again.');
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
            alert('Decryption failed. Please try again.');
        } finally {
            setLoading(false);
            setSelectedItem(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Encryption & Decryption</h1>

                {/* Tabs */}
                <div className="flex space-x-2 mb-6">
                    <button
                        onClick={() => setActiveTab('encrypt')}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'encrypt'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        <LockClosedIcon className="h-5 w-5 inline mr-2" />
                        Encrypt
                    </button>
                    <button
                        onClick={() => setActiveTab('decrypt')}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'decrypt'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        <LockOpenIcon className="h-5 w-5 inline mr-2" />
                        Decrypt
                    </button>
                </div>

                {/* Encrypt Tab */}
                {activeTab === 'encrypt' && (
                    <div className="space-y-6">
                        <Card title="Encrypt Data">
                            <textarea
                                value={encryptText}
                                onChange={(e) => setEncryptText(e.target.value)}
                                placeholder="Enter data to encrypt..."
                                className="w-full h-40 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                            <div className="mt-4 flex justify-end">
                                <Button onClick={handleEncrypt} loading={loading} disabled={!encryptText.trim()}>
                                    Encrypt Data
                                </Button>
                            </div>
                        </Card>

                        {encryptResult && (
                            <Card title="Encryption Result" glass>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-slate-400 text-sm">Encrypted Data</p>
                                            <button
                                                onClick={() => copyToClipboard(encryptResult.encrypted_data)}
                                                className="text-blue-500 hover:text-blue-400 text-sm flex items-center"
                                            >
                                                <ClipboardIcon className="h-4 w-4 mr-1" />
                                                Copy
                                            </button>
                                        </div>
                                        <div className="p-3 bg-slate-700 rounded-lg text-white font-mono text-sm break-all">
                                            {encryptResult.encrypted_data.substring(0, 100)}...
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">Algorithm</p>
                                            <p className="text-white">{encryptResult.encryption_algorithm}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">Hash Algorithm</p>
                                            <p className="text-white">{encryptResult.hash_algorithm}</p>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg text-green-500 text-sm">
                                        ✓ Data encrypted and saved successfully (ID: {encryptResult.data_id})
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* Decrypt Tab */}
                {activeTab === 'decrypt' && (
                    <div className="space-y-6">
                        <Card title="Select Data to Decrypt">
                            {dataItems.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    No encrypted data available
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {dataItems.map((item) => (
                                        <div key={item.id} className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white font-medium">Data Item #{item.id}</p>
                                                    <p className="text-sm text-slate-400">{formatDate(item.created_at)}</p>
                                                </div>
                                                <Button
                                                    onClick={() => handleDecrypt(item.id)}
                                                    loading={loading && selectedItem === item.id}
                                                    size="sm"
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
                            <Card title="Decryption Result" glass>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-slate-400 text-sm mb-2">Decrypted Text</p>
                                        <div className="p-4 bg-slate-700 rounded-lg text-white">
                                            {decryptResult.decrypted_text}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-slate-400">Hash Verified:</span>
                                            <span className={decryptResult.hash_verified ? 'text-green-500' : 'text-red-500'}>
                                                {decryptResult.hash_verified ? '✓ Yes' : '✗ No'}
                                            </span>
                                        </div>
                                        {decryptResult.signature_verified !== null && (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-slate-400">Signature Verified:</span>
                                                <span className={decryptResult.signature_verified ? 'text-green-500' : 'text-red-500'}>
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
