const express = require('express');
const router = express.Router();
const User = require('../../database/models/User');

// Obtener perfil del usuario
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Actualizar perfil del usuario
router.put('/profile/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const { name, phone } = req.body;
        await user.update({ name, phone });

        res.json({
            message: 'Perfil actualizado exitosamente',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Obtener lista de lavadores disponibles (solo admin)
router.get('/washers', async (req, res) => {
    try {
        const washers = await User.findAll({
            where: {
                role: 'washer',
                active: true
            },
            attributes: ['id', 'name', 'phone']
        });

        res.json(washers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Cambiar estado de actividad del usuario (solo admin)
router.patch('/:id/status', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const { active } = req.body;
        await user.update({ active });

        res.json({
            message: 'Estado del usuario actualizado exitosamente',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                active: user.active
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router; 