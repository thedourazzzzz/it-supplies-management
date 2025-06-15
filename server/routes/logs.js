const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET /api/logs - Get paginated logs (any authenticated user)
router.get('/', logsController.getLogs);

// Error handling middleware specific to logs routes
router.use((err, req, res, next) => {
    console.error('Logs route error:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
});

module.exports = router;
