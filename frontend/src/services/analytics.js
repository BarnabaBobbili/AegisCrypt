/**
 * Analytics Service
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const analyticsService = {
    /**
     * Get audit logs
     */
    getAuditLogs: async (params = {}) => {
        const response = await api.get(API_ENDPOINTS.AUDIT_LOGS, { params });
        return response.data;
    },

    /**
     * Get statistics
     */
    getStats: async (days = 7) => {
        const response = await api.get(API_ENDPOINTS.STATS, {
            params: { days },
        });
        return response.data;
    },

    /**
     * Get security alerts
     */
    getAlerts: async (limit = 20) => {
        const response = await api.get(API_ENDPOINTS.ALERTS, {
            params: { limit },
        });
        return response.data;
    },

    /**
     * Get high-risk actions
     */
    getHighRisk: async (threshold = 61, limit = 50) => {
        const response = await api.get(API_ENDPOINTS.HIGH_RISK, {
            params: { threshold, limit },
        });
        return response.data;
    },
};
