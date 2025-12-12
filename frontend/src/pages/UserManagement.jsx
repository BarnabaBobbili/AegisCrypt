import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/admin';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { formatDate } from '../utils/helpers';
import {
    UserPlusIcon,
    PencilIcon,
    TrashIcon,
    ShieldCheckIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user',
        is_active: true
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            if (error.response?.status === 403) {
                alert('Access denied. Admin privileges required.');
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await adminService.updateUser(editingUser.id, formData);
            } else {
                await adminService.createUser(formData);
            }
            resetForm();
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.detail || 'Operation failed');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await adminService.deleteUser(userId);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to delete user');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminService.updateUserRole(userId, newRole);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to update role');
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            role: 'user',
            is_active: true
        });
        setEditingUser(null);
        setShowCreateModal(false);
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '',
            role: user.role,
            is_active: user.is_active
        });
        setShowCreateModal(true);
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <Button
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                        icon={UserPlusIcon}
                    >
                        Create User
                    </Button>
                </div>

                {/* User Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left p-4 text-gray-900">ID</th>
                                    <th className="text-left p-4 text-gray-900">Username</th>
                                    <th className="text-left p-4 text-gray-900">Email</th>
                                    <th className="text-left p-4 text-gray-900">Role</th>
                                    <th className="text-left p-4 text-gray-900">Status</th>
                                    <th className="text-left p-4 text-gray-900">Created</th>
                                    <th className="text-right p-4 text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                        <td className="p-4 text-gray-900">{user.id}</td>
                                        <td className="p-4 text-gray-900">{user.username}</td>
                                        <td className="p-4 text-gray-900">{user.email}</td>
                                        <td className="p-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="bg-white text-gray-900 rounded px-2 py-1 text-sm border border-gray-300 focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="manager">Manager</option>
                                                <option value="user">User</option>
                                                <option value="guest">Guest</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                                }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-900 text-sm">{formatDate(user.created_at)}</td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => startEdit(user)}
                                                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Create/Edit Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <Card className="max-w-md w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingUser ? 'Edit User' : 'Create New User'}
                                </h2>
                                <button onClick={resetForm} className="text-slate-400 hover:text-white">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
                                        required
                                        disabled={editingUser}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Password {editingUser && '(leave empty to keep current)'}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
                                        required={!editingUser}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Role
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="user">User</option>
                                        <option value="guest">Guest</option>
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <label className="text-sm text-gray-900">
                                        Active User
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" variant="primary" className="flex-1">
                                        {editingUser ? 'Update User' : 'Create User'}
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={resetForm} className="flex-1">
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

export default UserManagement;
