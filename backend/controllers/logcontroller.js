const ActionLog = require('../models/actionlog');

// Controller to get the most recent action logs.
exports.getLogs = async (req, res) => {
    try {
        // Fetch logs from the database.
        const logs = await ActionLog.find()
            .sort({ createdAt: -1 }) // Sort by creation date in descending order (newest first).
            .limit(20) // Limit the result to the last 20 actions.
            .populate('user', 'username'); // Replace the 'user' ID with the user's document (specifically the username).
        
        // Send the fetched logs as a JSON response.
        res.json(logs);
    } catch (error) {
        // Handle any errors during the database query.
        res.status(500).json({ message: "Error fetching logs" });
    }
};