import React, { useState } from 'react';
import api from '../services/api';

const TaskForm = ({ socket, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim()) {
            alert('Task title is required');
            return;
        }

        setIsSubmitting(true);
        const userId = localStorage.getItem('userId');

        try {
            const response = await api.post('/tasks', {
                title: title.trim(),
                description: description.trim(),
                priority,
                userId
            });

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
            if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to create task. Please try again.');
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