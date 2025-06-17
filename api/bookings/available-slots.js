// API Route para Vercel - Horarios Disponibles
const { generateTimeSlots } = require('../../src/backend/services/timeSlots');

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
