const { generateTimeSlots, formatTimeSlot, SLOT_DURATION, VEHICLE_DURATIONS } = require('./timeSlots');
const emailService = require('./emailService');

// Almacenamiento temporal de reservas (en memoria)
let bookings = [];

// Función para obtener horarios disponibles para una fecha
function getAvailableTimeSlots(date) {
    console.log('DEBUG - getAvailableTimeSlots - Fecha recibida:', date);

    // Asegurarse de que la fecha se maneje en la zona horaria local
    const requestedDate = new Date(date + 'T00:00:00');
    console.log('DEBUG - getAvailableTimeSlots - Fecha parseada:', requestedDate);
    console.log('DEBUG - getAvailableTimeSlots - Día de la semana:', requestedDate.getDay());

    const allSlots = generateTimeSlots(date);
    console.log('DEBUG - getAvailableTimeSlots - Total de slots generados:', allSlots.length);

    // Filtrar los horarios que ya están reservados
    const bookedTimes = bookings
        .filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate.toDateString() === requestedDate.toDateString();
        })
        .map(booking => {
            const bookingTime = new Date(booking.date);
            const duration = SLOT_DURATION;
            const endTime = new Date(bookingTime.getTime() + duration * 60000);
            return {
                start: bookingTime.getTime(),
                end: endTime.getTime()
            };
        });

    console.log('DEBUG - getAvailableTimeSlots - Reservas encontradas para esta fecha:', bookedTimes.length);

    // Filtrar slots que no se solapan con reservas existentes
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

        if (!isAvailable) {
            console.log('DEBUG - Slot no disponible:', slot.time);
        }

        return isAvailable;
    });

    console.log('DEBUG - getAvailableTimeSlots - Slots disponibles después de filtrar:', availableSlots.length);
    return availableSlots;
}

// Función para crear una nueva reserva
async function createBooking(bookingData) {
    console.log('DEBUG - createBooking - Datos recibidos:', bookingData);

    // Asegurarse de que la fecha se maneje en la zona horaria local
    const date = new Date(bookingData.date);
    console.log('DEBUG - createBooking - Fecha parseada:', date);
    console.log('DEBUG - createBooking - Fecha local:', date.toLocaleString());
    console.log('DEBUG - createBooking - Día de la semana:', date.getDay());
    console.log('DEBUG - createBooking - getTimezoneOffset:', date.getTimezoneOffset());

    // Obtener el día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const dayOfWeek = date.getDay();

    // Validar que no sea domingo
    if (dayOfWeek === 0) {
        console.log('DEBUG - createBooking - Rechazando por ser domingo');
        throw new Error('Lo sentimos, no atendemos los domingos');
    }

    // Validar que sea un día válido (lunes a sábado)
    if (dayOfWeek < 1 || dayOfWeek > 6) {
        console.log('DEBUG - createBooking - Rechazando por día inválido:', dayOfWeek);
        throw new Error('Día no válido para reservas');
    }

    // Formatear la fecha para buscar slots disponibles
    const dateStr = date.toISOString().split('T')[0];
    console.log('DEBUG - createBooking - Buscando slots para fecha:', dateStr);

    // Obtener la hora del slot
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeSlot = `${hours}:${minutes}`;
    console.log('DEBUG - createBooking - Time slot formateado:', timeSlot);

    const availableSlots = getAvailableTimeSlots(dateStr);
    console.log('DEBUG - createBooking - Slots disponibles encontrados:', availableSlots.length);
    console.log('DEBUG - createBooking - Slots:', availableSlots);

    // Verificar si el horario está disponible
    const isSlotAvailable = availableSlots.some(slot => {
        const slotStartTime = slot.start;
        const matches = slotStartTime === timeSlot;
        console.log('DEBUG - createBooking - Comparando slot:', slotStartTime, 'con timeSlot:', timeSlot, 'resultado:', matches);
        return matches;
    });

    if (!isSlotAvailable) {
        console.log('DEBUG - createBooking - Horario no disponible');
        throw new Error('El horario seleccionado no está disponible');
    }

    console.log('DEBUG - createBooking - Horario disponible, creando reserva');

    const newBooking = {
        id: Date.now(),
        ...bookingData,
        createdAt: new Date()
    };

    bookings.push(newBooking);
    console.log('DEBUG - createBooking - Reserva creada exitosamente:', newBooking);

    // Enviar correo de confirmación
    try {
        await emailService.sendBookingConfirmation(newBooking);
    } catch (error) {
        console.error('Error al enviar correo de confirmación:', error);
        // No lanzamos el error para que la reserva se complete aunque falle el correo
    }

    return newBooking;
}

// Función para obtener todas las reservas
function getAllBookings() {
    return bookings;
}

// Función para obtener reservas por fecha
function getBookingsByDate(date) {
    const requestedDate = new Date(date + 'T00:00:00');
    return bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate.toDateString() === requestedDate.toDateString();
    });
}

// Función para cancelar una reserva
async function cancelBooking(bookingId) {
    const index = bookings.findIndex(booking => booking.id === bookingId);
    if (index === -1) {
        throw new Error('Reserva no encontrada');
    }
    
    const booking = bookings[index];
    
    // Enviar correo de notificación de cancelación
    try {
        await emailService.sendBookingCancellation(booking, 'Cancelación solicitada por el cliente');
        console.log('✅ Notificación de cancelación enviada al administrador');
    } catch (emailError) {
        console.error('❌ Error al enviar notificación de cancelación:', emailError);
        // Continuar con la cancelación aunque falle el email
    }
    
    // Eliminar la reserva del array
    bookings.splice(index, 1);
    console.log(`✅ Reserva cancelada exitosamente - ID: ${bookingId}`);
    
    return { 
        message: 'Reserva cancelada exitosamente',
        booking: booking
    };
}

module.exports = {
    getAvailableTimeSlots,
    createBooking,
    getAllBookings,
    getBookingsByDate,
    cancelBooking
}; 