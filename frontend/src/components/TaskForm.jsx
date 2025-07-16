import React, { useState } from 'react';
import api from '../services/api';

const TaskForm = ({ socket, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear any previous errors
        
        if (!title.trim()) {
            setError('Task title is required');
            return;
        }

        // Check if title is a column name (frontend validation)
        const columnNames = ['Todo', 'In Progress', 'Done'];
        if (columnNames.includes(title.trim())) {
            setError('Task title cannot be a column name (Todo, In Progress, Done)');
            return;
        }

        setIsSubmitting(true);
        const userId = localStorage.getItem('userId');

        try {
            console.log('Attempting to create task:', { title: title.trim(), description, priority, userId });
            
            const response = await api.post('/tasks', {
                title: title.trim(),
                description: description.trim(),
                priority,
                userId
            });

            console.log('Task created successfully:', response.data);

            // Emit socket event to notify all clients
            socket.emit('task-update', response.data);
            
            // Reset form
            setTitle('');
            setDescription('');
            setPriority('Medium');
            
            // Close the form
            onClose();
            
        } catch (error) {
            console.error('Error creating task:', error);
            
            // Enhanced error handling
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || 'Unknown error';
                
                console.log('Error response:', {
                    status,
                    message,
                    data: error.response.data
                });
                
                switch (status) {
                    case 400:
                        if (error.response.data?.code === 11000) {
                            setError(`A task with the title "${title.trim()}" already exists. Please choose a different title.`);
                        } else {
                            setError(message);
                        }
                        break;
                    case 401:
                        setError('You are not authorized. Please log in again.');
                        // Optionally redirect to login
                        localStorage.clear();
                        window.location.href = '/login';
                        break;
                    case 500:
                        setError('Server error. Please try again later.');
                        break;
                    default:
                        setError(message || 'Failed to create task. Please try again.');
                }
            } else if (error.request) {
                // Network error
                console.error('Network error:', error.request);
                setError('Network error. Please check your connection and try again.');
            } else {
                // Other error
                console.error('Unknown error:', error.message);
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="task-form-overlay">
            <div className="task-form-container">
                <form onSubmit={handleSubmit} className="task-form">
                    <h3>Create New Task</h3>
                    
                    {/* Error display */}
                    {error && (
                        <div className="error-message" style={{
                            color: 'red',
                            backgroundColor: '#ffebee',
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '4px',
                            border: '1px solid #ffcdd2'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter task title"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter task description (optional)"
                            rows="3"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            disabled={isSubmitting}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="btn-primary"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskForm;