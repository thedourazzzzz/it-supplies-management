const Descriptor = require('../models/Descriptor');
const Log = require('../models/Log');

const descriptorController = {
    // Get all descriptors sorted alphabetically
    getAllDescriptors: async (req, res) => {
        try {
            const descriptors = await Descriptor.getSorted();
            res.json(descriptors);
        } catch (error) {
            console.error('Get descriptors error:', error);
            res.status(500).json({ error: 'Erro ao buscar descritivos' });
        }
    },

    // Add a new descriptor
    addDescriptor: async (req, res) => {
        try {
            const { nome } = req.body;

            // Check if descriptor already exists
            const existing = await Descriptor.findOne({ nome });
            if (existing) {
                return res.status(400).json({ error: 'Descritivo já existe' });
            }

            const descriptor = await Descriptor.create({
                nome,
                createdBy: req.user.id
            });

            await Log.createLog('DESCRIPTOR_CREATED', req.user.id, {
                descriptorId: descriptor._id,
                nome
            }, req);

            res.status(201).json(descriptor);
        } catch (error) {
            console.error('Add descriptor error:', error);
            res.status(500).json({ error: 'Erro ao adicionar descritivo' });
        }
    },

    // Remove a descriptor
    removeDescriptor: async (req, res) => {
        try {
            const { id } = req.params;

            const descriptor = await Descriptor.findById(id);
            if (!descriptor) {
                return res.status(404).json({ error: 'Descritivo não encontrado' });
            }

            // Check if descriptor can be deleted (no products linked)
            const canDelete = await descriptor.canDelete();
            if (!canDelete) {
                return res.status(400).json({ error: 'Não é possível excluir descritivo em uso' });
            }

            await descriptor.deleteOne();

            await Log.createLog('DESCRIPTOR_DELETED', req.user.id, {
                descriptorId: id,
                nome: descriptor.nome
            }, req);

            res.json({ message: 'Descritivo removido com sucesso' });
        } catch (error) {
            console.error('Remove descriptor error:', error);
            res.status(500).json({ error: 'Erro ao remover descritivo' });
        }
    }
};

module.exports = descriptorController;
