// Configuración de horarios
const BUSINESS_HOURS = {
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

function generateTimeSlots(date) {
    // Asegurarse de que date sea un objeto Date válido
    const inputDate = new Date(date + 'T00:00:00');
    console.log('DEBUG - Generando slots para fecha:', inputDate.toISOString());
    console.log('DEBUG - String de fecha recibido:', date);
    console.log('DEBUG - Día de la semana:', inputDate.getDay());
    console.log('DEBUG - Fecha local:', inputDate.toLocaleString());

    // Validar que la fecha sea válida
    if (isNaN(inputDate.getTime())) {
        console.error('DEBUG - Fecha inválida recibida en generateTimeSlots');
        return [];
    }

    // Obtener el día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const dayOfWeek = inputDate.getDay();
    console.log('DEBUG - Día de la semana (número):', dayOfWeek);

    // Validar que haya horarios para ese día
    if (!BUSINESS_HOURS[dayOfWeek]) {
        console.log('DEBUG - No hay horarios de atención para este día');
        return [];
    }

    // Si es día de semana (Lunes a Viernes)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        console.log('DEBUG - Generando slots para día entre semana (Lunes a Viernes)');
        const slots = [];

        // Usar los slots predefinidos para días de semana
        for (const slot of WEEKDAY_SLOTS) {
            slots.push({
                time: `${slot.start} - ${slot.end}`,
                start: slot.start,
                end: slot.end,
                isBooked: false,
                duration: SLOT_DURATION
            });

            console.log('DEBUG - Slot generado:', slot.start, '-', slot.end);
        }

        console.log('DEBUG - Total de slots generados:', slots.length);
        return slots;
    }

    // Para sábados
    if (dayOfWeek === 6) {
        console.log('DEBUG - Generando slots para sábado');
        const slots = [];

        // Usar los slots predefinidos para sábados
        for (const slot of SATURDAY_SLOTS) {
            slots.push({
                time: `${slot.start} - ${slot.end}`,
                start: slot.start,
                end: slot.end,
                isBooked: false,
                duration: SLOT_DURATION
            });

            console.log('DEBUG - Slot generado para sábado:', slot.start, '-', slot.end);
        }

        console.log('DEBUG - Total de slots generados para sábado:', slots.length);
        return slots;
    }

    console.log('DEBUG - No se generaron slots para este día');
    return [];
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