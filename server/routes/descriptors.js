const express = require('express');
const router = express.Router();
const descriptorController = require('../controllers/descriptorController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET /api/descriptors - Get all descriptors (any authenticated user)
router.get('/', descriptorController.getAllDescriptors);

// POST /api/descriptors - Add new descriptor (admin only)
router.post('/', adminMiddleware, descriptorController.addDescriptor);

// DELETE /api/descriptors/:id - Remove descriptor (admin only)
router.delete('/:id', adminMiddleware, descriptorController.removeDescriptor);

// Error handling middleware specific to descriptor routes
router.use((err, req, res, next) => {
    console.error('Descriptor route error:', err);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            error: 'Erro de validação',
            details: Object.values(err.errors).map(e => e.message)
        });
    }
    
    res.status(500).json({ 
        error: 'Erro interno no servidor' 
    });
});

module.exports = router;
