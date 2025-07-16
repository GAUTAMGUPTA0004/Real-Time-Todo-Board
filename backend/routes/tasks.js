const express = require('express');
const { 
    getAllTasks, 
    createTask, 
    updateTask, 
    deleteTask, 
    smartAssign 
} = require('../controllers/taskcontroller');
const router = express.Router();

// Route to get all tasks.
// GET /api/tasks/
router.get('/', getAllTasks);

// Route to create a new task.
// POST /api/tasks/
router.post('/', createTask);

// Route to update an existing task by its ID.
// PUT /api/tasks/:id
router.put('/:id', updateTask);

// Route to delete a task by its ID.
// DELETE /api/tasks/:id
router.delete('/:id', deleteTask);

// Route to trigger the "Smart Assign" logic for a specific task.
// POST /api/tasks/:id/smart-assign
router.post('/:id/smart-assign', smartAssign);

module.exports = router;