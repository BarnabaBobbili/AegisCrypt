/**
 * Helper Utilities
 */

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Format large numbers with K, M suffixes
 */
export const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

/**
 * Get sensitivity level display name
 */
export const getSensitivityDisplay = (level) => {
    const displays = {
        'public': 'Public',
        'internal': 'Internal',
        'confidential': 'Confidential',
        'highly_sensitive': 'Highly Sensitive',
    };
    return displays[level] || level;
};

/**
 * Get risk level from score
 */
export const getRiskLevel = (score) => {
    if (score <= 30) return 'low';
    if (score <= 60) return 'medium';
    return 'high';
};

/**
 * Get risk color classes
 */
export const getRiskColor = (riskLevel) => {
    const colors = {
        low: 'text-green-500 bg-green-500/10',
        medium: 'text-orange-500 bg-orange-500/10',
        high: 'text-red-500 bg-red-500/10',
    };
    return colors[riskLevel] || colors.low;
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

/**
 * Download text as file
 */
export const downloadAsFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
