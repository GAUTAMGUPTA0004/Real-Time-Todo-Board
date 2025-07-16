const ActionLog = require('../models/actionlog');

exports.getLogs = async (req, res) => {
    try {
        const logs = await ActionLog.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('user', 'username');
        
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching logs" });
    }
};