/**
 * Versión frontend de timeSlots.js
 * Contiene la misma lógica pero adaptada para ser usada en el navegador
 */

// Configuración de horarios (evitar conflictos con otras declaraciones)
if (typeof BUSINESS_HOURS === 'undefined') {
    var BUSINESS_HOURS = {
        1: { open: '08:30', close: '17:00' }, // Lunes
        2: { open: '08:30', close: '17:00' }, // Martes
        3: { open: '08:30', close: '17:00' }, // Miércoles
    4: { open: '08:30', close: '17:00' }, // Jueves
    5: { open: '08:30', close: '17:00' }, // Viernes
    6: { open: '08:30', close: '12:30' }, // Sábado
    0: null // Domingo cerrado
};

// Duración fija para todos los servicios (90 minutos)
const SLOT_DURATION = 90;

// Horarios específicos para días de semana
const WEEKDAY_SLOTS = [
    // Mañana
    { start: '08:30', end: '10:00' },
    { start: '10:00', end: '11:30' },
    { start: '11:30', end: '13:00' },
    // Pausa para almuerzo de 13:00 a 14:00
    // Tarde
    { start: '14:00', end: '15:30' },
    { start: '15:30', end: '17:00' }
];

// Horarios específicos para sábados
const SATURDAY_SLOTS = [
    { start: '08:30', end: '10:00' },
    { start: '10:00', end: '11:30' },
    { start: '11:30', end: '12:30' }
];

/**
 * Genera los slots de tiempo para una fecha específica
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {Array} - Slots de tiempo disponibles
 */
function generateTimeSlotsClient(date) {
    // Asegurarse de que date sea un objeto Date válido
    const inputDate = new Date(date + 'T00:00:00');
    console.log('DEBUG - Generando slots para fecha:', inputDate.toISOString());
    console.log('DEBUG - Día de la semana:', inputDate.getDay());

    const dayOfWeek = inputDate.getDay();
    
    // Verificar si el negocio está cerrado ese día
    if (!BUSINESS_HOURS[dayOfWeek]) {
        console.log('DEBUG - El negocio está cerrado este día');
        return { data: [] };
    }
    
    // Obtener horarios según el día de la semana
    const slots = dayOfWeek === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS;

    // Crear slots de tiempo con estructura consistente
    const formattedSlots = slots.map(slot => ({
        time: `${slot.start} - ${slot.end}`,
        start: slot.start,
        end: slot.end,
        isBooked: false,
        duration: SLOT_DURATION
    }));

    return { data: formattedSlots };
}

/**
 * Obtiene el horario de atención para un día específico
 * @param {number} dayOfWeek - Día de la semana (0-6, donde 0 es domingo)
 * @returns {string} - Horario de atención formateado
 */
function getBusinessHoursForDay(dayOfWeek) {    const hours = BUSINESS_HOURS[dayOfWeek];
    if (!hours) return 'Cerrado';
    return `${hours.open} a ${hours.close}`;
}
}

console.log('⏰ TimeSlots Client cargado correctamente');
