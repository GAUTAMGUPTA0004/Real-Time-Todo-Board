import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../services/api';
import Board from '../components/Board';
import ActivityLog from '../components/ActivityLog';
import Header from '../components/Header';
import TaskForm from '../components/TaskForm';

// Updated backend URL for Render deployment (without /api for socket connection)
const SOCKET_URL = 'https://real-time-todo-board-19mv.onrender.com';
// Establish a WebSocket connection to the server
const socket = io(SOCKET_URL);

const DashboardPage = () => {
    // State to hold all tasks and action logs
    const [tasks, setTasks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Function to fetch all tasks from the backend
    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    // Function to fetch the last 20 action logs
    const fetchLogs = async () => {
        try {
            const response = await api.get('/logs');
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    // The useEffect hook runs after the component mounts
    useEffect(() => {
        // Fetch initial data when the component loads
        const initializeData = async () => {
            setIsLoading(true);
            await Promise.all([fetchTasks(), fetchLogs()]);
            setIsLoading(false);
        };

        initializeData();

        // --- Socket.IO Listeners ---
        // Listen for 'task-updated' events from the server
        socket.on('task-updated', (updatedData) => {
            // When an update is received, refetch all tasks to refresh the board
            // This is a simple but effective way to ensure data consistency
            fetchTasks(); 
        });
        
        // Listen for 'logs-updated' events from the server
        socket.on('logs-updated', (newLogs) => {
            // Update the logs state with the new data from the server
            setLogs(newLogs);
        });

        // --- Cleanup function ---
        // This function runs when the component is unmounted
        return () => {
            // It's important to remove the listeners to prevent memory leaks
            socket.off('task-updated');
            socket.off('logs-updated');
        };
    }, []); // The empty dependency array means this effect runs only once on mount

    // Function to handle user logout
    const handleLogout = () => {
        // Clear user data from local storage
        localStorage.clear();
        // Redirect to the login page
        navigate('/login');
    };

    // Function to open task creation form
    const handleCreateTask = () => {
        setShowTaskForm(true);
    };

    // Function to close task creation form
    const handleCloseTaskForm = () => {
        setShowTaskForm(false);
    };

    if (isLoading) {
        return (
            <div className="dashboard-page">
                <Header onLogout={handleLogout} />
                <div className="loading-container">
                    <div className="loading-spinner">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <Header onLogout={handleLogout} />
            
            <div className="dashboard-controls">
                <button 
                    className="btn-primary create-task-btn"
                    onClick={handleCreateTask}
                >
                    + Create New Task
                </button>
            </div>

            <main className="dashboard-main-content">
                <Board tasks={tasks} setTasks={setTasks} socket={socket} />
                <ActivityLog logs={logs} />
            </main>

            {/* Task creation form modal */}
            {showTaskForm && (
                <TaskForm 
                    socket={socket} 
                    onClose={handleCloseTaskForm}
                />
            )}
        </div>
    );
};

export default DashboardPage;