import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <div className="landing-container">
                <div className="landing-header">
                    <h1>Welcome to Collaborative To-Do Board</h1>
                    <p>Organize your tasks, collaborate with your team, and boost productivity in real-time.</p>
                </div>
                
                <div className="landing-features">
                    <div className="feature">
                        <h3>🚀 Real-time Collaboration</h3>
                        <p>Work together with your team in real-time. See updates instantly as they happen.</p>
                    </div>
                    <div className="feature">
                        <h3>📋 Kanban Board</h3>
                        <p>Organize tasks with an intuitive drag-and-drop Kanban board interface.</p>
                    </div>
                    <div className="feature">
                        <h3>🎯 Smart Assignment</h3>
                        <p>Automatically assign tasks to the least busy team members.</p>
                    </div>
                    <div className="feature">
                        <h3>📊 Activity Tracking</h3>
                        <p>Keep track of all changes and updates with comprehensive activity logs.</p>
                    </div>
                </div>
                
                <div className="landing-actions">
                    <Link to="/login" className="btn btn-primary">
                        Login
                    </Link>
                    <Link to="/register" className="btn btn-secondary">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;