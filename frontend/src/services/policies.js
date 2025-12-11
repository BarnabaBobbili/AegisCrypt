/**
 * Policies Service
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const policyService = {
    /**
     * Get all policies
     */
    getPolicies: async () => {
        const response = await api.get(API_ENDPOINTS.POLICIES);
        return response.data;
    },

    /**
     * Get specific policy
     */
    getPolicy: async (sensitivityLevel) => {
        const response = await api.get(`${API_ENDPOINTS.POLICIES}/${sensitivityLevel}`);
        return response.data;
    },
};
