// API Route para Vercel - Horarios Disponibles
// 🔥 VERSIÓN DEFINITIVA - SOLO BASE DE DATOS MYSQL

const { Op } = require('sequelize');
const { Booking } = require('../../src/database/init');

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

// Función para generar horarios base
function generateBaseTimeSlots(date) {
    console.log('📋 Generando horarios base para:', date);
    
    if (!date || typeof date !== 'string') {
        console.error('❌ Fecha inválida:', date);
        return [];
    }
    
    const inputDate = new Date(date + 'T00:00:00');
    
    if (isNaN(inputDate.getTime())) {
        console.error('❌ Fecha no válida:', date);
        return [];
    }

    const dayOfWeek = inputDate.getDay();
    console.log('📅 Día de la semana:', dayOfWeek);
    
    if (!BUSINESS_HOURS.hasOwnProperty(dayOfWeek) || !BUSINESS_HOURS[dayOfWeek]) {
        console.log('⚠️ No hay horarios de atención para el día:', dayOfWeek);
        return [];
    }

    const selectedSlots = dayOfWeek === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS;
    console.log('🕒 Horarios seleccionados:', selectedSlots.length);
    
    return selectedSlots.map(slot => ({
        start: slot.start,
        end: slot.end,
        time: `${slot.start} - ${slot.end}`,
        date: date,
        duration: 90,
        isBooked: false // Por defecto no reservado
    }));
}

// Función para obtener horarios ocupados de la base de datos
async function getBookedSlots(date) {
    console.log('🔍 Consultando horarios ocupados en MySQL para:', date);
    
    try {
        const startOfDay = new Date(date + 'T00:00:00');
        const endOfDay = new Date(date + 'T23:59:59');

        console.log('📅 Rango de consulta:');
        console.log('  - Inicio:', startOfDay.toISOString());
        console.log('  - Fin:', endOfDay.toISOString());

        const bookings = await Booking.findAll({
            where: {
                date: { [Op.between]: [startOfDay, endOfDay] },
                status: { [Op.in]: ['confirmed', 'pending', 'in_progress'] }
            },
            attributes: ['date', 'status', 'clientName', 'serviceType'],
            raw: true
        });
        
        console.log('📊 Reservas encontradas:', bookings.length);
        
        if (bookings.length === 0) {
            console.log('✅ No hay reservas - todos los horarios están disponibles');
            return [];
        }

        const bookedTimes = bookings.map(booking => {
            const bookingDate = new Date(booking.date);
            const hours = String(bookingDate.getHours()).padStart(2, '0');
            const minutes = String(bookingDate.getMinutes()).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;
            
            console.log(`📍 Reserva: ${booking.clientName} - ${formattedTime} - ${booking.serviceType}`);
            
            return formattedTime;
        });

        console.log('⏰ Horarios ocupados:', bookedTimes);
        return bookedTimes;

    } catch (error) {
        console.error('❌ Error al consultar base de datos MySQL:', error);
        throw error; // Re-lanzar error para que el handler principal lo maneje
    }
}

// Función principal para generar horarios con disponibilidad
async function generateAvailableSlots(date) {
    console.log('🚀 Generando horarios disponibles para:', date);
    
    try {
        // Generar horarios base
        const baseSlots = generateBaseTimeSlots(date);
        
        if (baseSlots.length === 0) {
            console.log('⚠️ No hay horarios base para esta fecha');
            return [];
        }

        // Obtener horarios ocupados
        const bookedTimes = await getBookedSlots(date);
        
        // Marcar horarios como ocupados
        const slotsWithAvailability = baseSlots.map(slot => {
            const isBooked = bookedTimes.includes(slot.start);
            
            console.log(`📍 ${slot.time}: ${isBooked ? '🔒 OCUPADO' : '🟢 DISPONIBLE'}`);
            
            return {
                ...slot,
                isBooked: isBooked
            };
        });

        const totalSlots = slotsWithAvailability.length;
        const bookedSlots = slotsWithAvailability.filter(s => s.isBooked).length;
        const availableSlots = totalSlots - bookedSlots;

        console.log('📊 RESUMEN:');
        console.log(`  📋 Total: ${totalSlots}`);
        console.log(`  🔒 Ocupados: ${bookedSlots}`);
        console.log(`  🟢 Disponibles: ${availableSlots}`);

        return slotsWithAvailability;

    } catch (error) {
        console.error('❌ Error al generar horarios:', error);
        throw error;
    }
}

// Handler principal de la API
module.exports = async (req, res) => {
    console.log('>>> [API AVAILABLE-SLOTS] Iniciando - SOLO MYSQL');
    
    try {
        // Configurar CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
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
        
        if (!date) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Fecha requerida'
            });
        }
        
        if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Formato de fecha inválido. Usar YYYY-MM-DD'
            });
        }
        
        console.log('🎯 Procesando solicitud para fecha:', date);
        
        // Generar horarios con disponibilidad desde MySQL
        const availableSlots = await generateAvailableSlots(date);
        
        console.log('✅ Horarios generados exitosamente:', availableSlots.length);
        
        return res.status(200).json({
            status: 'SUCCESS',
            data: availableSlots,
            message: 'Horarios obtenidos desde base de datos MySQL',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error en API available-slots:', error);
        
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error al consultar horarios en base de datos MySQL',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
        });
    }
};
