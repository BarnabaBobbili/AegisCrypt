/**
 * Classification Service
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const classificationService = {
    /**
     * Classify text
     */
    classify: async (text, useML = false) => {
        const response = await api.post(API_ENDPOINTS.CLASSIFY, {
            text,
            use_ml: useML,
        });
        return response.data;
    },
};
