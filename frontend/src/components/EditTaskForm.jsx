import React, { useState } from 'react';
import api from '../services/api';

const EditTaskForm = ({ task, socket, onClose, setConflict }) => {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [priority, setPriority] = useState(task.priority);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Task title cannot be empty.');
            return;
        }

        setIsSubmitting(true);
        const userId = localStorage.getItem('userId');

        const updatedData = {
            ...task,
            title: title.trim(),
            description: description.trim(),
            priority,
            userId,
        };

        try {
            const response = await api.put(`/tasks/${task._id}`, updatedData);
            socket.emit('task-update', response.data);
            onClose();
        } catch (err) {
            if (err.response && err.response.status === 409) {
                // Conflict detected
                setConflict({
                    userAttempt: updatedData,
                    serverVersion: err.response.data.serverVersion,
                });
                onClose(); // Close this form to show the conflict modal
            } else {
                setError(err.response?.data?.message || 'Failed to update task.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="task-form-overlay">
            <div className="task-form-container">
                <form onSubmit={handleSubmit} className="task-form">
                    <h3>Edit Task</h3>
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTaskForm;