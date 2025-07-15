// API Route para Vercel - Horarios Disponibles

// Configuración de horarios
const BUSINESS_HOURS = {
    1: { open: '08:30', close: '17:00' }, // Lunes
    2: { open: '08:30', close: '17:00' }, // Martes
    3: { open: '08:30', close: '17:00' }, // Miércoles
    4: { open: '08:30', close: '17:00' }, // Jueves
    5: { open: '08:30', close: '17:00' }, // Viernes
    6: { open: '08:30', close: '13:00' }, // Sábado
    0: null // Domingo cerrado
};

const SLOT_DURATION = 90;

// Horarios específicos para días de semana
const WEEKDAY_SLOTS = [
    { start: '08:30', end: '10:00' },
    { start: '10:00', end: '11:30' },
    { start: '11:30', end: '13:00' },
    { start: '14:00', end: '15:30' },
    { start: '15:30', end: '17:00' }
];

// Horarios específicos para sábados
const SATURDAY_SLOTS = [
    { start: '08:30', end: '10:00' },
    { start: '10:00', end: '11:30' },
    { start: '11:30', end: '13:00' }
];

// Función para generar horarios base sin verificar reservas
function generateBaseTimeSlots(date) {
    try {
        if (!date || typeof date !== 'string') {
            console.error('DEBUG - Fecha no proporcionada o no es string:', date);
            return [];
        }
        
        const inputDate = new Date(date + 'T00:00:00');
        
        if (isNaN(inputDate.getTime())) {
            console.error('DEBUG - Fecha inválida recibida:', date);
            return [];
        }

        const dayOfWeek = inputDate.getDay();
        
        if (!BUSINESS_HOURS.hasOwnProperty(dayOfWeek) || !BUSINESS_HOURS[dayOfWeek]) {
            console.log('DEBUG - No hay horarios de atención para el día:', dayOfWeek);
            return [];
        }

        const selectedSlots = dayOfWeek === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS;
        
        return selectedSlots.map(slot => ({
            start: slot.start,
            end: slot.end,
            time: `${slot.start} - ${slot.end}`,
            date: date,
            isBooked: false // Por defecto no reservado
        }));
        
    } catch (error) {
        console.error('DEBUG - Error al generar horarios:', error);
        return [];
    }
}

// Importar modelo Booking real
const { Op } = require('sequelize');
const Booking = require('../../src/database/models/BookingSimple');

// Función para verificar horarios ocupados en la base de datos
async function checkBookedSlots(date) {
    try {
        console.log('🔍 [MEJORADO] Verificando horarios ocupados para:', date);
        
        // Crear las fechas de inicio y fin del día en la zona horaria local
        const startOfDay = new Date(date + 'T00:00:00');
        const endOfDay = new Date(date + 'T23:59:59');

        console.log('� Rango de consulta:');
        console.log('  - Inicio:', startOfDay.toISOString(), '(Local:', startOfDay.toString(), ')');
        console.log('  - Fin:', endOfDay.toISOString(), '(Local:', endOfDay.toString(), ')');

        // Buscar reservas confirmadas para la fecha
        const bookings = await Booking.findAll({
            where: {
                date: { [Op.between]: [startOfDay, endOfDay] },
                status: { [Op.in]: ['confirmed', 'pending', 'in_progress'] }
            },
            attributes: ['date', 'status', 'clientName', 'serviceType', 'vehiclePlate'],
            raw: true // Para obtener objetos planos
        });
        
        console.log('� Reservas encontradas:', bookings.length);
        
        if (bookings.length === 0) {
            console.log('✅ No hay reservas para esta fecha - todos los horarios están disponibles');
            return [];
        }

        // Procesar cada reserva con logging detallado
        const bookedTimes = bookings.map((booking, index) => {
            const bookingDate = new Date(booking.date);
            const hours = String(bookingDate.getHours()).padStart(2, '0');
            const minutes = String(bookingDate.getMinutes()).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;
            
            console.log(`📍 Reserva ${index + 1}:`);
            console.log(`   Cliente: ${booking.clientName}`);
            console.log(`   Servicio: ${booking.serviceType}`);
            console.log(`   Fecha DB: ${booking.date}`);
            console.log(`   Fecha parseada: ${bookingDate.toISOString()}`);
            console.log(`   Fecha local: ${bookingDate.toString()}`);
            console.log(`   Hora formateada: ${formattedTime}`);
            console.log(`   Status: ${booking.status}`);
            
            return formattedTime;
        });

        console.log('⏰ Horarios ocupados (lista final):', bookedTimes);
        
        return bookedTimes;

    } catch (error) {
        console.error('❌ Error al consultar base de datos:', error);
        console.error('❌ Stack:', error.stack);
        return []; // Si hay error, devolver array vacío (todos disponibles)
    }
}

