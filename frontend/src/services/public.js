/**
 * Public API Service
 * 
 * Handles unauthenticated API requests for public file encryption and sharing.
 * Does NOT include auth tokens in requests.
 */

import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create separate axios instance for public endpoints (no auth)
const publicAPI = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/public`,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Classify text for sensitivity level
 * @param {string} text - Text content to classify
 * @returns {Promise} Classification result with sensitivity level and confidence
 */
export const classifyText = async (text) => {
    const response = await publicAPI.post('/classify', { text });
    return response.data;
};

/**
 * Encrypt file and create share link
 * @param {Object} data - Encryption request data
 * @param {string} data.content - Base64 encoded file content
 * @param {string} data.filename - Original filename
 * @param {string} [data.content_type] - MIME type
 * @param {string} [data.password] - Optional password protection
 * @param {number} [data.expiration_hours] - Optional expiration in hours
 * @param {number} [data.max_downloads] - Optional download limit
 * @returns {Promise} Share link details
 */
export const encryptFile = async (data) => {
    const response = await publicAPI.post('/encrypt', data);
    return response.data;
};

/**
 * Get share link metadata (without content)
 * @param {string} token - Share token
 * @returns {Promise} Share metadata
 */
export const getShareInfo = async (token) => {
    const response = await publicAPI.get(`/share/${token}/info`);
    return response.data;
};

/**
 * Decrypt and download shared file
 * @param {string} token - Share token
 * @param {string} [password] - Optional password if required
 * @returns {Promise} Decrypted file data
 */
export const decryptShare = async (token, password) => {
    const requestData = password ? { password } : {};
    const response = await publicAPI.post(`/decrypt/${token}`, requestData);
    return response.data;
};

/**
 * Helper: Convert file to base64
 * @param {File} file - File object from input
 * @returns {Promise<string>} Base64 encoded content
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove data:*/*;base64, prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Helper: Download base64 content as file
 * @param {string} base64Content - Base64 encoded content
 * @param {string} filename - Filename for download
 * @param {string} contentType - MIME type
 */
export const downloadBase64File = (base64Content, filename, contentType) => {
    // Convert base64 to blob
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export default publicAPI;
