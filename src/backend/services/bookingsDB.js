const { Booking } = require('../../database/init');
const { generateTimeSlots, SLOT_DURATION } = require('./timeSlots');
const emailService = require('./emailService');
const { Op } = require('sequelize');

// Función para obtener horarios disponibles para una fecha
async function getAvailableTimeSlots(date) {
    console.log('DEBUG - getAvailableTimeSlots - Fecha recibida:', date);

    try {
        // Validar formato de fecha
        if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            console.error('DEBUG - Formato de fecha inválido:', date);
            throw new Error('Formato de fecha inválido. Debe ser YYYY-MM-DD');
        }

        const requestedDate = new Date(date + 'T00:00:00');
        
        // Verificar que la fecha sea válida
        if (isNaN(requestedDate.getTime())) {
            console.error('DEBUG - Fecha inválida:', date);
            throw new Error('La fecha proporcionada no es válida');
        }
        
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);

        console.log('DEBUG - getAvailableTimeSlots - Buscando reservas entre:', startOfDay, 'y', endOfDay);

        // Verificar que exista el modelo Booking
        if (!Booking) {
            console.error('DEBUG - El modelo Booking no está definido');
            throw new Error('Error interno: Modelo no disponible');
        }
        
        // Generar todos los slots posibles primero
        const allSlots = generateTimeSlots(date);
        console.log('DEBUG - getAvailableTimeSlots - Total de slots generados:', allSlots ? allSlots.length : 0);
        
        if (!allSlots || allSlots.length === 0) {
            console.log('DEBUG - No se encontraron slots disponibles para esta fecha');
            // Devolvemos un array vacío, no undefined
            return [];
        }
        
        let bookings = [];
        
        // Obtener todas las reservas del día desde la base de datos
        try {
            bookings = await Booking.findAll({
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
        } catch (dbQueryError) {
            console.error('DEBUG - Error al consultar reservas en la base de datos:', dbQueryError);
            // Aún si hay un error consultando reservas, podemos devolver todos los slots
            // ya que no sabemos cuáles están reservados
            console.log('DEBUG - Devolviendo todos los slots debido a error en BD');
            return allSlots;
        }

        // Crear un mapa de horarios ocupados
        const bookedTimes = bookings.map(booking => {
            try {
                const bookingTime = new Date(booking.date);
                const duration = SLOT_DURATION;
                const endTime = new Date(bookingTime.getTime() + duration * 60000);
                return {
                    start: bookingTime.getTime(),
                    end: endTime.getTime()
                };
            } catch (error) {
                console.error('DEBUG - Error procesando reserva:', error, booking);
                // Si hay un error con esta reserva, la ignoramos
                return null;
            }
        }).filter(time => time !== null); // Eliminar valores null en caso de error

        console.log('DEBUG - Mapa de horarios ocupados creado:', bookedTimes.length);

        // Filtrar slots disponibles
        const availableSlots = allSlots.filter(slot => {
            try {
                // Verificar que el slot tenga los datos requeridos
                if (!slot || !slot.start) {
                    console.error('DEBUG - Slot inválido:', slot);
                    return false;
                }

                const [startHour, startMinute] = slot.start.split(':').map(Number);
                
                if (isNaN(startHour) || isNaN(startMinute)) {
                    console.error('DEBUG - Hora de inicio inválida:', slot.start);
                    return false;
                }
                
                const slotStart = new Date(requestedDate);
                slotStart.setHours(startHour, startMinute, 0, 0);
                const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION * 60000);

                // Verificar que el slot no se solapa con ninguna reserva existente
                const isAvailable = !bookedTimes.some(bookedTime =>
                    (slotStart.getTime() >= bookedTime.start && slotStart.getTime() < bookedTime.end) ||
                    (slotEnd.getTime() > bookedTime.start && slotEnd.getTime() <= bookedTime.end)
                );

                return isAvailable;
            } catch (error) {
                console.error('DEBUG - Error procesando slot:', error, slot);
                return false;
            }
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
