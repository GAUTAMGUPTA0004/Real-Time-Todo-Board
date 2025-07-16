const express = require('express');
const { getLogs } = require('../controllers/logController');
const router = express.Router();

// Route to get the last 20 action logs.
// GET /api/logs/
router.get('/', getLogs);

module.exports = router;