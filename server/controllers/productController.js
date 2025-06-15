const Product = require('../models/Product');
const Log = require('../models/Log');

const productController = {
    // Get all products with optional filters
    getAllProducts: async (req, res) => {
        try {
            const { marca, tipo, modelo, descricao, codigoBarras } = req.query;
            const filter = {};

            if (marca) filter.marca = { $regex: marca, $options: 'i' };
            if (tipo) filter.tipo = tipo;
            if (modelo) filter.modelo = { $regex: modelo, $options: 'i' };
            if (descricao) filter.descricao = { $regex: descricao, $options: 'i' };
            if (codigoBarras) filter.codigoBarras = { $regex: codigoBarras, $options: 'i' };

            const products = await Product.find(filter).sort({ marca: 1, modelo: 1 });
            res.json(products);
        } catch (error) {
            console.error('Get products error:', error);
            res.status(500).json({ error: 'Erro ao buscar produtos' });
        }
    },

    // Create new product
    createProduct: async (req, res) => {
        try {
            const { tipo, marca, modelo, descricao, codigoBarras } = req.body;

            // Check for duplicate barcode
            const existing = await Product.findOne({ codigoBarras });
            if (existing) {
                return res.status(400).json({ error: 'Produto com este código de barras já existe' });
            }

            const product = await Product.create({
                tipo,
                marca,
                modelo,
                descricao,
                codigoBarras,
                createdBy: req.user.id
            });

            await Log.createLog('PRODUCT_CREATED', req.user.id, {
                productId: product._id,
                marca,
                modelo
            }, req);

            res.status(201).json(product);
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({ error: 'Erro ao criar produto' });
        }
    },

    // Update product quantity (add or remove)
    updateQuantity: async (req, res) => {
        try {
            const { id } = req.params;
            const { change, requestInfo } = req.body;

            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            await product.updateQuantity(change, { ...requestInfo, userId: req.user.id });

            res.json(product);
        } catch (error) {
            console.error('Update quantity error:', error);
            res.status(500).json({ error: error.message || 'Erro ao atualizar quantidade' });
        }
    }
};

module.exports = productController;
