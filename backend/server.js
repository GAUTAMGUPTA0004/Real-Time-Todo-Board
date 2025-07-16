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
// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(cors());
// Middleware to parse incoming JSON requests
app.use(express.json());

// Create an HTTP server from the Express app
const server = http.createServer(app);
// Initialize Socket.IO server and attach it to the HTTP server
const io = new Server(server, {
    cors: {
        origin: "*", // WARNING: In production, restrict this to your frontend's actual URL for security
        methods: ["GET", "POST"]
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
        // When a task is updated, we broadcast an event to ALL connected clients
        // This ensures everyone's board is updated in real-time
        io.emit('task-updated', data);

        // We also fetch the latest action logs and broadcast them
        const logs = await ActionLog.find().sort({ createdAt: -1 }).limit(20).populate('user', 'username');
        io.emit('logs-updated', logs);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Get the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;
// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));