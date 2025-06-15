const Asset = require('../models/Asset');
const Log = require('../models/Log');
const csv = require('csv-parser');
const fs = require('fs');

const assetController = {
    // Get all assets
    getAllAssets: async (req, res) => {
        try {
            const assets = await Asset.find().sort({ nome: 1 });
            res.json(assets);
        } catch (error) {
            console.error('Get assets error:', error);
            res.status(500).json({ error: 'Erro ao buscar ativos' });
        }
    },

    // Import assets from CSV
    importCSV: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Arquivo CSV não fornecido' });
            }

            const results = [];
            const errors = [];
            const ignored = [];

            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on('data', (data) => {
                    results.push(data);
                })
                .on('end', async () => {
                    // Map CSV data to asset objects
                    const assetsToImport = results.map(row => ({
                        nome: row.nome,
                        tipo: row.tipo || 'computador',
                        createdBy: req.user.id
                    }));

                    const importResults = await Asset.importFromCSV(assetsToImport, req.user.id);

                    // Delete the uploaded file after processing
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.error('Error deleting CSV file:', err);
                    });

                    res.json({
                        message: 'Importação concluída',
                        success: importResults.success,
                        ignored: importResults.ignored,
                        errors: importResults.errors
                    });
                });
        } catch (error) {
            console.error('CSV import error:', error);
            res.status(500).json({ error: 'Erro ao importar CSV' });
        }
    },

    // Add asset manually
    addAsset: async (req, res) => {
        try {
            const { nome, tipo } = req.body;

            const existing = await Asset.findOne({ nome });
            if (existing) {
                return res.status(400).json({ error: 'Ativo já existe' });
            }

            const asset = await Asset.create({
                nome,
                tipo,
                createdBy: req.user.id
            });

            await Log.createLog('ASSET_CREATED', req.user.id, {
                assetId: asset._id,
                nome: asset.nome
            }, req);

            res.status(201).json(asset);
        } catch (error) {
            console.error('Add asset error:', error);
            res.status(500).json({ error: 'Erro ao adicionar ativo' });
        }
    },

    // Remove asset manually
    removeAsset: async (req, res) => {
        try {
            const { id } = req.params;

            const asset = await Asset.findById(id);
            if (!asset) {
                return res.status(404).json({ error: 'Ativo não encontrado' });
            }

            await asset.deleteOne();

            await Log.createLog('ASSET_DELETED', req.user.id, {
                assetId: id,
                nome: asset.nome
            }, req);

            res.json({ message: 'Ativo removido com sucesso' });
        } catch (error) {
            console.error('Remove asset error:', error);
            res.status(500).json({ error: 'Erro ao remover ativo' });
        }
    }
};

module.exports = assetController;
