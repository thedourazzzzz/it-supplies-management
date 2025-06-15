const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            // User related actions
            'USER_CREATED',
            'USER_UPDATED',
            'USER_DELETED',
            'USER_PASSWORD_RESET',
            'USER_ADMIN_GRANTED',
            'USER_ADMIN_REVOKED',
            'USER_LOGIN',
            'USER_LOGIN_FAILED',
            'USER_PASSWORD_CHANGED',
            
            // Product related actions
            'PRODUCT_CREATED',
            'PRODUCT_UPDATED',
            'PRODUCT_DELETED',
            'PRODUCT_QUANTITY_ADDED',
            'PRODUCT_QUANTITY_REMOVED',
            'PRODUCT_INSTALLED',
            
            // Asset related actions
            'ASSET_CREATED',
            'ASSET_UPDATED',
            'ASSET_DELETED',
            'ASSET_CSV_IMPORT',
            
            // Descriptor related actions
            'DESCRIPTOR_CREATED',
            'DESCRIPTOR_DELETED'
        ]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
});

// Ensure logs cannot be modified after creation
logSchema.pre('save', function(next) {
    if (!this.isNew) {
        const err = new Error('Logs cannot be modified after creation');
        return next(err);
    }
    next();
});

// Method to create a log entry with request details
logSchema.statics.createLog = async function(action, userId, details, req = null) {
    const logEntry = {
        action,
        userId,
        details,
        ipAddress: req ? req.ip : undefined,
        userAgent: req ? req.get('User-Agent') : undefined
    };

    return this.create(logEntry);
};

// Method to get paginated logs
logSchema.statics.getPaginatedLogs = async function(page = 1, limit = 50, filters = {}) {
    const skip = (page - 1) * limit;
    
    const query = {};
    
    // Apply filters if provided
    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.startDate && filters.endDate) {
        query.timestamp = {
            $gte: new Date(filters.startDate),
            $lte: new Date(filters.endDate)
        };
    }

    const [logs, total] = await Promise.all([
        this.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'username'),
        this.countDocuments(query)
    ]);

    return {
        logs,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
    };
};

// Prevent any updates to logs
logSchema.pre('updateOne', function(next) {
    const err = new Error('Logs cannot be modified');
    next(err);
});

logSchema.pre('deleteOne', function(next) {
    const err = new Error('Logs cannot be deleted');
    next(err);
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
