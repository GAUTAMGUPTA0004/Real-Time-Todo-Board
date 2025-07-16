import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../services/api';
import Board from '../components/Board';
import ActivityLog from '../components/ActivityLog';
import Header from '../components/Header';
import TaskForm from '../components/TaskForm';

// Backend URL for Render deployment
const SOCKET_URL = 'https://real-time-todo-board-19mv.onrender.com';

// Socket configuration with proper CORS settings
const socketOptions = {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true
};

const DashboardPage = () => {
    // State to hold all tasks and action logs
    const [tasks, setTasks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const navigate = useNavigate();

    // Function to fetch all tasks from the backend
    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
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
        // Initialize socket connection
        const newSocket = io(SOCKET_URL, socketOptions);
        setSocket(newSocket);

        // Socket connection event handlers
        newSocket.on('connect', () => {
            console.log('Connected to server:', newSocket.id);
            setConnectionStatus('Connected');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setConnectionStatus('Disconnected');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setConnectionStatus('Connection Error');
        });

        // Fetch initial data when the component loads
        const initializeData = async () => {
            setIsLoading(true);
            await Promise.all([fetchTasks(), fetchLogs()]);
            setIsLoading(false);
        };

        initializeData();

        // --- Socket.IO Listeners ---
        // Listen for 'task-updated' events from the server
        newSocket.on('task-updated', (updatedData) => {
            console.log('Task updated via socket:', updatedData);
            // When an update is received, refetch all tasks to refresh the board
            fetchTasks(); 
        });
        
        // Listen for 'logs-updated' events from the server
        newSocket.on('logs-updated', (newLogs) => {
            console.log('Logs updated via socket');
            // Update the logs state with the new data from the server
            setLogs(newLogs);
        });

        // --- Cleanup function ---
        return () => {
            console.log('Cleaning up socket connection');
            newSocket.off('task-updated');
            newSocket.off('logs-updated');
            newSocket.disconnect();
        };
    }, []); // The empty dependency array means this effect runs only once on mount

    // Function to handle user logout
    const handleLogout = () => {
        // Clear user data from local storage
        localStorage.clear();
        // Disconnect socket
        if (socket) {
            socket.disconnect();
        }
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
            
            {/* Connection status indicator */}
            <div className="connection-status" style={{
                padding: '5px 10px',
                backgroundColor: connectionStatus === 'Connected' ? '#4CAF50' : '#f44336',
                color: 'white',
                textAlign: 'center',
                fontSize: '12px'
            }}>
                Socket Status: {connectionStatus}
            </div>
            
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
            {showTaskForm && socket && (
                <TaskForm 
                    socket={socket} 
                    onClose={handleCloseTaskForm}
                />
            )}
        </div>
    );
};

export default DashboardPage;