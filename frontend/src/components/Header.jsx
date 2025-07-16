import React from 'react';

// A simple presentational component for the page header.
// It receives the 'onLogout' function as a prop from its parent (DashboardPage).
const Header = ({ onLogout }) => {
    // Retrieve the logged-in user's name from localStorage to display it.
    const username = localStorage.getItem('username');
    
    return (
        <header className="header">
            <h1>Collaborative To-Do Board</h1>
            <div className="header-user-info">
                {/* Display a welcome message to the user. */}
                <span>Welcome, {username}!</span>
                
                {/* The logout button triggers the onLogout function passed via props. */}
                <button onClick={onLogout}>Logout</button>
            </div>
        </header>
    );
};

export default Header;