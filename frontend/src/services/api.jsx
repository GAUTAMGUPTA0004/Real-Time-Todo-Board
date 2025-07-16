import axios from 'axios';

// Updated backend URL for Render deployment
const API_URL = 'https://real-time-todo-board-19mv.onrender.com'; 

// Create a configured instance of axios for making API requests
const api = axios.create({
    baseURL: API_URL, // All requests will be prefixed with this URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Axios Interceptor ---
// An interceptor runs before each request is sent.
// This is the perfect place to attach the auth token to headers.
api.interceptors.request.use(config => {
    // Get the JWT token from localStorage
    const token = localStorage.getItem('token');
    // If a token exists, add it to the 'Authorization' header
    if (token) {
        // The 'Bearer ' prefix is a standard for JWT authentication
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Return the modified config so the request can proceed
    return config;
});

export default api;