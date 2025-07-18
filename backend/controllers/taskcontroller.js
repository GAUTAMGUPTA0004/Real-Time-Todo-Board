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

// Controller to get all tasks
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo', 'username');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks" });
    }
};

// Controller to create a new task
exports.createTask = async (req, res) => {
    const { title, description, priority, userId } = req.body;
    
    if (['Todo', 'In Progress', 'Done'].includes(title)) {
        return res.status(400).json({ message: "Task title cannot be a column name." });
    }

    try {
        const newTask = new Task({ title, description, priority });
        await newTask.save();
        await logAction(userId, `created task "${title}"`, title);
        res.status(201).json(newTask);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "A task with this title already exists." });
        }
        res.status(500).json({ message: "Error creating task", error });
    }
};

// Controller to update an existing task
exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, status, priority, assignedTo, version, userId } = req.body;

    try {
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: "Task not found." });

        if (task.version !== version) {
            return res.status(409).json({
                message: "Conflict: This task has been updated by someone else.",
                serverVersion: task
            });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.assignedTo = assignedTo || task.assignedTo;
        task.version += 1; 

        const updatedTask = await task.save();
        await logAction(userId, `updated task "${updatedTask.title}"`, updatedTask.title);

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "Error updating task" });
    }
};

exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; 

    try {
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

exports.smartAssign = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    try {
        const users = await User.find();
        const taskCounts = await Promise.all(users.map(async (user) => {
            const count = await Task.countDocuments({
                assignedTo: user._id,
                status: { $in: ['Todo', 'In Progress'] }
            });
            return { userId: user._id, count };
        }));

        taskCounts.sort((a, b) => a.count - b.count);
        const leastBusyUserId = taskCounts[0].userId;

        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.assignedTo = leastBusyUserId;
        task.version += 1;
        await task.save();

        const assignedUser = await User.findById(leastBusyUserId);
        await logAction(userId, `smart-assigned task "${task.title}" to ${assignedUser.username}`, task.title);
        
        const updatedTask = await Task.findById(id).populate('assignedTo', 'username');
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "Error with smart assign" });
    }
};