/**
 * 🔥 AVAILABLE SLOTS - VERCEL OPTIMIZADO
 * 
 * Versión simplificada que funciona en Vercel sin dependencias complejas
 */

module.exports = async (req, res) => {
    console.log('>>> [AVAILABLE SLOTS VERCEL] Iniciando');
    
    try {
        // Configurar CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
        console.log('📅 Fecha solicitada:', date);
        
        // Verificar si la fecha es válida
        if (!date) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Fecha requerida'
            });
        }
        
        // Obtener día de la semana (0 = domingo, 6 = sábado)
        const requestDate = new Date(date);
        const dayOfWeek = requestDate.getDay();
        
        console.log('📅 Día de la semana:', dayOfWeek);
        
        // Verificar si es domingo (cerrado)
        if (dayOfWeek === 0) {
            return res.status(200).json({
                status: 'SUCCESS',
                message: 'Horarios obtenidos exitosamente',
                data: {
                    date: date,
                    availableSlots: [],
                    message: 'Cerrado los domingos'
                }
            });
        }
        
        // Horarios base
        let baseSlots = [];
        
        if (dayOfWeek === 6) { // Sábado
            baseSlots = [
                { start: '08:30', end: '10:00' },
                { start: '10:00', end: '11:30' },
                { start: '11:30', end: '13:00' }
            ];
        } else { // Lunes a Viernes
            baseSlots = [
                { start: '08:30', end: '10:00' },
                { start: '10:00', end: '11:30' },
                { start: '11:30', end: '13:00' },
                { start: '14:00', end: '15:30' },
                { start: '15:30', end: '17:00' }
            ];
        }
        
        // Intentar conectar a la base de datos para obtener reservas reales
        let availableSlots = [];
        
        try {
            // Intentar importar la configuración de base de datos
            const { Booking } = require('../../src/database/init');
            const { Op } = require('sequelize');
            
            const startOfDay = new Date(date + 'T00:00:00');
            const endOfDay = new Date(date + 'T23:59:59');
            
            const existingBookings = await Booking.findAll({
                where: {
                    date: { [Op.between]: [startOfDay, endOfDay] }
                }
            });
            
            // Verificar disponibilidad real
            availableSlots = baseSlots.map(slot => {
                const isBooked = existingBookings.some(booking => 
                    booking.timeSlot === `${slot.start}-${slot.end}`
                );
                
                return {
                    ...slot,
                    available: !isBooked,
                    timeSlot: `${slot.start}-${slot.end}`
                };
            });
            
            console.log('✅ Horarios obtenidos de la base de datos');
            
        } catch (dbError) {
            console.log('⚠️ Error de base de datos, usando horarios predeterminados:', dbError.message);
            
            // Fallback: todos los horarios disponibles
            availableSlots = baseSlots.map(slot => ({
                ...slot,
                available: true,
                timeSlot: `${slot.start}-${slot.end}`
            }));
        }
        
        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Horarios obtenidos exitosamente',
            data: {
                date: date,
                dayOfWeek: dayOfWeek,
                availableSlots: availableSlots,
                totalSlots: availableSlots.length,
                availableCount: availableSlots.filter(s => s.available).length
            }
        });
        
    } catch (error) {
        console.error('❌ Error en available-slots:', error);
        
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};
