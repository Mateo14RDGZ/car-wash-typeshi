/**
 * Versión frontend de timeSlots.js
 * Contiene la misma lógica pero adaptada para ser usada en el navegador
 */

// Configuración de horarios (usar window para evitar conflictos)
if (typeof window !== 'undefined' && typeof window.BUSINESS_HOURS === 'undefined') {
    window.BUSINESS_HOURS = {
        1: { open: '08:30', close: '17:00' }, // Lunes
        2: { open: '08:30', close: '17:00' }, // Martes
        3: { open: '08:30', close: '17:00' }, // Miércoles
        4: { open: '08:30', close: '17:00' }, // Jueves
        5: { open: '08:30', close: '17:00' }, // Viernes
        6: { open: '08:30', close: '12:30' }, // Sábado
        0: null // Domingo cerrado
    };
}

const SLOT_DURATION = 90; // minutos

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

/**
 * Genera los slots de tiempo para un día específico
 * @param {Date} date - La fecha para la cual generar los slots
 * @returns {Array} - Array de slots disponibles
 */
function generateTimeSlots(date) {
    const dayOfWeek = date.getDay();
    
    // No hay slots para domingo
    if (dayOfWeek === 0) {
        return [];
    }
    
    // Usar slots de sábado o día de semana
    const slots = dayOfWeek === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS;
    
    return slots.map(slot => ({
        time: `${slot.start} - ${slot.end}`,
        start: slot.start,
        end: slot.end,
        duration: SLOT_DURATION,
        isBooked: false
    }));
}

/**
 * Verifica si un día específico está abierto
 * @param {number} dayOfWeek - Día de la semana (0-6, donde 0 es domingo)
 * @returns {boolean} - true si está abierto, false si no
 */
function isBusinessDay(dayOfWeek) {
    return window.BUSINESS_HOURS && window.BUSINESS_HOURS[dayOfWeek] !== null;
}

/**
 * Obtiene el horario de atención para un día específico
 * @param {number} dayOfWeek - Día de la semana (0-6, donde 0 es domingo)
 * @returns {string} - Horario de atención formateado
 */
function getBusinessHoursForDay(dayOfWeek) {
    const hours = window.BUSINESS_HOURS && window.BUSINESS_HOURS[dayOfWeek];
    if (!hours) return 'Cerrado';
    return `${hours.open} a ${hours.close}`;
}

// Exportar funciones a window para uso global
if (typeof window !== 'undefined') {
    window.generateTimeSlots = generateTimeSlots;
    window.isBusinessDay = isBusinessDay;
    window.getBusinessHoursForDay = getBusinessHoursForDay;
}

console.log('⏰ TimeSlots Client cargado correctamente');
