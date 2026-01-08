import axios from 'axios';

const API_BASE_URL = (() => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && envUrl.trim()) return envUrl.trim();
    if (typeof window !== 'undefined') {
        const host = window.location?.hostname || '';
        if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:5000/api';
        if (host.endsWith('vercel.app')) return 'https://brohealfrontend.onrender.com/api';
        if (host.endsWith('broheal.com')) return 'https://brohealfrontend.onrender.com/api';
        if (window.location?.origin) return `${window.location.origin.replace(/\/$/, '')}/api`;
    }
    return 'http://localhost:5000/api';
})();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
    },
    timeout: 15000
});

// Request interceptor to add role-specific auth token
api.interceptors.request.use(
    (config) => {
        const role = sessionStorage.getItem('sessionRole') || 'user';
        let token = localStorage.getItem(`${role}_accessToken`) || localStorage.getItem('accessToken');
        const isPublic = (config.url || '').startsWith('/public') || (config.url || '').includes('/api/public');
        if (token && !isPublic) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If token expired and we haven't retried yet
        if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const role = sessionStorage.getItem('sessionRole') || 'user';
                let refreshToken = localStorage.getItem(`${role}_refreshToken`) || localStorage.getItem('refreshToken');
                const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });

                const { accessToken } = response.data;
                localStorage.setItem(`${role}_accessToken`, accessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                const role = sessionStorage.getItem('sessionRole') || 'user';
                localStorage.removeItem(`${role}_accessToken`);
                localStorage.removeItem(`${role}_refreshToken`);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
