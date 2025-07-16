const mongoose = require('mongoose');

const ActionLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g., "created task", "updated status"
    taskTitle: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ActionLog', ActionLogSchema);