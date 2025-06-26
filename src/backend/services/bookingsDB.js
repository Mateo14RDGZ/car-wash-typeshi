const { Booking } = require('../../database/init');
const { generateTimeSlots, SLOT_DURATION } = require('./timeSlots');
const emailService = require('./emailService');
const { Op } = require('sequelize');

// Función para obtener horarios disponibles para una fecha
async function getAvailableTimeSlots(date) {
    try {
        // Validar formato de fecha
        if (!date || !date.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
            console.error('DEBUG - Formato de fecha inválido:', date);
            throw new Error('Formato de fecha inválido. Debe ser YYYY-MM-DD');
        }

        console.log('DEBUG - Procesando solicitud para fecha:', date);

        const requestedDate = new Date(date + 'T00:00:00');
        if (isNaN(requestedDate.getTime())) {
            console.error('DEBUG - La fecha no es válida después de convertir a objeto Date:', date);
            throw new Error('La fecha proporcionada no es válida');
        }

        // Generar todos los slots posibles
        const allSlots = generateTimeSlots(date);
        if (!allSlots || allSlots.length === 0) {
            console.log('DEBUG - No hay slots disponibles para el día seleccionado');
            return [];
        }

        // Configurar rango de fechas para la consulta
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);

        let bookings = [];
        try {
            bookings = await Booking.findAll({
                where: {
                    date: {
                        [Op.between]: [startOfDay, endOfDay]
                    },
                    status: {
                        [Op.ne]: 'cancelled'
                    }
                }
            });
            console.log('DEBUG - Reservas encontradas para la fecha:', bookings.length);
        } catch (dbQueryError) {
            console.error('DEBUG - Error al consultar reservas en la base de datos:', dbQueryError);
            // En caso de error de BD, usamos los slots predefinidos
            const dayOfWeek = requestedDate.getDay();
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                return allSlots;
            } else if (dayOfWeek === 6) {
                return allSlots;
            } else {
                return [];
            }
        }

        // Si no hay reservas, todos los slots están disponibles
        if (!bookings.length) {
            return allSlots;
        }

        // Crear un Set con los horarios ocupados para búsqueda más rápida
        const bookedTimesSet = new Set();
        bookings.forEach(booking => {
            try {
                const bookingTime = new Date(booking.date);
                const bookingHour = bookingTime.getHours().toString().padStart(2, '0');
                const bookingMinute = bookingTime.getMinutes().toString().padStart(2, '0');
                const bookingTimeStr = `${bookingHour}:${bookingMinute}`;
                bookedTimesSet.add(bookingTimeStr);
            } catch (error) {
                console.error('DEBUG - Error al procesar reserva:', error);
            }
        });

        // Filtrar slots disponibles
        const availableSlots = allSlots.filter(slot => {
            return !bookedTimesSet.has(slot.start);
        });

        return availableSlots;
    } catch (error) {
        console.error('Error al obtener slots disponibles:', error);
        try {
            const requestDate = new Date(date + 'T00:00:00');
            const dayOfWeek = requestDate.getDay();
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                const slots = generateTimeSlots(date);
                if (slots && slots.length > 0) {
                    return slots;
                }
            } else if (dayOfWeek === 6) {
                const slots = generateTimeSlots(date);
                if (slots && slots.length > 0) {
                    return slots;
                }
            } else {
                return [];
            }
        } catch (fallbackError) {
            console.error('Error en el fallback de horarios:', fallbackError);
            return [];
        }
        return [];
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
async function cancelBooking(clientName, date) {
    try {
        // Buscar la reserva por nombre del cliente y fecha
        const bookingDate = new Date(date);
        const startOfDay = new Date(bookingDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(bookingDate);
        endOfDay.setHours(23, 59, 59, 999);

        const booking = await Booking.findOne({
            where: {
                clientName: clientName,
                date: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: {
                    [Op.ne]: 'cancelled' // Solo buscar reservas que no estén ya canceladas
                }
            }
        });
        
        if (!booking) {
            throw new Error('No se encontró una reserva activa para el cliente especificado en la fecha indicada');
        }

        // Enviar correo de notificación de cancelación antes de cancelar
        try {
            await emailService.sendBookingCancellation(booking.toJSON(), 'Cancelación solicitada por el cliente');
            console.log('✅ Notificación de cancelación enviada al administrador');
        } catch (emailError) {
            console.error('❌ Error al enviar notificación de cancelación:', emailError);
            // Continuar con la cancelación aunque falle el email
        }

        // Actualizar el estado de la reserva a cancelada
        await booking.update({ status: 'cancelled' });
        
        console.log(`✅ Reserva cancelada exitosamente - ID: ${booking.id}, Cliente: ${clientName}`);
        
        return { 
            message: 'Reserva cancelada exitosamente',
            booking: booking.toJSON()
        };
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
