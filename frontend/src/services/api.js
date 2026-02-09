import axios from 'axios';

// Use environment variable or fallback to relative path for dev proxy
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000 // 15 second timeout
});

// Add access token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
                    const { accessToken } = response.data;

                    localStorage.setItem('accessToken', accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/password', data)
};

// Issues API
export const issuesAPI = {
    getAll: (params) => api.get('/issues', { params }),
    getById: (id) => api.get(`/issues/${id}`),
    create: (formData) => api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/issues/${id}`, data),
    delete: (id) => api.delete(`/issues/${id}`),
    getMyIssues: (params) => api.get('/issues/user/my-issues', { params }),
    getMapIssues: (params) => api.get('/issues/map', { params }),
    getNearby: (lat, lng, maxDistance) =>
        api.get('/issues/nearby', { params: { lat, lng, maxDistance } })
};

// Comments API
export const commentsAPI = {
    getByIssue: (issueId, params) => api.get(`/issues/${issueId}/comments`, { params }),
    create: (issueId, content) => api.post(`/issues/${issueId}/comments`, { content }),
    delete: (id) => api.delete(`/issues/comments/${id}`)
};

// Upvotes API
export const upvotesAPI = {
    toggle: (issueId) => api.post(`/issues/${issueId}/upvote`),
    getStatus: (issueId) => api.get(`/issues/${issueId}/upvote`)
};

// Admin API
export const adminAPI = {
    getIssues: (params) => api.get('/admin/issues', { params }),
    updateStatus: (id, status, comment) =>
        api.patch(`/admin/issues/${id}/status`, { status, comment }),
    assignDepartment: (id, data) => api.patch(`/admin/issues/${id}/assign`, data),
    getDepartments: () => api.get('/admin/departments'),
    createDepartment: (data) => api.post('/admin/departments', data),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role })
};

// Analytics API
export const analyticsAPI = {
    getOverview: () => api.get('/analytics/overview'),
    getByCategory: () => api.get('/analytics/by-category'),
    getTrend: (days) => api.get('/analytics/trend', { params: { days } }),
    getResolutionTime: () => api.get('/analytics/resolution-time'),
    getGeographic: () => api.get('/analytics/geographic')
};

export default api;
