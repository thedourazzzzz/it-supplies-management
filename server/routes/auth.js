const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/login - Login user
router.post('/login', authController.login);

// POST /api/auth/change-password - Change password (protected route)
router.post('/change-password', authMiddleware, authController.changePassword);

// GET /api/auth/verify - Verify token (protected route)
router.get('/verify', authMiddleware, authController.verifyToken);

// Error handling middleware specific to auth routes
router.use((err, req, res, next) => {
    console.error('Auth route error:', err);
    
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token inválido' });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
    }
    
    res.status(500).json({ error: 'Erro interno no servidor' });
});

module.exports = router;
