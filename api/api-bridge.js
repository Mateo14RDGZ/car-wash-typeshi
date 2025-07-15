/**
 * 🔥 API BRIDGE - VERSIÓN DEFINITIVA - SOLO BASE DE DATOS MYSQL
 * 
 * Este bridge funciona EXCLUSIVAMENTE con la base de datos MySQL.
 * NO hay sistemas de fallback, ni respuestas simuladas.
 * Si la base de datos falla, devuelve un error 500.
 */

module.exports = async (req, res) => {
    console.log('🔥 [API BRIDGE] SOLO MYSQL - Iniciando');
    console.log('📝 Método:', req.method);
    console.log('🔗 URL:', req.url);
    
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
        
        // Determinar qué handler usar
        let handler;
        
        if (endpoint.includes('available-slots')) {
            console.log('📅 Manejando solicitud de horarios disponibles');
            handler = require('./bookings/available-slots');
        } else if (endpoint.startsWith('/bookings')) {
            console.log('📝 Manejando solicitud de reservas');
            handler = require('./bookings/index');
        } else if (endpoint.includes('system/status')) {
            console.log('🔍 Verificando estado del sistema');
            return res.status(200).json({
                status: 'SUCCESS',
                message: 'Sistema MySQL funcionando correctamente',
                timestamp: new Date().toISOString(),
                database: 'MySQL',
                version: '1.0.0'
            });
        } else {
            console.log('❌ Endpoint no reconocido:', endpoint);
            return res.status(404).json({
                status: 'ERROR',
                message: 'Endpoint no encontrado: ' + endpoint
            });
        }
        
        // Ejecutar handler correspondiente
        console.log('🚀 Ejecutando handler para:', endpoint);
        await handler(req, res);
        
    } catch (error) {
        console.error('❌ Error crítico en API Bridge:', error);
        console.error('❌ Stack:', error.stack);
        
        // Error de base de datos - sin fallbacks
        if (!res.headersSent) {
            return res.status(500).json({
                status: 'ERROR',
                message: 'Error crítico en base de datos MySQL',
                error: process.env.NODE_ENV === 'development' ? {
                    message: error.message,
                    stack: error.stack
                } : 'Error interno del servidor',
                timestamp: new Date().toISOString()
            });
        }
    }
};
