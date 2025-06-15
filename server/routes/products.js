const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET /api/products - Get all products (any authenticated user)
router.get('/', productController.getAllProducts);

// POST /api/products - Create new product (admin only)
router.post('/', adminMiddleware, productController.createProduct);

// PATCH /api/products/:id/update-quantity - Update product quantity (admin only)
router.patch('/:id/update-quantity', adminMiddleware, productController.updateQuantity);

// Error handling middleware specific to product routes
router.use((err, req, res, next) => {
    console.error('Product route error:', err);
    
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
