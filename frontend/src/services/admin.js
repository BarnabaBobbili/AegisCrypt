/**
 * Admin Service
 * 
 * API calls for admin operations including user management and system statistics
 */

import api from './api';

const adminService = {
    /**
     * Get all users (Admin only)
     */
    async getUsers() {
        const response = await api.get('/api/v1/admin/users');
        return response.data;
    },

    /**
     * Create a new user (Admin only)
     */
    async createUser(userData) {
        const response = await api.post('/api/v1/admin/users', userData);
        return response.data;
    },

    /**
     * Update user details (Admin only)
     */
    async updateUser(userId, userData) {
        const response = await api.put(`/api/v1/admin/users/${userId}`, userData);
        return response.data;
    },

    /**
     * Update user role (Admin only)
     */
    async updateUserRole(userId, role) {
        const response = await api.put(`/api/v1/admin/users/${userId}/role`, { role });
        return response.data;
    },

    /**
     * Delete a user (Admin only)
     */
    async deleteUser(userId) {
        await api.delete(`/api/v1/admin/users/${userId}`);
    },

    /**
     * Get system statistics (Admin only)
     */
    async getSystemStats() {
        const response = await api.get('/api/v1/admin/stats');
        return response.data;
    }
};

export default adminService;
