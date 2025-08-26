/**
 * 🚀 API PRINCIPAL PARA VERCEL - CAR WASH TYPESHI (MySQL)
 * Usa base de datos MySQL
 * URL: https://car-wash-typeshi.vercel.app/api/
 */

const db = require('../database-mysql');

// Inicializar base de datos al cargar el módulo
let dbInitialized = false;

async function ensureDbInitialized() {
    if (!dbInitialized) {
        console.log('🔄 Inicializando base de datos MySQL...');
        const success = await db.initializeDatabase();
        if (success) {
            dbInitialized = true;
            console.log('✅ Base de datos MySQL lista');
        } else {
            console.error('❌ Error al inicializar MySQL');
            throw new Error('Database initialization failed');
        }
    }
}

// Función principal del handler
module.exports = async (req, res) => {
    console.log('🚀 [API MySQL] Procesando:', req.method, req.url);
    
    try {
        // Asegurar que la base de datos esté inicializada
        await ensureDbInitialized();
        
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
            const services = await db.getServices();
            res.status(200).json({
                status: 'SUCCESS',
                message: 'Car Wash Typeshi - Sistema funcionando correctamente con MySQL',
                timestamp: new Date().toISOString(),
                environment: 'production',
                version: '2.0.0',
                database: 'MySQL',
                services: services.length
            });
            return;
        }
        
        // Endpoint: Servicios disponibles
        if (path.includes('/services') || query?.endpoint?.includes('services')) {
            const services = await db.getServices();
            res.status(200).json({
                status: 'SUCCESS',
                message: 'Servicios obtenidos exitosamente',
                data: {
                    services: services,
                    count: services.length
                },
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // Endpoint: Obtener todas las reservas
        if (path.includes('/bookings') && method === 'GET') {
            const bookings = await db.getBookings();
            res.status(200).json({
                status: 'SUCCESS',
                message: 'Reservas obtenidas exitosamente',
                data: {
                    bookings: bookings,
                    count: bookings.length
                },
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // Endpoint: Crear nueva reserva
        if (path.includes('/bookings') && method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', async () => {
                try {
                    const bookingData = JSON.parse(body);
                    
                    // Validar datos requeridos
                    const requiredFields = ['name', 'email', 'phone', 'booking_date', 'time_slot', 'start_time', 'end_time', 'service_id', 'total_amount'];
                    const missingFields = requiredFields.filter(field => !bookingData[field]);
                    
                    if (missingFields.length > 0) {
                        res.status(400).json({
                            status: 'ERROR',
                            message: `Campos requeridos faltantes: ${missingFields.join(', ')}`,
                            timestamp: new Date().toISOString()
                        });
                        return;
                    }
                    
                    // Verificar que el servicio existe
                    const service = await db.getServiceById(bookingData.service_id);
                    if (!service) {
                        res.status(400).json({
                            status: 'ERROR',
                            message: 'Servicio no encontrado',
                            timestamp: new Date().toISOString()
                        });
                        return;
                    }
                    
                    // Verificar disponibilidad del horario
                    const isAvailable = await db.checkTimeSlotAvailability(
                        bookingData.booking_date,
                        bookingData.start_time,
                        bookingData.end_time
                    );
                    
                    if (!isAvailable) {
                        res.status(409).json({
                            status: 'ERROR',
                            message: 'El horario seleccionado no está disponible',
                            timestamp: new Date().toISOString()
                        });
                        return;
                    }
                    
                    // Crear la reserva
                    const newBooking = await db.createBooking(bookingData);
                    
                    res.status(201).json({
                        status: 'SUCCESS',
                        message: 'Reserva creada exitosamente',
                        data: {
                            booking: newBooking,
                            service: service
                        },
                        timestamp: new Date().toISOString()
                    });
                    
                } catch (error) {
                    console.error('❌ Error al procesar reserva:', error);
                    res.status(500).json({
                        status: 'ERROR',
                        message: 'Error interno del servidor al crear reserva',
                        timestamp: new Date().toISOString()
                    });
                }
            });
            return;
        }
        
        // Endpoint: Actualizar estado de reserva
        if (path.includes('/bookings/') && method === 'PUT') {
            const bookingId = path.split('/bookings/')[1].split('/')[0];
            
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', async () => {
                try {
                    const { status } = JSON.parse(body);
                    
                    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
                        res.status(400).json({
                            status: 'ERROR',
                            message: 'Estado inválido',
                            timestamp: new Date().toISOString()
                        });
                        return;
                    }
                    
                    const updated = await db.updateBookingStatus(bookingId, status);
                    
                    if (updated) {
                        res.status(200).json({
                            status: 'SUCCESS',
                            message: 'Estado de reserva actualizado',
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        res.status(404).json({
                            status: 'ERROR',
                            message: 'Reserva no encontrada',
                            timestamp: new Date().toISOString()
                        });
                    }
                    
                } catch (error) {
                    console.error('❌ Error al actualizar reserva:', error);
                    res.status(500).json({
                        status: 'ERROR',
                        message: 'Error interno del servidor',
                        timestamp: new Date().toISOString()
                    });
                }
            });
            return;
        }
        
        // Endpoint: Eliminar reserva
        if (path.includes('/bookings/') && method === 'DELETE') {
            const bookingId = path.split('/bookings/')[1].split('/')[0];
            
            const deleted = await db.deleteBooking(bookingId);
            
            if (deleted) {
                res.status(200).json({
                    status: 'SUCCESS',
                    message: 'Reserva eliminada exitosamente',
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(404).json({
                    status: 'ERROR',
                    message: 'Reserva no encontrada',
                    timestamp: new Date().toISOString()
                });
            }
            return;
        }
        
        // Endpoint: Obtener reservas por fecha
        if (path.includes('/bookings/date/') && method === 'GET') {
            const date = path.split('/bookings/date/')[1];
            const bookings = await db.getBookingsByDate(date);
            
            res.status(200).json({
                status: 'SUCCESS',
                message: `Reservas para ${date} obtenidas exitosamente`,
                data: {
                    bookings: bookings,
                    count: bookings.length,
                    date: date
                },
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // Endpoint: Verificar disponibilidad
        if (path.includes('/availability') && method === 'GET') {
            const { date, start_time, end_time } = query;
            
            if (!date || !start_time || !end_time) {
                res.status(400).json({
                    status: 'ERROR',
                    message: 'Parámetros requeridos: date, start_time, end_time',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            
            const isAvailable = await db.checkTimeSlotAvailability(date, start_time, end_time);
            
            res.status(200).json({
                status: 'SUCCESS',
                message: 'Disponibilidad verificada',
                data: {
                    available: isAvailable,
                    date: date,
                    time_slot: `${start_time}-${end_time}`
                },
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // Endpoint no encontrado
        res.status(404).json({
            status: 'ERROR',
            message: 'Endpoint no encontrado',
            available_endpoints: [
                'GET /api/status',
                'GET /api/services',
                'GET /api/bookings',
                'POST /api/bookings',
                'PUT /api/bookings/{id}',
                'DELETE /api/bookings/{id}',
                'GET /api/bookings/date/{date}',
                'GET /api/availability'
            ],
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error en API:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
};
