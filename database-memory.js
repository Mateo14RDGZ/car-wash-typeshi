/**
 * 🗄️ BASE DE DATOS EN MEMORIA - CAR WASH TYPESHI
 * Sistema que simula una base de datos MySQL usando datos en memoria
 * No requiere conexión externa
 */

// Datos de servicios disponibles
const services = [
    {
        id: 1,
        name: 'Lavado Básico',
        service_type: 'basico',
        price: 15.00,
        duration: 90,
        description: 'Lavado exterior e interior básico',
        active: true,
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        name: 'Lavado Completo',
        service_type: 'completo',
        price: 25.00,
        duration: 120,
        description: 'Lavado completo con encerado',
        active: true,
        created_at: new Date().toISOString()
    },
    {
        id: 3,
        name: 'Lavado Premium',
        service_type: 'premium',
        price: 35.00,
        duration: 150,
        description: 'Lavado premium con tratamiento especial',
        active: true,
        created_at: new Date().toISOString()
    }
];

// Datos de reservas (simuladas)
let bookings = [
    {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan@ejemplo.com',
        phone: '123-456-7890',
        booking_date: '2025-07-25',
        time_slot: '09:00-10:30',
        start_time: '09:00',
        end_time: '10:30',
        service_id: 1,
        status: 'pending',
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        name: 'María García',
        email: 'maria@ejemplo.com',
        phone: '098-765-4321',
        booking_date: '2025-07-25',
        time_slot: '14:00-15:30',
        start_time: '14:00',
        end_time: '15:30',
        service_id: 2,
        status: 'confirmed',
        created_at: new Date().toISOString()
    },
    {
        id: 3,
        name: 'Carlos López',
        email: 'carlos@ejemplo.com',
        phone: '555-123-4567',
        booking_date: '2025-07-26',
        time_slot: '10:00-11:30',
        start_time: '10:00',
        end_time: '11:30',
        service_id: 3,
        status: 'pending',
        created_at: new Date().toISOString()
    },
    {
        id: 4,
        name: 'Ana Martínez',
        email: 'ana@ejemplo.com',
        phone: '777-888-9999',
        booking_date: '2025-07-26',
        time_slot: '15:30-17:00',
        start_time: '15:30',
        end_time: '17:00',
        service_id: 1,
        status: 'cancelled',
        created_at: new Date().toISOString()
    }
];

// Función para generar horarios disponibles
function generateTimeSlots(date) {
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay();
    
    let slots = [];
    
    if (dayOfWeek === 0) { // Domingo - Cerrado
        slots = [];
    } else if (dayOfWeek === 6) { // Sábado
        slots = [
            { start: '08:30', end: '10:00', timeSlot: '08:30-10:00' },
            { start: '10:00', end: '11:30', timeSlot: '10:00-11:30' },
            { start: '11:30', end: '13:00', timeSlot: '11:30-13:00' }
        ];
    } else { // Lunes a Viernes
        slots = [
            { start: '08:30', end: '10:00', timeSlot: '08:30-10:00' },
            { start: '10:00', end: '11:30', timeSlot: '10:00-11:30' },
            { start: '11:30', end: '13:00', timeSlot: '11:30-13:00' },
            { start: '14:00', end: '15:30', timeSlot: '14:00-15:30' },
            { start: '15:30', end: '17:00', timeSlot: '15:30-17:00' }
        ];
    }
    
    return slots;
}

// Función para obtener servicios
function getServices() {
    return services.filter(service => service.active);
}

// Función para obtener reservas por fecha
function getBookingsByDate(date) {
    return bookings.filter(booking => 
        booking.booking_date === date && 
        booking.status !== 'cancelled'
    );
}

// Función para obtener todas las reservas
function getAllBookings() {
    return bookings.map(booking => {
        const service = services.find(s => s.id === booking.service_id);
        return {
            ...booking,
            service_name: service ? service.name : 'Servicio no encontrado',
            service_price: service ? service.price : 0
        };
    });
}

// Función para crear una nueva reserva
function createBooking(bookingData) {
    const { name, email, phone, date, timeSlot, serviceType } = bookingData;
    
    // Validar datos
    if (!name || !email || !phone || !date || !timeSlot || !serviceType) {
        throw new Error('Datos incompletos para crear la reserva');
    }
    
    // Buscar servicio
    const service = services.find(s => s.service_type === serviceType && s.active);
    if (!service) {
        throw new Error('Servicio no encontrado');
    }
    
    // Verificar disponibilidad
    const existingBooking = bookings.find(b => 
        b.booking_date === date && 
        b.time_slot === timeSlot && 
        b.status !== 'cancelled'
    );
    
    if (existingBooking) {
        throw new Error('Horario no disponible');
    }
    
    // Crear nueva reserva
    const newBooking = {
        id: bookings.length + 1,
        name,
        email,
        phone,
        booking_date: date,
        time_slot: timeSlot,
        start_time: timeSlot.split('-')[0],
        end_time: timeSlot.split('-')[1],
        service_id: service.id,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    return newBooking;
}

// Función para confirmar una reserva
function confirmBooking(bookingId) {
    const booking = bookings.find(b => b.id === parseInt(bookingId));
    if (!booking) {
        throw new Error('Reserva no encontrada');
    }
    
    booking.status = 'confirmed';
    booking.updated_at = new Date().toISOString();
    return booking;
}

// Función para cancelar una reserva
function cancelBooking(bookingId) {
    const booking = bookings.find(b => b.id === parseInt(bookingId));
    if (!booking) {
        throw new Error('Reserva no encontrada');
    }
    
    booking.status = 'cancelled';
    booking.updated_at = new Date().toISOString();
    return booking;
}

// Función para obtener horarios disponibles
function getAvailableSlots(date) {
    const allSlots = generateTimeSlots(date);
    const bookedSlots = getBookingsByDate(date).map(booking => booking.time_slot);
    
    return allSlots.map(slot => ({
        ...slot,
        available: !bookedSlots.includes(slot.timeSlot)
    }));
}

module.exports = {
    services,
    bookings,
    getServices,
    getBookingsByDate,
    getAllBookings,
    createBooking,
    confirmBooking,
    cancelBooking,
    getAvailableSlots,
    generateTimeSlots
};
