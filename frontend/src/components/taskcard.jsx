import React from 'react';
import api from '../services/api';

// This component displays a single task card.
// It receives the 'task' object and the 'socket' instance as props.
const TaskCard = ({ task, socket }) => {

    // Function to handle the "Smart Assign" button click.
    const handleSmartAssign = async () => {
        // Get the current user's ID to log who initiated the action.
        const userId = localStorage.getItem('userId');
        try {
            // Send a POST request to the special smart-assign endpoint.
            const res = await api.post(`/tasks/${task._id}/smart-assign`, { userId });
            
            // After the API call is successful, emit a socket event to notify all clients.
            // This ensures everyone's board updates with the new assignment in real-time.
            socket.emit('task-update', res.data);
        } catch (error) {
            console.error("Smart Assign failed", error);
            alert('Smart Assign failed.');
        }
    };
    
    return (
        <div className="task-card">
            <h4>{task.title}</h4>
            <p>{task.description}</p>
            <div className="task-details">
                {/* Display priority and assigned user. */}
                {/* If assignedTo is null/undefined, it shows 'Unassigned'. */}
                <span>{task.assignedTo ? task.assignedTo.username : 'Unassigned'}</span>
                <span>Priority: {task.priority}</span>
            </div>
            <button onClick={handleSmartAssign}>Smart Assign</button>
        </div>
    );
};

export default TaskCard;