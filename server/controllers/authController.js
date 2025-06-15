const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Log = require('../models/Log');

const authController = {
    // Login user
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Find user
            const user = await User.findOne({ username });
            if (!user) {
                await Log.createLog('USER_LOGIN_FAILED', null, { username, reason: 'User not found' }, req);
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                await Log.createLog('USER_LOGIN_FAILED', user._id, { reason: 'Invalid password' }, req);
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Create token
            const token = jwt.sign(
                { 
                    id: user._id,
                    username: user.username,
                    isAdmin: user.isAdmin
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Log successful login
            await Log.createLog('USER_LOGIN', user._id, { username: user.username }, req);

            // Return user info and token
            res.json({
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    isAdmin: user.isAdmin,
                    forcePasswordChange: user.forcePasswordChange
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Erro ao fazer login' });
        }
    },

    // Change password
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Verify current password
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({ error: 'Senha atual incorreta' });
            }

            // Update password
            user.password = newPassword;
            user.forcePasswordChange = false;
            await user.save();

            // Log password change
            await Log.createLog('USER_PASSWORD_CHANGED', user._id, {}, req);

            res.json({ message: 'Senha alterada com sucesso' });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ error: 'Erro ao alterar senha' });
        }
    },

    // Verify token
    verifyToken: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(500).json({ error: 'Erro ao verificar token' });
        }
    }
};

module.exports = authController;
