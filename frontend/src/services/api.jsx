import axios from 'axios';

// Backend URL for Render deployment
const API_URL = 'https://real-time-todo-board-19mv.onrender.com/api';

// Create a configured instance of axios for making API requests
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
    withCredentials: true, // Include credentials in requests
});

// --- Axios Interceptor ---
// An interceptor runs before each request is sent.
// This is the perfect place to attach the auth token to headers.
api.interceptors.request.use(
    config => {
        // Get the JWT token from localStorage
        const token = localStorage.getItem('token');
        // If a token exists, add it to the 'Authorization' header
        if (token) {
            // The 'Bearer ' prefix is a standard for JWT authentication
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // Return the modified config so the request can proceed
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;