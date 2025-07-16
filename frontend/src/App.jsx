import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import './App.css'; // Import global styles

function App() {
    // Check if an authentication token exists in local storage.
    const token = localStorage.getItem('token');

    return (
        // BrowserRouter provides the routing context for the application.
        <Router>
            <div className="app">
                {/* The Routes component defines the different navigation paths. */}
                <Routes>
                    {/* Route for the login page. */}
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Route for the registration page. */}
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* A protected route for the main dashboard. */}
                    <Route 
                        path="/dashboard" 
                        // If a token exists, render the DashboardPage.
                        // Otherwise, redirect the user to the login page.
                        element={token ? <DashboardPage /> : <Navigate to="/login" />} 
                    />
                    
                    {/* A catch-all route to handle undefined paths. */}
                    {/* It redirects to the dashboard if logged in, otherwise to the login page. */}
                    <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;