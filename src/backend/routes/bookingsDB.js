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

        // Validar formato de fecha YYYY-MM-DD
        if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Formato de fecha inválido',
                error: {
                    code: '400',
                    message: 'El formato de fecha debe ser YYYY-MM-DD'
                }
            });
        }

        try {
            const availableSlots = await bookingService.getAvailableTimeSlots(date);
            
            // Asegurarnos de que siempre devolvemos un array, incluso si es vacío
            const slotsToReturn = Array.isArray(availableSlots) ? availableSlots : [];
            
            res.json({
                status: 'SUCCESS',
                data: slotsToReturn
            });
        } catch (serviceError) {
            console.error('Error en el servicio de horarios:', serviceError);
            
            // Intentar recuperar slots predeterminados en caso de error
            try {
                const requestDate = new Date(date + 'T00:00:00');
                const dayOfWeek = requestDate.getDay();
                
                // Si es un día válido, devolver una respuesta con slots vacíos en lugar de error
                if (dayOfWeek >= 1 && dayOfWeek <= 6) {
                    return res.json({
                        status: 'SUCCESS',
                        data: [],
                        message: 'No hay horarios disponibles para esta fecha'
                    });
                } else {
                    // Si es domingo, indicar que no hay servicio
                    return res.json({
                        status: 'SUCCESS',
                        data: [],
                        message: 'No hay servicio disponible para este día'
                    });
                }
            } catch (fallbackError) {
                // Si todo falla, devolver un error estándar
                return res.status(500).json({
                    status: 'ERROR',
                    message: 'Error al procesar los horarios disponibles',
                    error: {
                        code: '500',
                        message: serviceError.message || 'Error interno del servidor'
                    }
                });
            }
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