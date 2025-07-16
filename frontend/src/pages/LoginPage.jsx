import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    // State to manage the username and password input fields.
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // The useNavigate hook provides a function to programmatically navigate.
    const navigate = useNavigate();

    // Function to handle the form submission.
    const handleLogin = async (e) => {
        // Prevent the default form submission behavior (page reload).
        e.preventDefault();
        try {
            // Make a POST request to the backend's login endpoint.
            const response = await api.post('/auth/login', { username, password });
            
            // If login is successful, store user data in localStorage for session persistence.
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('username', response.data.username);
            
            // Navigate the user to the main dashboard.
            navigate('/dashboard');
        } catch (error) {
            // If an error occurs, alert the user.
            alert('Login failed. Please check your credentials.');
            console.error("Login Error:", error);
        }
    };

    return (
        <div className="auth-container">
            {/* The onSubmit event on the form calls the handleLogin function. */}
            <form className="auth-form" onSubmit={handleLogin}>
                <h2>Login</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    // Update state on every keystroke.
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;