// Función principal para generar horarios con verificación de disponibilidad
async function generateTimeSlotsWithAvailability(date) {
    try {
        // Generar horarios base
        const baseSlots = generateBaseTimeSlots(date);
        
        if (baseSlots.length === 0) {
            return [];
        }

        // Obtener horarios ocupados de la base de datos
        const bookedTimes = await checkBookedSlots(date);

        // Marcar horarios como ocupados
        const slotsWithAvailability = baseSlots.map(slot => {
            const slotStartTime = slot.start;
            const isBooked = bookedTimes.some(bookedTime => {
                // Verificar si el horario de inicio coincide con alguna reserva
                const matches = bookedTime === slotStartTime;
                console.log(`🔍 Comparando slot ${slotStartTime} con reserva ${bookedTime}: ${matches ? 'OCUPADO' : 'LIBRE'}`);
                return matches;
            });

            console.log(`📍 Slot ${slot.time} (${slotStartTime}): ${isBooked ? '🔒 OCUPADO' : '🟢 DISPONIBLE'}`);

            return {
                ...slot,
                isBooked: isBooked
            };
        });

        console.log('✅ Horarios procesados:', slotsWithAvailability.length, 'total');
        console.log('🔒 Horarios ocupados:', slotsWithAvailability.filter(s => s.isBooked).length);
        console.log('🟢 Horarios disponibles:', slotsWithAvailability.filter(s => !s.isBooked).length);

        return slotsWithAvailability;

    } catch (error) {
        console.error('❌ Error al generar horarios con disponibilidad:', error);
        // Si hay error, devolver horarios base sin verificación
        return generateBaseTimeSlots(date);
    }
}
module.exports = async (req, res) => {
    console.log('>>> [API BOOKINGS AVAILABLE-SLOTS] Handler ejecutado');
    try {
        // Configurar CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Manejar preflight OPTIONS
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        if (req.method !== 'GET') {
            return res.status(405).json({
                status: 'ERROR',
                message: 'Método no permitido'
            });
        }
        
        const { date } = req.query;
        console.log('🚀 Vercel - Solicitud de horarios para fecha:', date);
        if (!date) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Se requiere una fecha'
            });
        }
        if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Formato de fecha inválido. Debe ser YYYY-MM-DD'
            });
        }
        // Generar horarios disponibles con verificación de base de datos
        let availableSlots = [];
        try {
            availableSlots = await generateTimeSlotsWithAvailability(date);
        } catch (dbError) {
            console.error('❌ Error al consultar la base de datos:', dbError);
            return res.status(500).json({
                status: 'ERROR',
                message: 'Error al consultar la base de datos',
                error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
            });
        }
        console.log('✅ Vercel - Slots generados:', availableSlots.length);
        return res.status(200).json({
            status: 'SUCCESS',
            data: availableSlots || [],
            dataSource: 'mysql_database',
            message: 'Horarios cargados correctamente',
            generated: true
        });
    } catch (error) {
        console.error('❌ Vercel - Error general en handler available-slots:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno en handler available-slots',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
