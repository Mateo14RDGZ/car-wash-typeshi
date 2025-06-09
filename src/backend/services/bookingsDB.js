const { Booking } = require('../../database/init');
const { generateTimeSlots, SLOT_DURATION } = require('./timeSlots');
const emailService = require('./emailService');
const { Op } = require('sequelize');

// Función para obtener horarios disponibles para una fecha
async function getAvailableTimeSlots(date) {
    console.log('DEBUG - getAvailableTimeSlots - Fecha recibida:', date);

    const requestedDate = new Date(date + 'T00:00:00');
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('DEBUG - getAvailableTimeSlots - Buscando reservas entre:', startOfDay, 'y', endOfDay);

    try {
        // Obtener todas las reservas del día desde la base de datos
        const bookings = await Booking.findAll({
            where: {
                date: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: {
                    [Op.ne]: 'cancelled' // No incluir reservas canceladas
                }
            }
        });

        console.log('DEBUG - getAvailableTimeSlots - Reservas encontradas:', bookings.length);

        // Generar todos los slots posibles
        const allSlots = generateTimeSlots(date);
        console.log('DEBUG - getAvailableTimeSlots - Total de slots generados:', allSlots.length);

        // Crear un mapa de horarios ocupados
        const bookedTimes = bookings.map(booking => {
            const bookingTime = new Date(booking.date);
            const duration = SLOT_DURATION;
            const endTime = new Date(bookingTime.getTime() + duration * 60000);
            return {
                start: bookingTime.getTime(),
                end: endTime.getTime()
            };
        });

        // Filtrar slots disponibles
        const availableSlots = allSlots.filter(slot => {
            const [startHour, startMinute] = slot.start.split(':').map(Number);
            const slotStart = new Date(requestedDate);
            slotStart.setHours(startHour, startMinute, 0, 0);
            const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION * 60000);

            // Verificar que el slot no se solapa con ninguna reserva existente
            const isAvailable = !bookedTimes.some(bookedTime =>
                (slotStart.getTime() >= bookedTime.start && slotStart.getTime() < bookedTime.end) ||
                (slotEnd.getTime() > bookedTime.start && slotEnd.getTime() <= bookedTime.end)
            );

            return isAvailable;
        });

        console.log('DEBUG - getAvailableTimeSlots - Slots disponibles:', availableSlots.length);
        return availableSlots;

    } catch (error) {
        console.error('Error al obtener slots disponibles:', error);
        throw error;
    }
}

// Función para crear una nueva reserva
async function createBooking(bookingData) {
    console.log('DEBUG - createBooking - Datos recibidos:', bookingData);

    const date = new Date(bookingData.date);
    const dayOfWeek = date.getDay();

    // Validaciones
    if (dayOfWeek === 0) {
        throw new Error('Lo sentimos, no atendemos los domingos');
    }

    if (dayOfWeek < 1 || dayOfWeek > 6) {
        throw new Error('Día no válido para reservas');
    }

    try {
        // Verificar disponibilidad del horario
        const dateStr = date.toISOString().split('T')[0];
        const availableSlots = await getAvailableTimeSlots(dateStr);
        
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const timeSlot = `${hours}:${minutes}`;

        const isSlotAvailable = availableSlots.some(slot => slot.start === timeSlot);

        if (!isSlotAvailable) {
            throw new Error('El horario seleccionado no está disponible');
        }

        // Crear la reserva en la base de datos
        const newBooking = await Booking.create({
            clientName: bookingData.clientName,
            clientPhone: bookingData.clientPhone || null,
            date: bookingData.date,
            vehicleType: bookingData.vehicleType,
            vehiclePlate: bookingData.vehiclePlate,
            serviceType: bookingData.serviceType,
            extras: bookingData.extras || [],
            price: bookingData.price,
            notes: bookingData.notes || null,
            status: 'confirmed'
        });

        console.log('DEBUG - createBooking - Reserva creada en BD:', newBooking.id);

        // Enviar correo de confirmación
        try {
            await emailService.sendBookingConfirmation(newBooking.toJSON());
        } catch (error) {
            console.error('Error al enviar correo de confirmación:', error);
        }

        const booking = newBooking.toJSON();
        return booking;

    } catch (error) {
        console.error('Error al crear reserva:', error);
        throw error;
    }
}

// Función para obtener todas las reservas
async function getAllBookings() {
    try {
        const bookings = await Booking.findAll({
            order: [['date', 'DESC']]
        });
        return bookings.map(b => b.toJSON());
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        throw error;
    }
}

// Función para obtener reservas por fecha
async function getBookingsByDate(date) {
    try {
        const requestedDate = new Date(date + 'T00:00:00');
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await Booking.findAll({
            where: {
                date: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            order: [['date', 'ASC']]
        });

        return bookings.map(b => b.toJSON());
    } catch (error) {
        console.error('Error al obtener reservas por fecha:', error);
        throw error;
    }
}

// Función para cancelar una reserva
async function cancelBooking(bookingId) {
    try {
        const booking = await Booking.findByPk(bookingId);
        
        if (!booking) {
            throw new Error('Reserva no encontrada');
        }

        await booking.update({ status: 'cancelled' });
        
        return { message: 'Reserva cancelada exitosamente' };
    } catch (error) {
        console.error('Error al cancelar reserva:', error);
        throw error;
    }
}

// Función para obtener estadísticas
async function getBookingStats() {
    try {
        const totalBookings = await Booking.count();
        const completedBookings = await Booking.count({
            where: { status: 'completed' }
        });
        const cancelledBookings = await Booking.count({
            where: { status: 'cancelled' }
        });
        const totalRevenue = await Booking.sum('price', {
            where: { status: 'completed' }
        });

        return {
            totalBookings,
            completedBookings,
            cancelledBookings,
            totalRevenue: totalRevenue || 0
        };
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        throw error;
    }
}

module.exports = {
    getAvailableTimeSlots,
    createBooking,
    getAllBookings,
    getBookingsByDate,
    cancelBooking,
    getBookingStats
};
