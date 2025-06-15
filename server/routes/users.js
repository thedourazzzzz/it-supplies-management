const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET /api/users - Get all users (admin only)
router.get('/', adminMiddleware, userController.getAllUsers);

// POST /api/users - Create new user (admin only)
router.post('/', adminMiddleware, userController.createUser);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', adminMiddleware, userController.updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', adminMiddleware, userController.deleteUser);

// POST /api/users/:id/reset-password - Reset user password (admin only)
router.post('/:id/reset-password', adminMiddleware, userController.resetPassword);

// PATCH /api/users/:id/toggle-admin - Toggle admin status (admin only)
router.patch('/:id/toggle-admin', adminMiddleware, userController.toggleAdmin);

// Error handling middleware specific to user routes
router.use((err, req, res, next) => {
    console.error('User route error:', err);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            error: 'Erro de validação',
            details: Object.values(err.errors).map(e => e.message)
        });
    }
    
    if (err.code === 11000) {
        return res.status(400).json({ 
            error: 'Nome de usuário já existe' 
        });
    }
    
    res.status(500).json({ 
        error: 'Erro interno no servidor' 
    });
});

module.exports = router;
