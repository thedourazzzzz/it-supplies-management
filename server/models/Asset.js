const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    tipo: {
        type: String,
        required: true,
        enum: ['computador', 'notebook'],
        default: 'computador'
    },
    status: {
        type: String,
        enum: ['ativo', 'inativo', 'manutenção'],
        default: 'ativo'
    },
    produtos: [{
        produto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        dataInstalacao: {
            type: Date,
            default: Date.now
        }
    }],
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
assetSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to import assets from CSV
assetSchema.statics.importFromCSV = async function(assets, userId) {
    const results = {
        success: [],
        ignored: [],
        errors: []
    };

    for (const asset of assets) {
        try {
            // Check if asset already exists
            const exists = await this.findOne({ nome: asset.nome });
            
            if (exists) {
                results.ignored.push({
                    nome: asset.nome,
                    reason: 'Asset already exists'
                });
                continue;
            }

            // Create new asset
            const newAsset = await this.create({
                ...asset,
                createdBy: userId
            });

            // Log the creation
            await mongoose.model('Log').create({
                action: 'ASSET_CREATED',
                details: {
                    assetId: newAsset._id,
                    assetName: newAsset.nome,
                    method: 'CSV_IMPORT'
                },
                userId
            });

            results.success.push(newAsset.nome);

        } catch (error) {
            results.errors.push({
                nome: asset.nome,
                error: error.message
            });
        }
    }

    return results;
};

// Method to add product installation
assetSchema.methods.addProduct = async function(productId, userId) {
    this.produtos.push({
        produto: productId,
        dataInstalacao: new Date()
    });
    
    await this.save();

    // Log the product installation
    await mongoose.model('Log').create({
        action: 'PRODUCT_INSTALLED',
        details: {
            assetId: this._id,
            assetName: this.nome,
            productId
        },
        userId
    });

    return this;
};

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
