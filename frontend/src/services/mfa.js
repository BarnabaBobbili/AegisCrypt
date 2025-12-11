/**
 * MFA Service
 * 
 * API calls for multi-factor authentication operations
 */

import api from './api';

const mfaService = {
    /**
     * Enroll in MFA (get QR code and backup codes)
     */
    async enrollMFA() {
        const response = await api.post('/api/v1/auth/mfa/enroll');
        return response.data;
    },

    /**
     * Verify TOTP code to complete enrollment
     */
    async verifyEnrollment(code) {
        const response = await api.post('/api/v1/auth/mfa/verify', null, {
            params: { code }
        });
        return response.data;
    },

    /**
     * Verify MFA code during login
     */
    async verifyLoginMFA(username, code) {
        const response = await api.post('/api/v1/auth/mfa/login-verify', null, {
            params: { username, code }
        });
        return response.data;
    },

    /**
     * Disable MFA
     */
    async disableMFA(password) {
        const response = await api.post('/api/v1/auth/mfa/disable', null, {
            params: { password }
        });
        return response.data;
    },

    /**
     * Get MFA status
     */
    async getMFAStatus() {
        const response = await api.get('/api/v1/auth/mfa/status');
        return response.data;
    }
};

export default mfaService;
