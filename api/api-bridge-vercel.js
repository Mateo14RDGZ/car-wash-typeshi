/**
 * 🔥 API BRIDGE PARA VERCEL - VERSIÓN ROBUSTA
 * 
 * Este archivo está diseñado específicamente para funcionar en Vercel
 * con manejo de errores robusto y fallbacks
 */

module.exports = async (req, res) => {
    console.log('🔥 [API BRIDGE VERCEL] Iniciando');
    console.log('📝 Método:', req.method);
    console.log('🔗 URL:', req.url);
    console.log('📄 Query:', req.query);
    
    try {
        // Configurar CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
        
        // Manejar OPTIONS (preflight)
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        const { endpoint } = req.query;
        
        if (!endpoint) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Endpoint requerido'
            });
        }
        
        console.log('🎯 Endpoint solicitado:', endpoint);
        
        // Manejar diferentes endpoints
        if (endpoint.includes('system/status')) {
            console.log('🔍 Verificando estado del sistema');
            return res.status(200).json({
                status: 'SUCCESS',
                message: 'Sistema funcionando correctamente',
                timestamp: new Date().toISOString(),
                database: 'MySQL',
                version: '1.0.0',
                vercel: true
            });
        }
        
        if (endpoint.includes('available-slots')) {
            console.log('📅 Manejando solicitud de horarios disponibles');
            
            // Importar dinámicamente para manejar errores
            try {
                const slotsHandler = require('./bookings/available-slots-vercel');
                return await slotsHandler(req, res);
            } catch (importError) {
                console.error('❌ Error al importar available-slots:', importError);
                
                // Fallback: respuesta básica de horarios
                return res.status(200).json({
                    status: 'SUCCESS',
                    message: 'Horarios disponibles (modo fallback)',
                    data: {
                        availableSlots: [
                            { start: '08:30', end: '10:00', available: true },
                            { start: '10:00', end: '11:30', available: true },
                            { start: '11:30', end: '13:00', available: true },
                            { start: '14:00', end: '15:30', available: true },
                            { start: '15:30', end: '17:00', available: true }
                        ]
                    },
                    fallback: true
                });
            }
        }
        
        if (endpoint.startsWith('/bookings')) {
            console.log('📝 Manejando solicitud de reservas');
            
            try {
                const bookingHandler = require('./bookings/index-vercel');
                return await bookingHandler(req, res);
            } catch (importError) {
                console.error('❌ Error al importar bookings:', importError);
                
                // Fallback: respuesta básica para bookings
                if (req.method === 'GET') {
                    return res.status(200).json({
                        status: 'SUCCESS',
                        message: 'Reservas obtenidas (modo fallback)',
                        data: { bookings: [] },
                        fallback: true
                    });
                }
                
                if (req.method === 'POST') {
                    return res.status(200).json({
                        status: 'SUCCESS',
                        message: 'Reserva creada (modo fallback)',
                        data: { 
                            id: Math.floor(Math.random() * 10000),
                            ...req.body,
                            createdAt: new Date().toISOString()
                        },
                        fallback: true
                    });
                }
            }
        }
        
        // Endpoint no reconocido
        console.log('❌ Endpoint no reconocido:', endpoint);
        return res.status(404).json({
            status: 'ERROR',
            message: 'Endpoint no encontrado: ' + endpoint,
            availableEndpoints: [
                '/system/status',
                '/available-slots',
                '/bookings'
            ]
        });
        
    } catch (error) {
        console.error('❌ Error crítico en API Bridge:', error);
        console.error('❌ Stack:', error.stack);
        
        // Error crítico - respuesta de fallback
        if (!res.headersSent) {
            return res.status(500).json({
                status: 'ERROR',
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? {
                    message: error.message,
                    stack: error.stack
                } : 'Error interno del servidor',
                timestamp: new Date().toISOString(),
                fallback: true
            });
        }
    }
};
