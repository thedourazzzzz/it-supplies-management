const mongoose = require('mongoose');

const descriptorSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// Update timestamp before saving
descriptorSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to get sorted descriptors
descriptorSchema.statics.getSorted = async function() {
    return this.find().sort({ nome: 1 });
};

// Static method to initialize default descriptors
descriptorSchema.statics.initializeDefaults = async function(adminUserId) {
    const defaultDescriptors = [
        'HD',
        'SSD',
        'Memoria Ram',
        'Teclado e Mouse',
        'Suporte de notebook',
        'Cabo HDMI',
        'Cabo de força',
        'Cabo VGA',
        'Cabo Displayport',
        'Filtro de linha',
        'Carregador + cabo usb C',
        'Cabo USB A-A',
        'Cabo USC A-B',
        'Smartphone'
    ];

    for (const nome of defaultDescriptors) {
        try {
            const exists = await this.findOne({ nome });
            if (!exists) {
                await this.create({
                    nome,
                    createdBy: adminUserId
                });
            }
        } catch (error) {
            console.error(`Error creating default descriptor ${nome}:`, error);
        }
    }
};

// Method to validate if descriptor can be deleted
descriptorSchema.methods.canDelete = async function() {
    // Check if any products are using this descriptor
    const productsCount = await mongoose.model('Product').countDocuments({
        tipo: this.nome
    });

    return productsCount === 0;
};

const Descriptor = mongoose.model('Descriptor', descriptorSchema);

module.exports = Descriptor;
