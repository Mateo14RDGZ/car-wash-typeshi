/**
 * 🔍 DIAGNÓSTICO VERCEL - VERSIÓN ULTRA SIMPLIFICADA
 * 
 * Este archivo es una versión minimalista para diagnosticar problemas de deployment
 */

module.exports = async (req, res) => {
    console.log('🔍 [DIAGNÓSTICO VERCEL] Iniciando diagnóstico...');
    
    try {
        // Configurar CORS básico
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Manejar OPTIONS
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        console.log('📝 Método recibido:', req.method);
        console.log('🔗 URL recibida:', req.url);
        console.log('📄 Query params:', req.query);
        
        // Información del sistema
        const systemInfo = {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
        
        console.log('💻 System Info:', systemInfo);
        
        // Verificar variables de entorno básicas
        const envCheck = {
            NODE_ENV: process.env.NODE_ENV || 'undefined',
            hasVercelEnv: !!process.env.VERCEL,
            hasVercelUrl: !!process.env.VERCEL_URL
        };
        
        console.log('🔧 Environment Check:', envCheck);
        
        // Verificar dependencias básicas
        const dependencies = {};
        
        try {
            dependencies.path = require('path') ? 'available' : 'missing';
        } catch (e) {
            dependencies.path = 'error: ' + e.message;
        }
        
        try {
            dependencies.fs = require('fs') ? 'available' : 'missing';
        } catch (e) {
            dependencies.fs = 'error: ' + e.message;
        }
        
        console.log('📦 Dependencies Check:', dependencies);
        
        const { endpoint } = req.query;
        
        // Manejo de endpoints
        if (endpoint === '/system/status' || endpoint === 'system/status') {
            return res.status(200).json({
                status: 'SUCCESS',
                message: 'Sistema de diagnóstico funcionando',
                data: {
                    system: systemInfo,
                    environment: envCheck,
                    dependencies: dependencies,
                    endpoint: endpoint,
                    diagnosticMode: true
                }
            });
        }
        
        if (endpoint === '/available-slots' || endpoint === 'available-slots') {
            return res.status(200).json({
                status: 'SUCCESS',
                message: 'Endpoint de horarios (modo diagnóstico)',
                data: {
                    slots: [
                        { start: '08:30', end: '10:00', available: true },
                        { start: '10:00', end: '11:30', available: true },
                        { start: '11:30', end: '13:00', available: true }
                    ],
                    diagnosticMode: true
                }
            });
        }
        
        if (endpoint === '/bookings' || endpoint === 'bookings') {
            if (req.method === 'GET') {
                return res.status(200).json({
                    status: 'SUCCESS',
                    message: 'Endpoint de reservas GET (modo diagnóstico)',
                    data: {
                        bookings: [],
                        diagnosticMode: true
                    }
                });
            }
            
            if (req.method === 'POST') {
                return res.status(200).json({
                    status: 'SUCCESS',
                    message: 'Endpoint de reservas POST (modo diagnóstico)',
                    data: {
                        booking: {
                            id: 'diag-' + Date.now(),
                            ...req.body,
                            diagnosticMode: true
                        }
                    }
                });
            }
        }
        
        // Endpoint no especificado o desconocido
        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Diagnóstico Vercel - Funcionando correctamente',
            data: {
                receivedEndpoint: endpoint || 'none',
                system: systemInfo,
                environment: envCheck,
                dependencies: dependencies,
                availableEndpoints: [
                    '/system/status',
                    '/available-slots',
                    '/bookings'
                ],
                diagnosticMode: true
            }
        });
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
        
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error en diagnóstico',
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            },
            diagnosticMode: true
        });
    }
};
