/**
 * 🚀 API PRINCIPAL PARA VERCEL - CAR WASH TYPESHI
 * Usa base de datos en memoria (no requiere MySQL)
 * URL: https://car-wash-typeshi.vercel.app/api/
 */

const db = require('../database-memory');

// Función principal del handler
module.exports = async (req, res) => {
    console.log('🚀 [API] Procesando:', req.method, req.url);
    
    try {
        // Configurar CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
        res.setHeader('Content-Type', 'application/json');
        
        // Manejar preflight requests
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }
        
        const { url, method, query } = req;
        const path = url.split('?')[0];
        
        // Endpoint: Estado del sistema
        if (path.includes('/status') || query?.endpoint?.includes('status')) {
            const services = db.getServices();
            res.status(200).json({
                status: 'SUCCESS',
                message: 'Car Wash Typeshi - Sistema funcionando correctamente',
                timestamp: new Date().toISOString(),
                environment: 'production',
                version: '1.0.0',
                database: 'Memoria (sin MySQL)',
                services: services.length
            });
            return;
        }
        
        // Endpoint: Servicios disponibles
        if (path.includes('/services') || query?.endpoint?.includes('services')) {
            const services = db.getServices();
            res.status(200).json({
                status: 'SUCCESS',
                message: 'Servicios obtenidos exitosamente',
                data: {
                    services: services
                }
            });
            return;
        }
        
        // Endpoint: Horarios disponibles
        if (path.includes('/available-slots') || query?.endpoint?.includes('available-slots')) {
            const date = query?.date || new URLSearchParams(url.split('?')[1] || '').get('date');
            
            if (!date) {
                res.status(400).json({
                    status: 'ERROR',
                    message: 'Fecha requerida (formato: YYYY-MM-DD)'
                });
                return;
            }
            
            const availableSlots = db.getAvailableSlots(date);
            
            res.status(200).json({
                status: 'SUCCESS',
                message: 'Horarios obtenidos exitosamente',
                data: {
                    date: date,
                    availableSlots: availableSlots,
                    totalSlots: availableSlots.length,
                    availableCount: availableSlots.filter(s => s.available).length
                }
            });
            return;
        }
        
        // Endpoint: Reservas
        if (path.includes('/bookings') || query?.endpoint?.includes('bookings')) {
            if (method === 'GET') {
                const bookings = db.getAllBookings();
                res.status(200).json({
                    status: 'SUCCESS',
                    message: 'Reservas obtenidas exitosamente',
                    data: {
                        bookings: bookings
                    }
                });
                return;
            }
            
            if (method === 'POST') {
                let body = '';
                
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                
                req.on('end', async () => {
                    try {
                        const bookingData = JSON.parse(body);
                        const newBooking = db.createBooking(bookingData);
                        
                        res.status(201).json({
                            status: 'SUCCESS',
                            message: 'Reserva creada exitosamente',
                            data: {
                                booking: newBooking
                            }
                        });
                    } catch (error) {
                        res.status(400).json({
                            status: 'ERROR',
                            message: error.message
                        });
                    }
                });
                return;
            }
        }
        
        // Endpoint no encontrado
        res.status(404).json({
            status: 'ERROR',
            message: 'Endpoint no encontrado',
            availableEndpoints: [
                'GET /api/status',
                'GET /api/services',
                'GET /api/available-slots?date=YYYY-MM-DD',
                'GET /api/bookings',
                'POST /api/bookings'
            ]
        });
        
    } catch (error) {
        console.error('❌ [API] Error:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
