const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    version: { type: Number, default: 1 } // For conflict handling
}, { timestamps: true });

// Ensure title is unique (within a board, though here it's global for simplicity)
TaskSchema.index({ title: 1 }, { unique: true });

module.exports = mongoose.model('Task', TaskSchema);