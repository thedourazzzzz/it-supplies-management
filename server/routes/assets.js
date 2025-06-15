const express = require('express');
const router = express.Router();
const multer = require('multer');
const assetController = require('../controllers/assetController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const upload = multer({ dest: 'uploads/' });

// All routes require authentication
router.use(authMiddleware);

// GET /api/assets - Get all assets (any authenticated user)
router.get('/', assetController.getAllAssets);

// POST /api/assets/import - Import assets from CSV (admin only)
router.post('/import', adminMiddleware, upload.single('file'), assetController.importCSV);

// POST /api/assets - Add asset manually (admin only)
router.post('/', adminMiddleware, assetController.addAsset);

// DELETE /api/assets/:id - Remove asset manually (admin only)
router.delete('/:id', adminMiddleware, assetController.removeAsset);

// Error handling middleware specific to asset routes
router.use((err, req, res, next) => {
    console.error('Asset route error:', err);
    
    if (err.name === 'MulterError') {
        return res.status(400).json({ error: 'Erro no upload do arquivo' });
    }
    
    res.status(500).json({ error: 'Erro interno no servidor' });
});

module.exports = router;
