/**
 * Export Service
 * 
 * API calls for exporting data and generating reports
 */

import api from './api';

const exportService = {
    /**
     * Export audit logs to CSV
     */
    async exportAuditLogsCSV(startDate = null, endDate = null) {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const response = await api.get('/api/v1/export/audit-logs/csv', {
            params,
            responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    /**
     * Get compliance report
     */
    async getComplianceReport(days = 30) {
        const response = await api.get('/api/v1/export/compliance-report', {
            params: { days }
        });
        return response.data;
    },

    /**
     * Export specific data item
     */
    async exportDataItem(dataId) {
        const response = await api.get(`/api/v1/export/data/${dataId}`);
        return response.data;
    }
};

export default exportService;
