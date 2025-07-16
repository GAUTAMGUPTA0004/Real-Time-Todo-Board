import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    // State for form inputs.
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Function to handle the registration form submission.
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Make a POST request to the backend's register endpoint.
            await api.post('/auth/register', { username, password });
            
            // If registration is successful, alert the user and redirect to the login page.
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            // Handle errors, such as a username that is already taken.
            alert('Registration failed. The username may already be in use.');
            console.error("Registration Error:", error);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleRegister}>
                <h2>Register</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
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
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterPage;