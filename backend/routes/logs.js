const express = require('express');
const { getLogs } = require('../controllers/logcontroller');
const router = express.Router();

// Route to get the last 20 action logs.
// GET /api/logs/
router.get('/', getLogs);

module.exports = router;