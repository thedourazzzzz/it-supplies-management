const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    forcePasswordChange: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create default admin user if none exists
userSchema.statics.createDefaultAdmin = async function() {
    try {
        const adminExists = await this.findOne({ username: 'Administrador' });
        if (!adminExists) {
            await this.create({
                username: 'Administrador',
                password: '12@Sup34*',
                isAdmin: true,
                forcePasswordChange: false
            });
            console.log('Default admin user created');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

const User = mongoose.model('User', userSchema);

// Create default admin on model initialization
User.createDefaultAdmin();

module.exports = User;
