const express = require('express');
const router = express.Router();
const bookingService = require('../services/bookingsDB');

// Configuración de horarios
const BUSINESS_HOURS = {
    1: { open: '08:30', close: '17:00' }, // Lunes
    2: { open: '08:30', close: '17:00' }, // Martes
    3: { open: '08:30', close: '17:00' }, // Miércoles
    4: { open: '08:30', close: '17:00' }, // Jueves
    5: { open: '08:30', close: '17:00' }, // Viernes
    6: { open: '08:30', close: '12:30' }, // Sábado
    0: null // Domingo cerrado
};

const CONTACT_INFO = {
    whatsapp: '098385709',
    email: 'info@extremewash.com'
};

// Función para validar horario
function isWithinBusinessHours(date) {
    const bookingDate = new Date(date);
    const day = bookingDate.getDay();
    const hours = bookingDate.getHours();
    const minutes = bookingDate.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    console.log('DEBUG - isWithinBusinessHours - Fecha recibida:', date);
    console.log('DEBUG - isWithinBusinessHours - Fecha parseada:', bookingDate);
    console.log('DEBUG - isWithinBusinessHours - Día de la semana:', day);
    console.log('DEBUG - isWithinBusinessHours - Hora:', hours, 'Minutos:', minutes);

    // Verificar si es domingo
    if (day === 0) {
        console.log('DEBUG - isWithinBusinessHours - Es domingo, rechazando');
        return {
            isValid: false,
            message: 'Lo sentimos, no abrimos los domingos.'
        };
    }

    // Verificar si es un día válido (lunes a sábado)
    if (day < 1 || day > 6) {
        console.log('DEBUG - isWithinBusinessHours - Día inválido:', day);
        return {
            isValid: false,
            message: 'Día no válido para reservas'
        };
    }

    const dayHours = BUSINESS_HOURS[day];
    if (!dayHours) {
        console.log('DEBUG - isWithinBusinessHours - No hay horarios configurados para el día:', day);
        return {
            isValid: false,
            message: 'Horario no disponible para este día'
        };
    }

    const [openHour, openMinute] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = dayHours.close.split(':').map(Number);

    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;

    console.log('DEBUG - isWithinBusinessHours - Horario de apertura (minutos):', openTimeInMinutes);
    console.log('DEBUG - isWithinBusinessHours - Horario de cierre (minutos):', closeTimeInMinutes);
    console.log('DEBUG - isWithinBusinessHours - Hora actual (minutos):', timeInMinutes);

    if (timeInMinutes < openTimeInMinutes || timeInMinutes > closeTimeInMinutes) {
        const horario = day === 6 ? '8:30 a 12:30' : '8:30 a 17:00';
        return {
            isValid: false,
            message: `Lo sentimos, nuestro horario de atención es de ${horario}`
        };
    }

    return {
        isValid: true
    };
}

// Almacenamiento temporal de reservas
const bookings = [];

// Obtener horarios disponibles para una fecha
router.get('/available-slots', (req, res) => {
    try {
        const { date } = req.query;
        console.log('Solicitud de horarios para fecha:', date);

        if (!date) {
            console.log('Error: No se proporcionó fecha');
            return res.status(400).json({
                status: 'ERROR',
                message: 'Se requiere una fecha'
            });
        }

        const availableSlots = bookingService.getAvailableTimeSlots(date);
        console.log('Slots disponibles encontrados:', availableSlots.length);
        console.log('Slots:', availableSlots);

        res.json({
            status: 'SUCCESS',
            data: availableSlots
        });
    } catch (error) {
        console.error('Error al obtener horarios disponibles:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener horarios disponibles: ' + error.message
        });
    }
});

// Crear una nueva reserva
router.post('/', async (req, res) => {
    try {
        const {
            clientName,
            date,
            vehicleType,
            vehiclePlate,
            serviceType,
            price,
            notes
        } = req.body;

        // Validar campos requeridos
        if (!clientName || !date || !vehicleType || !serviceType) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Faltan campos requeridos'
            });
        }

        const newBooking = bookingService.createBooking({
            clientName,
            date,
            vehicleType,
            vehiclePlate,
            serviceType,
            price,
            notes
        });

        res.status(201).json({
            status: 'SUCCESS',
            message: 'Reserva creada exitosamente',
            data: newBooking
        });
    } catch (error) {
        console.error('Error al crear la reserva:', error);
        res.status(error.message.includes('no está disponible') ? 400 : 500).json({
            status: 'ERROR',
            message: error.message || 'Error al crear la reserva'
        });
    }
});

// Obtener todas las reservas
router.get('/', (req, res) => {
    try {
        const { date } = req.query;
        const bookings = date
            ? bookingService.getBookingsByDate(date)
            : bookingService.getAllBookings();

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

// Cancelar una reserva
router.delete('/', (req, res) => {
    try {
        const bookingId = req.body.bookingId;
        bookingService.cancelBooking(bookingId);
        res.json({
            status: 'SUCCESS',
            message: 'Reserva cancelada exitosamente'
        });
    } catch (error) {
        console.error('Error al cancelar la reserva:', error);
        res.status(error.message.includes('no encontrada') ? 404 : 500).json({
            status: 'ERROR',
            message: error.message || 'Error al cancelar la reserva'
        });
    }
});

module.exports = router;
