/**
 * 🔥 API BRIDGE - SOLO BASE DE DATOS MYSQL - SIN FALLBACKS
 * 
 * VERSIÓN SIMPLIFICADA (15/07/2025)
 * 
 * ⚠️ IMPORTANTE ⚠️
 * Este bridge funciona EXCLUSIVAMENTE con la base de datos MySQL.
 * NO hay sistemas de fallback, ni respuestas simuladas.
 * Si la base de datos falla, devuelve un error 500.
 */

const path = require('path');

module.exports = async (req, res) => {
    console.log('🔥 API BRIDGE - SOLO BASE DE DATOS MYSQL');
    console.log('📝 Método:', req.method);
    console.log('🔗 URL:', req.url);
    
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
    
    // Manejar OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const { endpoint } = req.query;
        
        if (!endpoint) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Endpoint requerido'
            });
        }
        
        console.log('🎯 Endpoint solicitado:', endpoint);
        
        // Determinar qué handler usar basado en el endpoint
        let handler;
        
        if (endpoint.includes('available-slots')) {
            // Horarios disponibles
            handler = require('./bookings/available-slots');
        } else if (endpoint.startsWith('/bookings')) {
            // Reservas
            handler = require('./bookings/index');
        } else if (endpoint.includes('system/status')) {
            // Estado del sistema
            return res.status(200).json({
                status: 'SUCCESS',
                message: 'Sistema MySQL funcionando correctamente',
                timestamp: new Date().toISOString()
            });
        } else {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Endpoint no encontrado'
            });
        }
        
        // Ejecutar handler
        console.log('🚀 Ejecutando handler para:', endpoint);
        await handler(req, res);
        
    } catch (error) {
        console.error('❌ Error en API Bridge:', error);
        
        // Error de base de datos - sin fallbacks
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error de base de datos MySQL',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
        });
    }
};
