// Import necessary packages
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config(); // Loads environment variables from a .env file

// Import route definitions
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const logRoutes = require('./routes/logs');

// Import models to be used in real-time updates
const ActionLog = require('./models/actionlog');

// Initialize Express app
const app = express();

// CORS configuration - Allow your Vercel frontend
const corsOptions = {
    origin: [
        'https://real-time-todo-board-lyart.vercel.app',
        'http://localhost:3000', // For local development
        'https://localhost:3000'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

// Enable CORS with proper configuration
app.use(cors(corsOptions));

// Middleware to parse incoming JSON requests
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Initialize Socket.IO server with proper CORS
const io = new Server(server, {
    cors: {
        origin: [
            'https://real-time-todo-board-lyart.vercel.app',
            'http://localhost:3000',
            'https://localhost:3000'
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// --- API Routes ---
// All authentication-related routes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);
// All task-related routes will be prefixed with /api/tasks
app.use('/api/tasks', taskRoutes);
// All log-related routes will be prefixed with /api/logs
app.use('/api/logs', logRoutes);

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.error("MongoDB connection error:", err));

// --- Real-Time Logic with Socket.IO ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for a 'task-update' event from any client
    socket.on('task-update', async (data) => {
        try {
            // When a task is updated, we broadcast an event to ALL connected clients
            // This ensures everyone's board is updated in real-time
            io.emit('task-updated', data);

            // We also fetch the latest action logs and broadcast them
            const logs = await ActionLog.find().sort({ createdAt: -1 }).limit(20).populate('user', 'username');
            io.emit('logs-updated', logs);
        } catch (error) {
            console.error('Error in task-update handler:', error);
        }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Internal server error' });
});

// Get the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
});