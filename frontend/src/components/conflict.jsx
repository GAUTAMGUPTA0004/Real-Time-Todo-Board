import React from 'react';

// This component displays a modal to resolve update conflicts.
const ConflictModal = ({ conflict, onResolve, onCancel }) => {
    if (!conflict) {
        return null; // Don't render if there's no conflict
    }

    const { userAttempt, serverVersion } = conflict;

    // A simple way to show what changed
    const changes =
        `Your change: Status -> ${userAttempt.status}\n` +
        `Server version: Status -> ${serverVersion.status}`;

    return (
        <div className="task-form-overlay">
            <div className="task-form-container">
                <h3>Conflict Detected</h3>
                <p>
                    This task was updated by someone else while you were making changes.
                </p>
                <div className="conflict-details">
                    <pre>{changes}</pre>
                </div>
                <p>Do you want to overwrite their changes with yours?</p>
                <div className="form-actions">
                    <button onClick={onCancel} className="btn-secondary">
                        Cancel
                    </button>
                    <button onClick={onResolve} className="btn-primary">
                        Overwrite
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConflictModal;