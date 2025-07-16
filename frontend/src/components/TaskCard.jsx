import React, { useState } from 'react';
import api from '../services/api';

// This component displays a single task card with enhanced functionality
const TaskCard = ({ task, socket }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showActions, setShowActions] = useState(false);

    // Function to handle the "Smart Assign" button click
    const handleSmartAssign = async (e) => {
        e.stopPropagation(); // Prevent event bubbling
        const userId = localStorage.getItem('userId');
        try {
            const res = await api.post(`/tasks/${task._id}/smart-assign`, { userId });
            socket.emit('task-update', res.data);
        } catch (error) {
            console.error("Smart Assign failed", error);
            alert('Smart Assign failed.');
        }
    };

    // Function to handle task deletion
    const handleDelete = async (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
            return;
        }

        setIsDeleting(true);
        const userId = localStorage.getItem('userId');
        
        try {
            await api.delete(`/tasks/${task._id}`, { 
                data: { userId } // Pass userId in request body for logging
            });
            
            // Emit socket event to notify all clients
            socket.emit('task-update', { deleted: true, taskId: task._id });
            
        } catch (error) {
            console.error("Delete failed", error);
            alert('Failed to delete task.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Function to get priority color class
    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'High': return 'priority-high';
            case 'Medium': return 'priority-medium';
            case 'Low': return 'priority-low';
            default: return 'priority-medium';
        }
    };

    return (
        <div 
            className="task-card"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="task-header">
                <h4 className="task-title">{task.title}</h4>
                <div className={`priority-badge ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                </div>
            </div>
            
            {task.description && (
                <p className="task-description">{task.description}</p>
            )}
            
            <div className="task-meta">
                <div className="task-assignee">
                    <span className="assignee-label">Assigned to:</span>
                    <span className="assignee-name">
                        {task.assignedTo ? task.assignedTo.username : 'Unassigned'}
                    </span>
                </div>
                
                <div className="task-dates">
                    <small className="created-date">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                    </small>
                </div>
            </div>

            {/* Action buttons that appear on hover */}
            <div className={`task-actions ${showActions ? 'show' : ''}`}>
                <button 
                    className="btn-smart-assign"
                    onClick={handleSmartAssign}
                    title="Assign to least busy user"
                >
                    Smart Assign
                </button>
                
                <button 
                    className="btn-delete"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    title="Delete task"
                >
                    {isDeleting ? '...' : '🗑️'}
                </button>
            </div>
        </div>
    );
};

export default TaskCard;
