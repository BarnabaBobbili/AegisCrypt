/**
 * Authentication Service
 */

import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

export const authService = {
    /**
     * Login user
     */
    login: async (username, password) => {
        const response = await api.post(API_ENDPOINTS.LOGIN, {
            username,
            password,
        });

        const { access_token, refresh_token } = response.data;

        // Store tokens
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);

        // Get user info
        const userResponse = await api.get(API_ENDPOINTS.ME);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userResponse.data));

        return userResponse.data;
    },

    /**
     * Register new user
     */
    register: async (username, email, password) => {
        const response = await api.post(API_ENDPOINTS.REGISTER, {
            username,
            email,
            password,
        });
        return response.data;
    },

    /**
     * Logout user
     */
    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    },

    /**
     * Get current user
     */
    getCurrentUser: async () => {
        const response = await api.get(API_ENDPOINTS.ME);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
        return response.data;
    },

    /**
     * Get stored user
     */
    getStoredUser: () => {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => {
        return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },
};
