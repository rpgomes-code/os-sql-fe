// src/lib/api.ts
import axios from 'axios';
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

// Add a request interceptor to include token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('bearerToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response and error interceptors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            toast.error("API Error: " + (error.response.data?.message || "Request failed"));
        } else if (error.request) {
            toast.error("Network Error: No response received from the server");
        } else {
            toast.error("Error: " + error.message);
        }
        return Promise.reject(error);
    }
);

// Authentication service
export const authService = {
    generateToken: async () => {
        const response = await api.post('/auth/generate');
        return response.data;
    },
    validateToken: async (token: string) => {
        const response = await api.get(`/auth/validate?token=${token}`);
        return response.data.valid;
    },
    revokeToken: async (token: string) => {
        const response = await api.delete(`/auth/revoke?token=${token}`);
        return response.data.revoked;
    },
};

// SQL Migration service
export const sqlMigrationService = {
    convertQuery: async (sqlQuery: string) => {
        // Base64 encode the query
        const encodedQuery = btoa(sqlQuery);

        const response = await api.post('/sql-migration/convert', {
            original_query: encodedQuery,
        });

        if (response.data.success) {
            // Decode the converted query
            response.data.converted_query = atob(response.data.converted_query);
        }

        return response.data;
    },
};

// SQL Formatting service
export const sqlFormattingService = {
    formatQuery: async (sqlQuery: string) => {
        // Base64 encode the query
        const encodedQuery = btoa(sqlQuery);

        const response = await api.post('/sql-formatting/format', {
            original_query: encodedQuery,
        });

        if (response.data.success) {
            // Decode the formatted query
            response.data.formatted_query = atob(response.data.formatted_query);
        }

        return response.data;
    },

    minifyQuery: async (sqlQuery: string) => {
        // Base64 encode the query
        const encodedQuery = btoa(sqlQuery);

        const response = await api.post('/sql-formatting/minify', {
            original_query: encodedQuery,
        });

        if (response.data.success) {
            // Decode the minified query
            response.data.formatted_query = atob(response.data.formatted_query);
        }

        return response.data;
    },
};

// Logs service
export const logsService = {
    getLogs: async () => {
        const response = await api.get('/logs');
        return response.data;
    },
};

export default api;