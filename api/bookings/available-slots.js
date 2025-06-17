// API Route para Vercel - Horarios Disponibles

// Configuración de horarios (copiada del backend)
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

function generateTimeSlots(date) {
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

    let slots = [];

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        slots = WEEKDAY_SLOTS.map(slot => ({
            time: `${slot.start} - ${slot.end}`,
            start: slot.start,
            end: slot.end,
            isBooked: false,
            duration: SLOT_DURATION
        }));
    } else if (dayOfWeek === 6) {
        slots = SATURDAY_SLOTS.map(slot => ({
            time: `${slot.start} - ${slot.end}`,
            start: slot.start,
            end: slot.end,
            isBooked: false,
            duration: SLOT_DURATION
        }));
    }
    
    return slots;
}

export default async function handler(req, res) {
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
    
    try {
        const { date } = req.query;
        
        console.log('Vercel - Solicitud de horarios para fecha:', date);
        
        if (!date) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Se requiere una fecha'
            });
        }
        
        // Validar formato de fecha
        if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Formato de fecha inválido. Debe ser YYYY-MM-DD'
            });
        }
        
        // Generar horarios disponibles usando la misma lógica que el servidor local
        const availableSlots = generateTimeSlots(date);
        
        console.log('Vercel - Slots generados:', availableSlots.length);
        
        return res.status(200).json({
            status: 'SUCCESS',
            data: availableSlots || []
        });
        
    } catch (error) {
        console.error('Vercel - Error al obtener horarios:', error);
        
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
