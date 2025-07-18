const Task = require('../models/task');
const User = require('../models/user');
const ActionLog = require('../models/actionlog');

// Helper function to log user actions
const logAction = async (userId, action, taskTitle) => {
    try {
        const log = new ActionLog({ user: userId, action, taskTitle });
        await log.save();
    } catch (error) {
        console.error("Failed to log action:", error);
    }
};

// ... (keep the other controller functions as they are)

exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; 

    try {
        // FIX: Changed "d" to "id" in the line below
        const task = await Task.findByIdAndDelete(id); 
        if (!task) {
            return res.status(404).send("Task not found");
        }
        await logAction(userId, `deleted task "${task.title}"`, task.title);
        res.json({ message: "Task deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting task", error });
    }
};

// ... (keep the smartAssign function as it is)