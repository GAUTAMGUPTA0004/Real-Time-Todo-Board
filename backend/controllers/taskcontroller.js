const Task = require('../models/task');
const User = require('../models/user');
const ActionLog = require('../models/actionlog');

// Helper function to log user actions
const logAction = async (userId, action, taskTitle) => {
    try {
        const log = new ActionLog({ user: userId, action, taskTitle });
        await log.save();
    } catch (error) {
        // Log the error but don't block the main operation
        console.error("Failed to log action:", error);
    }
};

// Controller to get all tasks
exports.getAllTasks = async (req, res) => {
    try {
        // Find all tasks and populate the 'assignedTo' field with the user's username
        const tasks = await Task.find().populate('assignedTo', 'username');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks" });
    }
};

// Controller to create a new task
exports.createTask = async (req, res) => {
    const { title, description, priority, userId } = req.body;
    
    [cite_start]// Server-side validation: Task titles cannot match column names [cite: 38]
    if (['Todo', 'In Progress', 'Done'].includes(title)) {
        return res.status(400).json({ message: "Task title cannot be a column name." });
    }

    try {
        const newTask = new Task({ title, description, priority });
        await newTask.save();
        [cite_start]// Log the creation action [cite: 12]
        await logAction(userId, `created task "${title}"`, title);
        res.status(201).json(newTask);
    } catch (error) {
        [cite_start]// Handle MongoDB unique index violation for the title [cite: 38]
        if (error.code === 11000) {
            return res.status(400).json({ message: "A task with this title already exists." });
        }
        res.status(500).json({ message: "Error creating task", error });
    }
};

// Controller to update an existing task
exports.updateTask = async (req, res) => {
    const { id } = req.params;
    // Get all potential fields to update from the request body
    const { title, description, status, priority, assignedTo, version, userId } = req.body;

    try {
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: "Task not found." });

        [cite_start]// --- Conflict Handling Logic --- [cite: 16, 36]
        // Compare the version from the client with the version in the database
        if (task.version !== version) {
            // If they don't match, it means someone else updated the task.
            // Reject the update and send a 409 Conflict status.
            return res.status(409).json({
                message: "Conflict: This task has been updated by someone else.",
                serverVersion: task // Send the latest version back to the client
            });
        }

        // Update task fields
        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.assignedTo = assignedTo || task.assignedTo;
        // Increment the version number since we're making a change
        task.version += 1; 

        const updatedTask = await task.save();
        [cite_start]// Log the update action [cite: 12]
        await logAction(userId, `updated task "${updatedTask.title}"`, updatedTask.title);

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "Error updating task" });
    }
};

[cite_start]// Controller for the "Smart Assign" feature [cite: 32]
exports.smartAssign = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; // The user who clicked the button

    try {
        // 1. Find all users in the system
        const users = await User.find();
        
        // 2. For each user, count their active tasks ('Todo' or 'In Progress')
        const taskCounts = await Promise.all(users.map(async (user) => {
            const count = await Task.countDocuments({
                assignedTo: user._id,
                status: { $in: ['Todo', 'In Progress'] }
            });
            return { userId: user._id, count };
        }));

        // 3. Sort users by their task count in ascending order
        taskCounts.sort((a, b) => a.count - b.count);
        // The user with the fewest tasks is the first one in the sorted array
        const leastBusyUserId = taskCounts[0].userId;

        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // 4. Assign the task to the least busy user and increment its version
        task.assignedTo = leastBusyUserId;
        task.version += 1;
        await task.save();

        // Log this specific action
        const assignedUser = await User.findById(leastBusyUserId);
        await logAction(userId, `smart-assigned task "${task.title}" to ${assignedUser.username}`, task.title);
        
        // 5. Return the fully updated task with the new assignee's info
        const updatedTask = await Task.findById(id).populate('assignedTo', 'username');
        res.json(updatedTask);

    } catch (error) {
        res.status(500).json({ message: "Error with smart assign" });
    }
};