/**
 * API Configuration and Constants
 */

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',

    // Classification
    CLASSIFY: '/api/v1/classification',

    // Encryption
    ENCRYPT: '/api/v1/encryption/encrypt',
    DECRYPT: '/api/v1/encryption/decrypt',
    DATA_ITEMS: '/api/v1/encryption/data',

    // Policies
    POLICIES: '/api/v1/policies',

    // Analytics
    AUDIT_LOGS: '/api/v1/analytics/audit',
    STATS: '/api/v1/analytics/stats',
    ALERTS: '/api/v1/analytics/alerts',
    HIGH_RISK: '/api/v1/analytics/high-risk',
};

// Sensitivity Levels
export const SENSITIVITY_LEVELS = {
    PUBLIC: 'public',
    INTERNAL: 'internal',
    CONFIDENTIAL: 'confidential',
    HIGHLY_SENSITIVE: 'highly_sensitive',
};

// Sensitivity Level Colors
export const SENSITIVITY_COLORS = {
    [SENSITIVITY_LEVELS.PUBLIC]: {
        bg: 'bg-green-500/10',
        text: 'text-green-500',
        border: 'border-green-500',
    },
    [SENSITIVITY_LEVELS.INTERNAL]: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        border: 'border-blue-500',
    },
    [SENSITIVITY_LEVELS.CONFIDENTIAL]: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-500',
        border: 'border-orange-500',
    },
    [SENSITIVITY_LEVELS.HIGHLY_SENSITIVE]: {
        bg: 'bg-red-500/10',
        text: 'text-red-500',
        border: 'border-red-500',
    },
};

// Risk Levels
export const RISK_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
};

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user',
    GUEST: 'guest',
};

// Local Storage Keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
};
