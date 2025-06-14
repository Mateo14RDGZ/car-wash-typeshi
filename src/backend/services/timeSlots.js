// Configuración de horarios
const BUSINESS_HOURS = {
    1: { open: '08:30', close: '17:00' }, // Lunes
    2: { open: '08:30', close: '17:00' }, // Martes
    3: { open: '08:30', close: '17:00' }, // Miércoles
    4: { open: '08:30', close: '17:00' }, // Jueves
    5: { open: '08:30', close: '17:00' }, // Viernes
    6: { open: '08:30', close: '13:00' }, // Sábado - Actualizado para reflejar el horario hasta las 13:00
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
    { start: '11:30', end: '13:00' }
];

// Cache para almacenar slots generados por día de la semana
const slotsCache = {
    // Días de la semana (1-5)
    weekday: null,
    // Sábado (6)
    saturday: null
};

function generateTimeSlots(date) {
    // Asegurarse de que date sea un objeto Date válido
    const inputDate = new Date(date + 'T00:00:00');
    
    // Validar que la fecha sea válida
    if (isNaN(inputDate.getTime())) {
        console.error('DEBUG - Fecha inválida recibida en generateTimeSlots:', date);
        return [];
    }

    // Obtener el día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const dayOfWeek = inputDate.getDay();
    
    // Validar que haya horarios para ese día
    if (!BUSINESS_HOURS[dayOfWeek]) {
        console.log('DEBUG - No hay horarios de atención para el día:', dayOfWeek);
        return [];
    }

    // Verificar si podemos usar el cache
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && slotsCache.weekday) {
        console.log('DEBUG - Usando cache para día entre semana');
        return [...slotsCache.weekday]; // Devolver copia para evitar modificaciones
    } 
    else if (dayOfWeek === 6 && slotsCache.saturday) {
        console.log('DEBUG - Usando cache para sábado');
        return [...slotsCache.saturday]; // Devolver copia para evitar modificaciones
    }

    let slots = [];

    // Si es día de semana (Lunes a Viernes)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Usar los slots predefinidos para días de semana
        slots = WEEKDAY_SLOTS.map(slot => ({
            time: `${slot.start} - ${slot.end}`,
            start: slot.start,
            end: slot.end,
            isBooked: false,
            duration: SLOT_DURATION
        }));
        
        // Guardar en cache
        slotsCache.weekday = [...slots];
    }
    // Para sábados
    else if (dayOfWeek === 6) {
        // Usar los slots predefinidos para sábados
        slots = SATURDAY_SLOTS.map(slot => ({
            time: `${slot.start} - ${slot.end}`,
            start: slot.start,
            end: slot.end,
            isBooked: false,
            duration: SLOT_DURATION
        }));
        
        // Guardar en cache
        slotsCache.saturday = [...slots];
    }// Verificar si se generaron slots
    console.log('DEBUG - Total de slots generados:', slots.length);
    
    if (slots.length === 0) {
        console.log('DEBUG - No se generaron slots para este día');
    }
    
    return slots;
}

// Función para formatear la hora para mostrar
function formatTimeSlot(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

module.exports = {
    generateTimeSlots,
    formatTimeSlot,
    BUSINESS_HOURS,
    SLOT_DURATION
}; 