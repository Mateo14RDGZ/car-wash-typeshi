const express = require('express');
const router = express.Router();
const Service = require('../../database/models/Service');

// Obtener todos los servicios
router.get('/', async (req, res) => {
    try {
        const services = await Service.findAll({
            where: { available: true },
            order: [['price', 'ASC']]
        });
        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Obtener un servicio específico
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }
        res.json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Crear un nuevo servicio (solo admin)
router.post('/', async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            duration,
            type,
            image
        } = req.body;

        const service = await Service.create({
            name,
            description,
            price,
            duration,
            type,
            image
        });

        res.status(201).json({
            message: 'Servicio creado exitosamente',
            service
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Actualizar un servicio (solo admin)
router.put('/:id', async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        const {
            name,
            description,
            price,
            duration,
            type,
            available,
            image
        } = req.body;

        await service.update({
            name,
            description,
            price,
            duration,
            type,
            available,
            image
        });

        res.json({
            message: 'Servicio actualizado exitosamente',
            service
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Eliminar un servicio (solo admin)
router.delete('/:id', async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        await service.destroy();
        res.json({ message: 'Servicio eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router; 