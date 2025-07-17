import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import './App.css'; // Import global styles

function App() {
    const token = localStorage.getItem('token');

    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route 
                        path="/dashboard" 
                        element={token ? <DashboardPage /> : <Navigate to="/" />} 
                    />
                    <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;