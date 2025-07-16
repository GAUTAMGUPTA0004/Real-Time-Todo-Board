import React from 'react';

// This component displays the list of recent actions.
// It receives the 'logs' array as a prop.
const ActivityLog = ({ logs }) => {
    return (
        <div className="activity-log">
            <h3>Activity Log</h3>
            <ul>
                {/* Map over the logs array to render each log entry as a list item. */}
                {logs.map(log => (
                    <li key={log._id}>
                        {/* Display the username of the user who performed the action. */}
                        {/* If the user has been deleted, it defaults to 'A user'. */}
                        <strong>{log.user ? log.user.username : 'A user'}</strong> 
                        {/* Display the action description, e.g., "created task 'New Feature'". */}
                        {' '}{log.action} - 
                        {/* Format and display the timestamp of the action. */}
                        <i> {new Date(log.createdAt).toLocaleTimeString()}</i>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActivityLog;