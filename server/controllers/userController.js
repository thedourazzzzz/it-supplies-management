const User = require('../models/User');
const Log = require('../models/Log');

const userController = {
    // Get all users (except the default admin)
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find({ username: { $ne: 'Administrador' } })
                .select('-password')
                .sort({ username: 1 });
            res.json(users);
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ error: 'Erro ao buscar usuários' });
        }
    },

    // Create new user
    createUser: async (req, res) => {
        try {
            const { username, password, isAdmin, forcePasswordChange = true } = req.body;

            // Check if username already exists
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: 'Nome de usuário já existe' });
            }

            // Create user
            const user = await User.create({
                username,
                password,
                isAdmin,
                forcePasswordChange
            });

            // Log user creation
            await Log.createLog('USER_CREATED', req.user.id, {
                createdUserId: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            }, req);

            res.status(201).json({
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin,
                forcePasswordChange: user.forcePasswordChange
            });

        } catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    },

    // Update user
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { username, isAdmin } = req.body;

            // Don't allow updating the default admin
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            if (user.username === 'Administrador') {
                return res.status(403).json({ error: 'Não é permitido modificar o usuário Administrador' });
            }

            // Check if new username already exists
            if (username !== user.username) {
                const existingUser = await User.findOne({ username });
                if (existingUser) {
                    return res.status(400).json({ error: 'Nome de usuário já existe' });
                }
            }

            // Update user
            user.username = username;
            if (typeof isAdmin !== 'undefined') {
                user.isAdmin = isAdmin;
            }
            await user.save();

            // Log user update
            await Log.createLog('USER_UPDATED', req.user.id, {
                updatedUserId: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            }, req);

            res.json({
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            });

        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    },

    // Delete user
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            // Don't allow deleting the default admin
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            if (user.username === 'Administrador') {
                return res.status(403).json({ error: 'Não é permitido excluir o usuário Administrador' });
            }

            await user.deleteOne();

            // Log user deletion
            await Log.createLog('USER_DELETED', req.user.id, {
                deletedUserId: id,
                username: user.username
            }, req);

            res.json({ message: 'Usuário excluído com sucesso' });

        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ error: 'Erro ao excluir usuário' });
        }
    },

    // Reset user password
    resetPassword: async (req, res) => {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            if (user.username === 'Administrador') {
                return res.status(403).json({ error: 'Não é permitido redefinir a senha do usuário Administrador' });
            }

            user.password = newPassword;
            user.forcePasswordChange = true;
            await user.save();

            // Log password reset
            await Log.createLog('USER_PASSWORD_RESET', req.user.id, {
                resetUserId: id,
                username: user.username
            }, req);

            res.json({ message: 'Senha redefinida com sucesso' });

        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ error: 'Erro ao redefinir senha' });
        }
    },

    // Toggle admin status
    toggleAdmin: async (req, res) => {
        try {
            const { id } = req.params;

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            if (user.username === 'Administrador') {
                return res.status(403).json({ error: 'Não é permitido modificar o status de admin do usuário Administrador' });
            }

            user.isAdmin = !user.isAdmin;
            await user.save();

            // Log admin status change
            await Log.createLog(
                user.isAdmin ? 'USER_ADMIN_GRANTED' : 'USER_ADMIN_REVOKED',
                req.user.id,
                {
                    targetUserId: id,
                    username: user.username
                },
                req
            );

            res.json({
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            });

        } catch (error) {
            console.error('Toggle admin error:', error);
            res.status(500).json({ error: 'Erro ao alterar status de administrador' });
        }
    }
};

module.exports = userController;
