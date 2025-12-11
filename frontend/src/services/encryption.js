/**
 * Encryption Service
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const encryptionService = {
    /**
     * Encrypt data
     */
    encrypt: async (text, sensitivityLevel = null, saveToDb = true) => {
        const response = await api.post(API_ENDPOINTS.ENCRYPT, {
            text,
            sensitivity_level: sensitivityLevel,
            save_to_db: saveToDb,
        });
        return response.data;
    },

    /**
     * Decrypt data
     */
    decrypt: async (dataId) => {
        const response = await api.post(API_ENDPOINTS.DECRYPT, {
            data_id: dataId,
        });
        return response.data;
    },

    /**
     * Get all data items
     */
    getDataItems: async () => {
        const response = await api.get(API_ENDPOINTS.DATA_ITEMS);
        return response.data;
    },

    /**
     * Get specific data item
     */
    getDataItem: async (id) => {
        const response = await api.get(`${API_ENDPOINTS.DATA_ITEMS}/${id}`);
        return response.data;
    },

    /**
     * Delete data item
     */
    deleteDataItem: async (id) => {
        await api.delete(`${API_ENDPOINTS.DATA_ITEMS}/${id}`);
    },
};
