const express = require('express');
const router = express.Router();
const bookingService = require('../services/bookingsDB');

// Obtener horarios disponibles para una fecha
router.get('/available-slots', async (req, res) => {
    try {
        const { date } = req.query;
        console.log('Solicitud de horarios para fecha:', date);

        if (!date) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Se requiere una fecha',
                error: {
                    code: '400',
                    message: 'Se requiere una fecha para obtener los horarios disponibles'
                }
            });
        }

        try {
            const availableSlots = await bookingService.getAvailableTimeSlots(date);
            
            res.json({
                status: 'SUCCESS',
                data: availableSlots || []
            });
        } catch (serviceError) {
            console.error('Error en el servicio de horarios:', serviceError);
            res.status(500).json({
                status: 'ERROR',
                message: 'Error al procesar los horarios disponibles',
                error: {
                    code: '500',
                    message: serviceError.message || 'Error interno del servidor'
                }
            });
        }
    } catch (error) {
        console.error('Error general al obtener horarios disponibles:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener horarios disponibles',
            error: {
                code: '500',
                message: 'A server error has occurred'
            }
        });
    }
});

// Crear una nueva reserva
router.post('/', async (req, res) => {
    try {
        const {
            clientName,
            clientPhone,
            date,
            vehicleType,
            vehiclePlate,
            serviceType,
            price,
            extras,
            notes
        } = req.body;

        // Validar campos requeridos
        if (!clientName || !date || !vehicleType || !serviceType || !price) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Faltan campos requeridos'
            });
        }

        const newBooking = await bookingService.createBooking({
            clientName,
            clientPhone,
            date,
            vehicleType,
            vehiclePlate,
            serviceType,
            price,
            extras,
            notes
        });

        res.status(201).json({
            status: 'SUCCESS',
            message: 'Reserva creada exitosamente',
            data: newBooking
        });
    } catch (error) {
        console.error('Error al crear la reserva:', error);
        const statusCode = error.message.includes('no está disponible') || 
                          error.message.includes('no atendemos') ? 400 : 500;
        res.status(statusCode).json({
            status: 'ERROR',
            message: error.message || 'Error al crear la reserva'
        });
    }
});

// Obtener todas las reservas o por fecha
router.get('/', async (req, res) => {
    try {
        const { date } = req.query;
        const bookings = date
            ? await bookingService.getBookingsByDate(date)
            : await bookingService.getAllBookings();

        res.json({
            status: 'SUCCESS',
            data: bookings
        });
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener las reservas'
        });
    }
});

// Obtener estadísticas
router.get('/stats', async (req, res) => {
    try {
        const stats = await bookingService.getBookingStats();
        res.json({
            status: 'SUCCESS',
            data: stats
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener estadísticas'
        });
    }
});

// Obtener una reserva específica
router.get('/:id', async (req, res) => {
    try {
        const { Booking } = require('../../database/init');
        const booking = await Booking.findByPk(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Reserva no encontrada'
            });
        }

        res.json({
            status: 'SUCCESS',
            data: booking
        });
    } catch (error) {
        console.error('Error al obtener la reserva:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener la reserva'
        });
    }
});

// Actualizar el estado de una reserva
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const { Booking } = require('../../database/init');
        
        if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Estado inválido'
            });
        }

        const booking = await Booking.findByPk(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Reserva no encontrada'
            });
        }

        await booking.update({ status });

        res.json({
            status: 'SUCCESS',
            message: 'Estado actualizado exitosamente',
            data: booking
        });
    } catch (error) {
        console.error('Error al actualizar el estado:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al actualizar el estado'
        });
    }
});

// Cancelar una reserva
// Cancelar una reserva
router.delete('/', async (req, res) => {
    try {
        const { clientName, date } = req.body;
        if (!clientName || !date) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Se requiere el nombre del cliente y la fecha de la reserva'
            });
        }
        await bookingService.cancelBooking(clientName, date);
        
        res.json({
            status: 'SUCCESS',
            message: 'Reserva cancelada exitosamente'
        });
    } catch (error) {
        console.error('Error al cancelar la reserva:', error);
        res.status(error.message.includes('no encontró') ? 404 : 500).json({
            status: 'ERROR',
            message: error.message || 'Error al cancelar la reserva'
        });
    }
});

module.exports = router;