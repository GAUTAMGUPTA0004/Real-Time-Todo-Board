import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../services/api';
import Board from '../components/Board';
import ActivityLog from '../components/ActivityLog';
import Header from '../components/Header';
import TaskForm from '../components/TaskForm';
import EditTaskForm from '../components/EditTaskForm';
import ConflictModal from '../components/conflict';


const SOCKET_URL = 'https://real-time-todo-board-19mv.onrender.com';

const socketOptions = {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true
};

const DashboardPage = () => {
    const [tasks, setTasks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [editingTask, setEditingTask] = useState(null);
    const [conflict, setConflict] = useState(null);
    const navigate = useNavigate();

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            if (error.response?.status === 401) navigate('/login');
        }
    };

    const fetchLogs = async () => {
        try {
            const response = await api.get('/logs');
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };
    
    // ... (keep the useEffect and handleLogout functions)
    useEffect(() => {
        const newSocket = io(SOCKET_URL, socketOptions);
        setSocket(newSocket);
        newSocket.on('connect', () => setConnectionStatus('Connected'));
        newSocket.on('disconnect', () => setConnectionStatus('Disconnected'));
        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setConnectionStatus('Connection Error');
        });

        const initializeData = async () => {
            setIsLoading(true);
            await Promise.all([fetchTasks(), fetchLogs()]);
            setIsLoading(false);
        };
        initializeData();

        newSocket.on('task-updated', () => fetchTasks());
        newSocket.on('logs-updated', (newLogs) => setLogs(newLogs));

        return () => {
            newSocket.off('task-updated');
            newSocket.off('logs-updated');
            newSocket.disconnect();
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        if (socket) socket.disconnect();
        navigate('/login');
    };

    const resolveConflict = async () => {
        if (!conflict) return;
        const { userAttempt, serverVersion } = conflict;
        const forceUpdateData = { ...userAttempt, version: serverVersion.version };
        try {
            const res = await api.put(`/tasks/${userAttempt._id}`, forceUpdateData);
            socket.emit('task-update', res.data);
            alert('Your changes have been applied.');
        } catch (err) {
            alert('Failed to apply changes. The board will refresh.');
            socket.emit('task-update', {}); 
        } finally {
            setConflict(null);
        }
    };

    const cancelConflict = () => {
        setConflict(null);
        socket.emit('task-update', {});
        alert('Your changes have been discarded.');
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
            <div className="connection-status" style={{ backgroundColor: connectionStatus === 'Connected' ? '#4CAF50' : '#f44336', color: 'white', textAlign: 'center', fontSize: '12px' }}>
                Socket Status: {connectionStatus}
            </div>
            <div className="dashboard-controls">
                <button className="btn-primary create-task-btn" onClick={() => setShowTaskForm(true)}>
                    + Create New Task
                </button>
            </div>
            <main className="dashboard-main-content">
                <Board
                    tasks={tasks}
                    setTasks={setTasks}
                    socket={socket}
                    onEditTask={setEditingTask}
                    setConflict={setConflict}
                />
                <ActivityLog logs={logs} />
            </main>
            {showTaskForm && <TaskForm socket={socket} onClose={() => setShowTaskForm(false)} />}
            {editingTask && (
                <EditTaskForm
                    task={editingTask}
                    socket={socket}
                    onClose={() => setEditingTask(null)}
                    setConflict={setConflict}
                />
            )}
            <ConflictModal
                conflict={conflict}
                onResolve={resolveConflict}
                onCancel={cancelConflict}
            />
        </div>
    );
};

export default DashboardPage;