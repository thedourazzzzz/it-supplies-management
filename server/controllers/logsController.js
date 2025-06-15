const Log = require('../models/Log');

const logsController = {
    // Get paginated logs with optional filters
    getLogs: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const filters = {};

            if (req.query.userId) filters.userId = req.query.userId;
            if (req.query.action) filters.action = req.query.action;
            if (req.query.startDate && req.query.endDate) {
                filters.startDate = req.query.startDate;
                filters.endDate = req.query.endDate;
            }

            const result = await Log.getPaginatedLogs(page, limit, filters);

            res.json(result);
        } catch (error) {
            console.error('Get logs error:', error);
            res.status(500).json({ error: 'Erro ao buscar logs' });
        }
    }
};

module.exports = logsController;
