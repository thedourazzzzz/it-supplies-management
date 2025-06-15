const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    tipo: {
        type: String,
        required: true,
        enum: [
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
        ]
    },
    marca: {
        type: String,
        required: true,
        trim: true
    },
    modelo: {
        type: String,
        required: true,
        trim: true
    },
    descricao: {
        type: String,
        required: true,
        trim: true
    },
    codigoBarras: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    quantidade: {
        type: Number,
        default: 0,
        min: 0
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

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to update quantity
productSchema.methods.updateQuantity = async function(change, requestInfo) {
    const newQuantity = this.quantidade + change;
    if (newQuantity < 0) {
        throw new Error('Quantidade não pode ser negativa');
    }
    this.quantidade = newQuantity;
    await this.save();

    // Create log entry for quantity change
    await mongoose.model('Log').create({
        action: change > 0 ? 'PRODUCT_QUANTITY_ADDED' : 'PRODUCT_QUANTITY_REMOVED',
        details: {
            productId: this._id,
            quantityChange: change,
            newQuantity: this.quantidade,
            requestInfo
        },
        userId: requestInfo.userId
    });

    return this;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
